# 🔄 Database Migrator

A robust, database-agnostic migration system for PostgreSQL and SQLite.

---

## 📋 Features

- ✅ **Database Agnostic**: Works with PostgreSQL and SQLite
- ✅ **Embedded Migrations**: Uses Go embed for portability
- ✅ **Version Tracking**: Tracks applied migrations
- ✅ **Rollback Support**: Up and down migrations
- ✅ **Transaction Safety**: Each migration runs in a transaction
- ✅ **Status Reports**: See what's applied and pending
- ✅ **Reset Capability**: Rollback all migrations

---

## 🏗️ Project Structure

```
ecommerce-backend/
├── cmd/
│   └── migrate/
│       └── main.go                 # Migration CLI tool
├── internal/
│   └── migrator/
│       ├── migrator.go            # Migrator implementation
│       └── migrations/            # Embedded migration files
│           ├── 001_create_tables_postgres.up.sql
│           ├── 001_create_tables_postgres.down.sql
│           ├── 001_create_tables_sqlite.up.sql
│           ├── 001_create_tables_sqlite.down.sql
│           ├── 002_seed_data_postgres.up.sql
│           ├── 002_seed_data_postgres.down.sql
│           ├── 002_seed_data_sqlite.up.sql
│           └── 002_seed_data_sqlite.down.sql
```

---

## 📝 Migration File Naming Convention

Format: `{version}_{name}_{database}.{direction}.sql`

**Examples:**
```
001_create_tables_postgres.up.sql
001_create_tables_postgres.down.sql
001_create_tables_sqlite.up.sql
001_create_tables_sqlite.down.sql
002_seed_data_postgres.up.sql
002_seed_data_sqlite.up.sql
```

**Parts:**
- `001` - Version number (3 digits, zero-padded)
- `create_tables` - Migration name (snake_case)
- `postgres` or `sqlite` - Database type
- `up` or `down` - Migration direction
- `.sql` - File extension

---

## 🚀 Usage

### **Build the Migration Tool**

```bash
# Build
go build -o bin/migrate cmd/migrate/main.go

# Or use Makefile
make build-migrate
```

### **Run Migrations**

#### **Using Environment Variables**

```bash
# Set environment
export DB_TYPE=postgres
export DATABASE_URL="postgres://user:pass@localhost:5432/ecommerce?sslmode=disable"

# Run migrations
./bin/migrate --cmd=up

# Or for SQLite
export DB_TYPE=sqlite
export DATABASE_URL="./ecommerce.db"
./bin/migrate --cmd=up
```

#### **Using Command-Line Flags**

```bash
# PostgreSQL
./bin/migrate \
  --cmd=up \
  --db-type=postgres \
  --db-dsn="postgres://user:pass@localhost:5432/ecommerce?sslmode=disable"

# SQLite
./bin/migrate \
  --cmd=up \
  --db-type=sqlite \
  --db-dsn="./ecommerce.db"
```

### **Commands**

#### **up** - Apply pending migrations
```bash
./bin/migrate --cmd=up
```

#### **down** - Rollback last migration
```bash
./bin/migrate --cmd=down
```

#### **status** - Show migration status
```bash
./bin/migrate --cmd=status
```

Output:
```
Migration Status:
=================
Database: postgres

[applied] 001: create_tables (applied at: 2024-01-15 10:30:45)
[pending] 002: seed_data

Total: 2 | Applied: 1 | Pending: 1
```

#### **reset** - Rollback all migrations
```bash
./bin/migrate --cmd=reset
```
*This will ask for confirmation before proceeding*

---

## 📄 Additional Migration Files

### **002_seed_data_postgres.up.sql**

