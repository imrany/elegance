# 🚀 Go E-Commerce Backend

A high-performance Go backend for luxury fashion e-commerce with support for PostgreSQL and SQLite databases.

---

## 📋 Features

- ✅ **Dual Database Support**: PostgreSQL (production) & SQLite (development)
- ✅ **RESTful API**: Clean, organized endpoints
- ✅ **CORS Enabled**: Works with any frontend
- ✅ **Type-Safe**: Full TypeScript-compatible types
- ✅ **Fast**: Gin web framework for high performance
- ✅ **Flexible**: Environment variables or CLI flags

---

## 📦 Installation

### 1. **Install Go** (if not already installed)

```bash
# Ubuntu/Debian
sudo apt update
sudo apt install golang-go

# Verify installation
go version
```

### 2. **Create Project Structure**

```bash
mkdir ecommerce-backend
cd ecommerce-backend

# Create necessary directories
mkdir -p migrations cmd/server
```

### 3. **Initialize Go Module**

```bash
go mod init github.com/yourusername/ecommerce-backend
```

### 4. **Install Dependencies**

```bash
# Web framework
go get github.com/gin-gonic/gin
go get github.com/gin-contrib/cors

# Database drivers
go get github.com/lib/pq              # PostgreSQL
go get github.com/mattn/go-sqlite3    # SQLite

# UUID generation
go get github.com/google/uuid
```

---

## 📁 Project Structure

```
ecommerce-backend/
├── main.go                          # Main application file
├── go.mod                           # Go module file
├── go.sum                           # Dependencies checksum
├── .env                             # Environment variables
├── migrations/
│   ├── 001_create_tables.up.sql    # PostgreSQL migrations
│   └── 001_create_tables_sqlite.up.sql  # SQLite migrations
└── README.md
```

---

## 🔧 Configuration

### **Environment Variables** (`.env`)

Create a `.env` file:

```bash
# Database Configuration
DB_TYPE=postgres               # or sqlite
DATABASE_URL=postgres://user:password@localhost:5432/ecommerce?sslmode=disable
# Or for SQLite:
# DATABASE_URL=./ecommerce.db

# Server Configuration
PORT=8080
```

### **Or Use Command-Line Flags**

```bash
./ecommerce-backend --db-type=postgres --db-dsn="postgres://..." -port=8080
./ecommerce-backend --db-type=sqlite --db-dsn="./ecommerce.db" -port=8080
```

---

## 🗄️ Database Setup

### **Option 1: PostgreSQL**

#### Install PostgreSQL:

```bash
sudo apt update
sudo apt install postgresql postgresql-contrib
```

#### Create Database:

```bash
sudo -u postgres psql

CREATE DATABASE ecommerce;
CREATE USER ecommerce_user WITH PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE ecommerce TO ecommerce_user;
\q
```

#### Run Migrations:

```bash
psql -U ecommerce_user -d ecommerce -f migrations/001_create_tables.up.sql
```

#### Connection String:

```
postgres://ecommerce_user:your_password@localhost:5432/ecommerce?sslmode=disable
```

### **Option 2: SQLite** (Development)

No installation needed! SQLite file is created automatically.

#### Run Migrations:

```bash
sqlite3 ecommerce.db < migrations/001_create_tables_sqlite.up.sql
```

---

## 🏃 Running the Application

### **Build and Run**

```bash
# Build
go build -o ecommerce-backend main.go

# Run with environment variables
export DB_TYPE=postgres
export DATABASE_URL="postgres://user:pass@localhost:5432/ecommerce?sslmode=disable"
export PORT=8080
./ecommerce-backend

# Or run with flags
./ecommerce-backend --db-type=postgres --db-dsn="postgres://..." -port=8080
```

### **Development Mode** (auto-reload)

```bash
# Install air for live reload
go install github.com/cosmtrek/air@latest

# Run with air
air
```

### **Quick Start with SQLite**

```bash
# Run migrations
sqlite3 ecommerce.db < migrations/001_create_tables_sqlite.up.sql

# Run server
go run main.go --db-type=sqlite --db-dsn=./ecommerce.db
```

