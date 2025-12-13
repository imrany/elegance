.PHONY: help build run dev test coverage fmt lint clean migrate-postgres migrate-sqlite docker-build docker-run install

# Default target
.DEFAULT_GOAL := help

# Variables
BINARY_NAME=ecommerce
CMD_PATH=./cmd/server
BUILD_DIR=./bin
GO=go
GOFLAGS=-v

## help: Display this help message
help:
	@echo "Available targets:"
	@echo "  install           - Install project dependencies"
	@echo "  build             - Build the application"
	@echo "  run               - Run the application"
	@echo "  dev               - Run with hot reload (requires air)"
	@echo "  test              - Run tests"
	@echo "  coverage          - Run tests with coverage"
	@echo "  fmt               - Format code"
	@echo "  lint              - Lint code (requires golangci-lint)"
	@echo "  clean             - Clean build artifacts"
	@echo "  migrate-postgres  - Run PostgreSQL migrations"
	@echo "  migrate-sqlite    - Run SQLite migrations"
	@echo "  docker-build      - Build Docker image"
	@echo "  docker-run        - Run Docker container"

## install: Install project dependencies
install:
	@echo "Installing dependencies..."
	$(GO) mod download
	$(GO) mod tidy
	@echo "✓ Dependencies installed"

## build: Build the application
build:
	@echo "Building $(BINARY_NAME)..."
	@mkdir -p $(BUILD_DIR)
	CGO_ENABLED=0 GOOS=linux GOARCH=amd64 $(GO) build $(GOFLAGS) -o $(BUILD_DIR)/$(BINARY_NAME)-linux $(CMD_PATH)/main.go
	CGO_ENABLED=0 GOOS=windows GOARCH=amd64 $(GO) build $(GOFLAGS) -o $(BUILD_DIR)/$(BINARY_NAME)-windows.exe $(CMD_PATH)/main.go
	CGO_ENABLED=0 GOOS=darwin GOARCH=amd64 $(GO) build $(GOFLAGS) -o $(BUILD_DIR)/$(BINARY_NAME)-darwin $(CMD_PATH)/main.go
	@echo "✓ Build complete: $(BUILD_DIR)/$(BINARY_NAME)"

## run: Run the application
run:
	@echo "Running application..."
	$(GO) run $(CMD_PATH)/main.go

## dev: Run with hot reload (requires air)
dev:
	@echo "Starting development server with hot reload..."
	@command -v air >/dev/null 2>&1 || { echo "air not found. Install with: go install github.com/cosmtrek/air@latest"; exit 1; }
	air

## test: Run all tests
test:
	@echo "Running tests..."
	$(GO) test -v ./...

## coverage: Run tests with coverage report
coverage:
	@echo "Running tests with coverage..."
	$(GO) test -v -coverprofile=coverage.out ./...
	$(GO) tool cover -html=coverage.out -o coverage.html
	@echo "✓ Coverage report generated: coverage.html"

## fmt: Format all Go files
fmt:
	@echo "Formatting code..."
	$(GO) fmt ./...
	@echo "✓ Code formatted"

## lint: Run golangci-lint
lint:
	@echo "Running linter..."
	@command -v golangci-lint >/dev/null 2>&1 || { echo "golangci-lint not found. Install from https://golangci-lint.run/usage/install/"; exit 1; }
	golangci-lint run ./...
	@echo "✓ Linting complete"

## clean: Remove build artifacts and generated files
clean:
	@echo "Cleaning build artifacts..."
	@rm -rf $(BUILD_DIR)
	@rm -f coverage.out coverage.html
	@rm -f ecommerce.db
	@echo "✓ Clean complete"

## migrate-postgres: Run PostgreSQL migrations
migrate-postgres:
	@echo "Running PostgreSQL migrations..."
	@if [ -z "$(DATABASE_URL)" ]; then \
		echo "ERROR: DATABASE_URL environment variable not set"; \
		exit 1; \
	fi
	psql $(DATABASE_URL) -f migrations/postgres/001_create_tables.sql
	@echo "✓ PostgreSQL migrations complete"

## migrate-sqlite: Run SQLite migrations
migrate-sqlite:
	@echo "Running SQLite migrations..."
	@mkdir -p $(dir ecommerce.db)
	sqlite3 ecommerce.db < migrations/sqlite/001_create_tables.sql
	@echo "✓ SQLite migrations complete"

## docker-build: Build Docker image
docker-build:
	@echo "Building Docker image..."
	docker build -t ecommerce-backend:latest .
	@echo "✓ Docker image built"

## docker-run: Run Docker container
docker-run:
	@echo "Running Docker container..."
	docker run -p 8080:8080 --env-file .env ecommerce-backend:latest

## build-all: Build for multiple platforms
build-all:
	@echo "Building for multiple platforms..."
	@mkdir -p $(BUILD_DIR)
	GOOS=linux GOARCH=amd64 $(GO) build -o $(BUILD_DIR)/$(BINARY_NAME)-linux-amd64 $(CMD_PATH)/main.go
	GOOS=darwin GOARCH=amd64 $(GO) build -o $(BUILD_DIR)/$(BINARY_NAME)-darwin-amd64 $(CMD_PATH)/main.go
	GOOS=darwin GOARCH=arm64 $(GO) build -o $(BUILD_DIR)/$(BINARY_NAME)-darwin-arm64 $(CMD_PATH)/main.go
	GOOS=windows GOARCH=amd64 $(GO) build -o $(BUILD_DIR)/$(BINARY_NAME)-windows-amd64.exe $(CMD_PATH)/main.go
	@echo "✓ Multi-platform build complete"