```sql
-- Insert default settings
INSERT INTO site_settings (key, value) VALUES 
('whatsapp', '{"phone": "+254700000000", "message": "Hello! I am interested in your products."}'),
('email', '{"enabled": false, "from_email": "", "resend_api_key": ""}'),
('store', '{"name": "ÉLÉGANCE", "currency": "KES", "free_delivery_threshold": 10000}')
ON CONFLICT (key) DO NOTHING;

-- Insert sample categories
INSERT INTO categories (name, slug, description, image_url) VALUES
('Women', 'women', 'Elegant fashion for women', 'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=800'),
('Men', 'men', 'Sophisticated menswear', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800'),
('Accessories', 'accessories', 'Luxury accessories', 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800'),
('New Arrivals', 'new-arrivals', 'Latest additions', 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800')
ON CONFLICT (slug) DO NOTHING;

-- Insert sample products
INSERT INTO products (name, slug, description, price, original_price, category_id, images, sizes, colors, stock, featured, is_new) 
SELECT 
    'Silk Evening Gown', 
    'silk-evening-gown', 
    'Exquisite hand-crafted silk evening gown', 
    45000, 
    52000, 
    c.id, 
    ARRAY['https://images.unsplash.com/photo-1566174053879-31528523f8ae?w=800'], 
    ARRAY['XS', 'S', 'M', 'L'], 
    ARRAY['Black', 'Burgundy', 'Navy'], 
    15, 
    true, 
    false
FROM categories c WHERE c.slug = 'women'
ON CONFLICT (slug) DO NOTHING;

INSERT INTO products (name, slug, description, price, category_id, images, sizes, colors, stock, featured, is_new)
SELECT 
    'Tailored Wool Blazer', 
    'tailored-wool-blazer', 
    'Premium Italian wool blazer', 
    28000, 
    c.id, 
    ARRAY['https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=800'], 
    ARRAY['S', 'M', 'L', 'XL'], 
    ARRAY['Charcoal', 'Navy'], 
    20, 
    true, 
    false
FROM categories c WHERE c.slug = 'men'
ON CONFLICT (slug) DO NOTHING;

INSERT INTO products (name, slug, description, price, original_price, category_id, images, sizes, colors, stock, featured, is_new)
SELECT 
    'Leather Crossbody Bag', 
    'leather-crossbody-bag', 
    'Handcrafted genuine leather', 
    18500, 
    22000, 
    c.id, 
    ARRAY['https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=800'], 
    ARRAY['One Size'], 
    ARRAY['Tan', 'Black', 'Cream'], 
    30, 
    true, 
    false
FROM categories c WHERE c.slug = 'accessories'
ON CONFLICT (slug) DO NOTHING;
```

### **002_seed_data_postgres.down.sql**

```sql
-- Remove sample products
DELETE FROM products WHERE slug IN (
    'silk-evening-gown',
    'tailored-wool-blazer',
    'leather-crossbody-bag'
);

-- Remove sample categories
DELETE FROM categories WHERE slug IN (
    'women',
    'men',
    'accessories',
    'new-arrivals'
);

-- Remove default settings
DELETE FROM site_settings WHERE key IN (
    'whatsapp',
    'email',
    'store'
);
```

### **002_seed_data_sqlite.up.sql**

```sql
-- Insert default settings
INSERT OR IGNORE INTO site_settings (key, value) VALUES 
('whatsapp', '{"phone": "+254700000000", "message": "Hello! I am interested in your products."}'),
('email', '{"enabled": false, "from_email": "", "resend_api_key": ""}'),
('store', '{"name": "ÉLÉGANCE", "currency": "KES", "free_delivery_threshold": 10000}');

-- Insert sample categories
INSERT OR IGNORE INTO categories (name, slug, description, image_url) VALUES
('Women', 'women', 'Elegant fashion for women', 'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=800'),
('Men', 'men', 'Sophisticated menswear', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800'),
('Accessories', 'accessories', 'Luxury accessories', 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800'),
('New Arrivals', 'new-arrivals', 'Latest additions', 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800');

-- Insert sample products
INSERT OR IGNORE INTO products (name, slug, description, price, original_price, category_id, images, sizes, colors, stock, featured, is_new)
SELECT 
    'Silk Evening Gown', 
    'silk-evening-gown', 
    'Exquisite hand-crafted silk evening gown', 
    45000, 
    52000, 
    c.id, 
    '["https://images.unsplash.com/photo-1566174053879-31528523f8ae?w=800"]', 
    '["XS", "S", "M", "L"]', 
    '["Black", "Burgundy", "Navy"]', 
    15, 
    1, 
    0
FROM categories c WHERE c.slug = 'women';

INSERT OR IGNORE INTO products (name, slug, description, price, category_id, images, sizes, colors, stock, featured, is_new)
SELECT 
    'Tailored Wool Blazer', 
    'tailored-wool-blazer', 
    'Premium Italian wool blazer', 
    28000, 
    c.id, 
    '["https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=800"]', 
    '["S", "M", "L", "XL"]', 
    '["Charcoal", "Navy"]', 
    20, 
    1, 
    0
FROM categories c WHERE c.slug = 'men';

INSERT OR IGNORE INTO products (name, slug, description, price, original_price, category_id, images, sizes, colors, stock, featured, is_new)
SELECT 
    'Leather Crossbody Bag', 
    'leather-crossbody-bag', 
    'Handcrafted genuine leather', 
    18500, 
    22000, 
    c.id, 
    '["https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=800"]', 
    '["One Size"]', 
    '["Tan", "Black", "Cream"]', 
    30, 
    1, 
    0
FROM categories c WHERE c.slug = 'accessories';
```