---

## 🌐 API Endpoints

### **Categories**

```http
GET    /api/categories           # Get all categories
GET    /api/categories/:slug     # Get category by slug
```

### **Products**

```http
GET    /api/products                      # Get all products
GET    /api/products/:slug                # Get product by slug
GET    /api/products?category_id=uuid     # Filter by category
GET    /api/products?featured=true        # Featured products
GET    /api/products?is_new=true          # New products
GET    /api/products?search=query         # Search products
```

### **Orders**

```http
POST   /api/orders              # Create new order
GET    /api/orders/:id          # Get order by ID
```

### **Site Settings**

```http
GET    /api/settings/:key       # Get setting by key (e.g., /api/settings/whatsapp)
```

### **Health Check**

```http
GET    /health                  # Server health status
```

---

## 📡 API Examples

### **Get WhatsApp Settings**

```bash
curl http://localhost:8080/api/settings/whatsapp
```

Response:
```json
{
  "id": "uuid",
  "key": "whatsapp",
  "value": {
    "phone": "+254700000000",
    "message": "Hello! I am interested in your products."
  },
  "created_at": "2024-01-01T00:00:00Z",
  "updated_at": "2024-01-01T00:00:00Z"
}
```

### **Get Featured Products**

```bash
curl http://localhost:8080/api/products?featured=true
```

### **Create Order**

```bash
curl -X POST http://localhost:8080/api/orders \
  -H "Content-Type: application/json" \
  -d '{
    "customer_name": "John Doe",
    "customer_email": "john@example.com",
    "customer_phone": "+254712345678",
    "delivery_address": "123 Main St, Nairobi",
    "items": [
      {
        "product_id": "uuid",
        "name": "Silk Evening Gown",
        "quantity": 1,
        "price": 45000
      }
    ],
    "subtotal": 45000,
    "delivery_fee": 500,
    "total": 45500
  }'
```

---

## 🔗 Frontend Integration

### **React Example (replacing Supabase)**

```typescript
// Old Supabase code
const { data } = await supabase
  .from("site_settings")
  .select("value")
  .eq("key", "whatsapp")
  .maybeSingle();

// New Go backend code
const response = await fetch('http://localhost:8080/api/settings/whatsapp');
const data = await response.json();
const whatsappSettings = data.value;
```

### **Complete WhatsApp Button Component**

```typescript
import { useQuery } from "@tanstack/react-query";
import { MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

const API_URL = "http://localhost:8080/api";

export function WhatsAppButton() {
  const { data: setting } = useQuery({
    queryKey: ["whatsapp-settings"],
    queryFn: async () => {
      const response = await fetch(`${API_URL}/settings/whatsapp`);
      if (!response.ok) throw new Error('Failed to fetch settings');
      return response.json();
    },
  });

  const phone = setting?.value?.phone || "+254700000000";
  const message = setting?.value?.message || "Hello! I am interested in your products.";
  const whatsappUrl = `https://wa.me/${phone.replace(/[^0-9]/g, "")}?text=${encodeURIComponent(message)}`;

  return (
    <a
      href={whatsappUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-6 right-6 z-50"
    >
      <Button
        size="sm"
        className="h-12 w-12 rounded-full bg-[#25D366] text-white shadow-lg transition-transform hover:scale-110 hover:bg-[#20BA5C]"
      >
        <MessageCircle className="h-6 w-6" />
        <span className="sr-only">Chat on WhatsApp</span>
      </Button>
    </a>
  );
}
```

---

## 🐳 Docker Support

### **Dockerfile**

```dockerfile
FROM golang:1.21-alpine AS builder

WORKDIR /app
COPY go.mod go.sum ./
RUN go mod download

COPY . .
RUN go build -o ecommerce-backend main.go

FROM alpine:latest
RUN apk --no-cache add ca-certificates
WORKDIR /root/

COPY --from=builder /app/ecommerce-backend .
COPY --from=builder /app/migrations ./migrations

EXPOSE 8080
CMD ["./ecommerce-backend"]
```

### **docker-compose.yml**

```yaml
version: '3.8'

