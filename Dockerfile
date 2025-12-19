# Multi-stage Dockerfile for elegance

# -------------------------
# Stage 1: Build the web frontend
# -------------------------
FROM node:20-alpine AS web-builder

WORKDIR /app

# Copy only the web directory to keep the build context small
COPY web/ ./web/

# Change to web directory
WORKDIR /app/web

# Install pnpm globally and install dependencies
RUN npm install -g pnpm@latest && \
    pnpm install --frozen-lockfile

# Build the frontend for release mode
# This outputs to ../internal/server/dist relative to web directory
RUN pnpm run release

# -------------------------
# Stage 2: Build the Go application
# -------------------------
FROM golang:1.24-alpine AS go-builder

WORKDIR /app

# Install build dependencies
RUN apk add --no-cache git ca-certificates tzdata

# Copy go mod files first (for better caching)
COPY go.mod go.sum ./
RUN --mount=type=cache,target=/go/pkg/mod \
    go mod download

# Copy all Go source code
COPY . .

# Copy the built frontend from the previous stage
COPY --from=web-builder /app/internal/server/dist ./internal/server/dist

# Build the Go application
ARG VERSION=dev
RUN --mount=type=cache,target=/root/.cache/go-build \
    CGO_ENABLED=0 GOOS=linux go build \
    -ldflags="-w -s -X github.com/imrany/elegance/internal/version.version=${VERSION}" \
    -o elegance ./cmd/server/main.go

# -------------------------
# Stage 3: Final runtime image
# -------------------------
FROM alpine:3.21

# Install runtime dependencies
RUN set -eux && \
    apk add --no-cache ca-certificates tzdata && \
    addgroup -S elegance && \
    adduser -S elegance -G elegance && \
    rm -rf /var/cache/apk/*

WORKDIR /opt/elegance

# Copy the binary from builder stage
COPY --from=go-builder /app/elegance .

# Ensure executable
RUN chmod +x elegance

# Switch to non-root user
USER elegance

# Expose the port
EXPOSE 8082

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://localhost:8082/api/health || exit 1

# Set environment variables
ENV UPLOAD_DIR=/opt/elegance/uploads
ENV PORT=8082

LABEL org.opencontainers.image.title="Elegance" \
    org.opencontainers.image.description="Elegance is a modern, open-source, AI-driven self-hosted knowledge management and note-taking platform." \
    org.opencontainers.image.source="https://github.com/imrany/elegance"

# Start the application
ENTRYPOINT ["./elegance"]