### **002_seed_data_sqlite.down.sql**

```sql
-- Remove sample products
DELETE FROM products WHERE slug IN (
    'silk-evening-gown',
    'tailored-wool-blazer',
    'leather-crossbody-bag'
);

-- Remove sample categories
DELETE FROM categories WHERE slug IN (
    'women',
    'men',
    'accessories',
    'new-arrivals'
);

-- Remove default settings
DELETE FROM site_settings WHERE key IN (
    'whatsapp',
    'email',
    'store'
);
```

---

## 🔧 Integration with Main Application

### **Update cmd/server/main.go**

Add automatic migration on startup:

```go
package main

import (
	"log"
	"os"
	"os/signal"
	"syscall"

	"github.com/yourusername/ecommerce-backend/internal/config"
	"github.com/yourusername/ecommerce-backend/internal/database"
	"github.com/yourusername/ecommerce-backend/internal/migrator"
	"github.com/yourusername/ecommerce-backend/internal/server"
)

func main() {
	// Load configuration
	cfg, err := config.Load()
	if err != nil {
		log.Fatalf("Failed to load configuration: %v", err)
	}

	// Initialize database
	db, err := database.New(cfg.DB.Type, cfg.DB.ConnectionString)
	if err != nil {
		log.Fatalf("Failed to connect to database: %v", err)
	}
	defer db.Close()

	log.Printf("Connected to %s database successfully", cfg.DB.Type)

	// Run migrations automatically
	if os.Getenv("AUTO_MIGRATE") == "true" {
		log.Println("Running database migrations...")
		m, err := migrator.New(db.(*database.PostgresDB).db, cfg.DB.Type) // Adjust based on your DB type
		if err != nil {
			log.Fatalf("Failed to create migrator: %v", err)
		}
		if err := m.Up(); err != nil {
			log.Fatalf("Failed to run migrations: %v", err)
		}
		log.Println("Migrations completed successfully")
	}

	// Create and start server
	srv := server.New(cfg, db)

	// Graceful shutdown
	quit := make(chan os.Signal, 1)
	signal.Notify(quit, syscall.SIGINT, syscall.SIGTERM)

	go func() {
		<-quit
		log.Println("Shutting down server...")
		db.Close()
		os.Exit(0)
	}()

	// Start server
	log.Printf("Server starting on :%s", cfg.Server.Port)
	if err := srv.Start(); err != nil {
		log.Fatalf("Failed to start server: %v", err)
	}
}
```

---

## 📦 Updated Makefile

Add migration targets:

```makefile
# Build migration tool
build-migrate:
	@echo "Building migration tool..."
	@mkdir -p $(BUILD_DIR)
	$(GO) build $(GOFLAGS) -o $(BUILD_DIR)/migrate cmd/migrate/main.go
	@echo "✓ Migration tool built: $(BUILD_DIR)/migrate"

# Run migrations
migrate-up:
	@echo "Running migrations..."
	./bin/migrate --cmd=up

# Rollback last migration
migrate-down:
	@echo "Rolling back migration..."
	./bin/migrate --cmd=down

# Show migration status
migrate-status:
	@echo "Checking migration status..."
	./bin/migrate --cmd=status

# Reset all migrations
migrate-reset:
	@echo "Resetting migrations..."
	./bin/migrate --cmd=reset

# Fresh database (reset + migrate)
migrate-fresh:
	@echo "Fresh migration..."
	./bin/migrate --cmd=reset || true
	./bin/migrate --cmd=up
```

