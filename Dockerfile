# -------------------------
# Stage 1: Build the web frontend
# -------------------------
FROM node:20-alpine AS web-builder

# Set the workdir to the root of the app context
WORKDIR /app

# Install pnpm globally once
RUN npm install -g pnpm@9.12.3

# Copy ONLY dependency locks first to leverage layer caching
COPY web/package.json web/pnpm-lock.yaml ./web/

# Change to the web directory to install deps
WORKDIR /app/web
RUN pnpm install --frozen-lockfile

# Now copy the rest of the frontend source code into /app/web
COPY web/ ./

# Build the frontend for release mode
# Note: Ensure your web build script config (vite.config.ts or similar)
# is set to output outDir to "../dist"
RUN pnpm run build

# -------------------------
# Stage 2: Build the Go application
# -------------------------
FROM golang:1.25-alpine AS go-builder

WORKDIR /app

# Install build dependencies
RUN apk add --no-cache git ca-certificates tzdata

# Copy go mod files first for optimal dependency caching
COPY go.mod go.sum ./
RUN --mount=type=cache,target=/go/pkg/mod \
    go mod download

# Copy all Go source code
COPY . .

# Pull the static frontend assets from Stage 1 into dist
COPY --from=web-builder /app/dist ./dist

# Build the statically linked Go application
ARG VERSION=dev
RUN --mount=type=cache,target=/root/.cache/go-build \
    CGO_ENABLED=0 GOOS=linux go build \
    -ldflags="-w -s -X github.com/imrany/elegance/internal/version.version=${VERSION}" \
    -o elegance ./cmd/server/main.go

# -------------------------
# Stage 3: Final lean runtime image
# -------------------------
FROM alpine:3.21

RUN set -eux && \
    apk add --no-cache ca-certificates tzdata && \
    addgroup -S elegance && \
    adduser -S elegance -G elegance && \
    mkdir -p /var/opt/elegance/uploads && \
    chown -R elegance:elegance /var/opt/elegance/uploads && \
    rm -rf /var/cache/apk/*

WORKDIR /opt/elegance

COPY --from=go-builder /app/elegance .
RUN chmod +x elegance

USER elegance

ENV UPLOAD_DIR=/var/opt/elegance/uploads
ENV PORT=8082
ENV GIN_MODE=release

EXPOSE 8082

HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://localhost:8082/api/health || exit 1

LABEL org.opencontainers.image.title="Elegance" \
    org.opencontainers.image.description="Elegance is a modern, open-source, fully functional and self-hosted ecommerce platform." \
    org.opencontainers.image.source="https://github.com/imrany/elegance"

ENTRYPOINT ["./elegance"]
