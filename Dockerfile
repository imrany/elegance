# Multi-stage Dockerfile for elegance
# Stage 1: Build the web frontend
FROM node:20-alpine AS web-builder

# Set up the full project structure so the relative path works correctly
WORKDIR /build

# Copy the entire project first to establish the directory structure
COPY . .

# Change to web directory and install dependencies
WORKDIR /build/web

# Install pnpm globally and install dependencies
RUN npm install -g pnpm@latest && \
    pnpm install --frozen-lockfile

# Build the frontend for release mode
# This outputs to ../internal/server/dist relative to web directory
# which maps to /build/internal/server/dist in our container
RUN pnpm run release

# Stage 2: Build the Go application
FROM golang:1.24-alpine AS go-builder

WORKDIR /app/elegance

# Install build dependencies
RUN apk add --no-cache git ca-certificates tzdata

# Copy go mod files first (for better caching)
COPY elegance/go.mod elegance/go.sum ./
RUN --mount=type=cache,target=/go/pkg/mod \
    go mod download

# Copy all Go source code
COPY elegance/ .

# Copy the built frontend from the previous stage
COPY --from=web-builder /build/internal/server/dist ./internal/server/dist

# Build the Go application
# CGO_ENABLED=0 for a static binary
# -ldflags="-w -s" to reduce binary size
ARG VERSION=dev
RUN --mount=type=cache,target=/root/.cache/go-build \
    CGO_ENABLED=0 GOOS=linux go build \
    -ldflags="-w -s -X github.com/imrany/elegance/internal/version.version=${VERSION}" \
    -o /elegance ./cmd/server/main.go

# Stage 3: Final runtime image
FROM alpine:3.19

# Install runtime dependencies
RUN set -eux && \
    apk add --no-cache ca-certificates tzdata && \
    addgroup -S elegance && \
    adduser -S elegance -G elegance && \
    rm -rf /var/cache/apk/*

WORKDIR /opt/elegance

# Copy the binary from builder stage
COPY --from=go-builder /elegance .

# Ensure executable
RUN chmod +x elegance

# Switch to non-root user
USER elegance

# Expose the port (adjust if different)
EXPOSE 8082

# Health check (assuming /healthz is available)
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://localhost:8082/api/health || exit 1

# Set environment variables
ENV UPLOAD_DIR=/var/opt/elegance/uploads
ENV PORT=8082

LABEL org.opencontainers.image.title="Elegance" \
    org.opencontainers.image.description="Elegance is an ecommerce theme program that provides a user-friendly interface for managing products, orders, and customers. It is built using Go and is designed to be scalable and efficient." \
    org.opencontainers.image.source="https://github.com/imrany/elegance"

# Start the application
ENTRYPOINT ["./elegance"]