services:
  postgres:
    image: postgres:15-alpine
    environment:
      POSTGRES_DB: ecommerce
      POSTGRES_USER: ecommerce_user
      POSTGRES_PASSWORD: your_password
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./migrations:/docker-entrypoint-initdb.d
    ports:
      - "5432:5432"

  backend:
    build: .
    environment:
      DB_TYPE: postgres
      DATABASE_URL: postgres://ecommerce_user:your_password@postgres:5432/ecommerce?sslmode=disable
      PORT: 8080
    ports:
      - "8080:8080"
    depends_on:
      - postgres

volumes:
  postgres_data:
```

### **Run with Docker**

```bash
docker-compose up -d
```

---

## 🧪 Testing

### **Test Endpoints**

```bash
# Health check
curl http://localhost:8080/health

# Get categories
curl http://localhost:8080/api/categories

# Get products
curl http://localhost:8080/api/products

# Get WhatsApp settings
curl http://localhost:8080/api/settings/whatsapp
```

---

## 🔐 Security Notes

### **Production Checklist:**

- [ ] Use environment variables for sensitive data
- [ ] Enable HTTPS (add TLS support)
- [ ] Implement authentication (JWT tokens)
- [ ] Add rate limiting
- [ ] Use prepared statements (already implemented)
- [ ] Validate all input data
- [ ] Add request logging
- [ ] Set up proper CORS origins (not `*`)

### **Authentication Example** (JWT)

```bash
go get github.com/golang-jwt/jwt/v5
```

---

## 📊 Performance Tips

1. **Database Indexes**: Already created in migrations
2. **Connection Pooling**: Configure in production:
   ```go
   db.SetMaxOpenConns(25)
   db.SetMaxIdleConns(5)
   db.SetConnMaxLifetime(5 * time.Minute)
   ```
3. **Caching**: Add Redis for frequently accessed data
4. **Load Balancing**: Use nginx or similar

---

## 🚀 Deployment

### **Ubuntu Server Deployment**

```bash
# 1. Copy files to server
scp -r * user@server:/opt/ecommerce-backend

# 2. SSH into server
ssh user@server

# 3. Build
cd /opt/ecommerce-backend
go build -o ecommerce-backend main.go

# 4. Create systemd service
sudo nano /etc/systemd/system/ecommerce.service
```

**Service file:**
```ini
[Unit]
Description=E-Commerce Backend
After=network.target

[Service]
Type=simple
User=www-data
WorkingDirectory=/opt/ecommerce-backend
Environment="DB_TYPE=postgres"
Environment="DATABASE_URL=postgres://..."
Environment="PORT=8080"
ExecStart=/opt/ecommerce-backend/ecommerce-backend
Restart=always

[Install]
WantedBy=multi-user.target
```

```bash
# 5. Enable and start service
sudo systemctl enable ecommerce
sudo systemctl start ecommerce
sudo systemctl status ecommerce
```

---

## 🛠️ Troubleshooting

### **Port Already in Use**

```bash
# Find process using port 8080
sudo lsof -i :8080

# Kill process
sudo kill -9 <PID>
```

### **Database Connection Failed**

```bash
# Test PostgreSQL connection
psql -U user -d ecommerce -h localhost

# Check if PostgreSQL is running
sudo systemctl status postgresql
```

### **SQLite Locked Database**

```bash
# Close all connections and restart
rm ecommerce.db
sqlite3 ecommerce.db < migrations/001_create_tables_sqlite.up.sql
```

---

## 📝 TODO / Roadmap

- [ ] Add authentication middleware
- [ ] Implement admin endpoints (CRUD)
- [ ] Add pagination for products
- [ ] Image upload support
- [ ] Email notifications
- [ ] Payment gateway integration (M-Pesa, Stripe)
- [ ] Product reviews and ratings
- [ ] Inventory management
- [ ] Analytics dashboard

---

## 📄 License

MIT

---

## 🤝 Contributing

Pull requests are welcome! For major changes, please open an issue first.

---

**Made with ❤️ for luxury fashion e-commerce**