---

## 🧪 Testing Migrations

### **Test Up Migrations**

```bash
# Build migrate tool
make build-migrate

# PostgreSQL
./bin/migrate \
  --cmd=up \
  --db-type=postgres \
  --db-dsn="postgres://user:pass@localhost:5432/test_db"

# SQLite
./bin/migrate \
  --cmd=up \
  --db-type=sqlite \
  --db-dsn="./test.db"

# Check status
./bin/migrate --cmd=status --db-type=sqlite --db-dsn="./test.db"
```

### **Test Down Migrations**

```bash
# Rollback last migration
./bin/migrate --cmd=down --db-type=sqlite --db-dsn="./test.db"

# Verify
./bin/migrate --cmd=status --db-type=sqlite --db-dsn="./test.db"
```

### **Test Reset**

```bash
# Reset all
./bin/migrate --cmd=reset --db-type=sqlite --db-dsn="./test.db"

# Should show no migrations applied
./bin/migrate --cmd=status --db-type=sqlite --db-dsn="./test.db"
```

---

## 🎯 Best Practices

### **1. Always Create Both Up and Down**
Every migration should have both `.up.sql` and `.down.sql` files.

### **2. Test Migrations Locally**
Always test migrations on a local database before production.

### **3. Keep Migrations Idempotent**
Use `IF NOT EXISTS`, `ON CONFLICT`, etc. to make migrations repeatable.

### **4. Use Transactions**
The migrator automatically wraps each migration in a transaction.

### **5. Version Control**
Commit migration files to version control.

### **6. Backup Before Reset**
Always backup your database before running `reset`.

---

## 🚨 Common Issues

### **Issue: Migration File Not Found**

**Solution:** Ensure migration files are in `internal/migrator/migrations/` and follow naming convention.

### **Issue: Migration Already Applied**

**Solution:** Check status with `migrate-status` and rollback if needed.

### **Issue: Migration Failed Mid-Way**

**Solution:** Each migration runs in a transaction, so partial failures are rolled back automatically.

---

## 📊 Example Workflow

```bash
# 1. Create new migration files
touch internal/migrator/migrations/003_add_reviews_postgres.up.sql
touch internal/migrator/migrations/003_add_reviews_postgres.down.sql
touch internal/migrator/migrations/003_add_reviews_sqlite.up.sql
touch internal/migrator/migrations/003_add_reviews_sqlite.down.sql

# 2. Write SQL in migration files
# ...

# 3. Build migrate tool
make build-migrate

# 4. Test locally (SQLite)
./bin/migrate --cmd=up --db-type=sqlite --db-dsn="./test.db"

# 5. Check status
./bin/migrate --cmd=status --db-type=sqlite --db-dsn="./test.db"

# 6. If good, apply to production (PostgreSQL)
./bin/migrate --cmd=up --db-type=postgres --db-dsn="$PROD_DB_URL"

# 7. Verify
./bin/migrate --cmd=status --db-type=postgres --db-dsn="$PROD_DB_URL"
```

---

## 🔒 Production Deployment

### **Docker with Auto-Migration**

```dockerfile
FROM golang:1.21-alpine AS builder
# ... build steps ...

FROM alpine:latest
# ... copy binary ...

# Set auto-migrate
ENV AUTO_MIGRATE=true

CMD ["./server"]
```

### **Kubernetes Init Container**

```yaml
initContainers:
  - name: migrate
    image: ecommerce-backend:latest
    command: ["/bin/migrate", "--cmd=up"]
    env:
      - name: DB_TYPE
        value: "postgres"
      - name: DATABASE_URL
        valueFrom:
          secretKeyRef:
            name: db-secret
            key: url
```

---

**Your database migrations are now fully managed and portable!** 🚀
