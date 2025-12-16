package database

import (
	"fmt"

	"github.com/imrany/ecommerce/internal/database/postgres"
	"github.com/imrany/ecommerce/internal/database/sqlite"
	"github.com/imrany/ecommerce/internal/models"
)

// DB defines the database interface
type DB interface {
	// User operations
	CreateUser(user *models.User) (*models.User, error)
	GetUserByEmail(email string) (*models.User, error)
	GetUserByID(id string) (*models.User, error)
	UpdateUser(user *models.User) error

	// Category operations
	GetCategories() ([]models.Category, error)
	GetCategoryBySlug(slug string) (*models.Category, error)
	CreateCategory(category *models.Category) (*models.Category, error)
	UpdateCategory(category *models.Category) error
	DeleteCategory(idORSlug string) error

	// Product operations
	GetProducts(filters models.ProductFilters) ([]models.Product, error)
	GetProductBySlug(slug string) (*models.Product, error)
	GetFeaturedProducts() ([]models.Product, error)
	GetNewProducts() ([]models.Product, error)

	// Order operations
	CreateOrder(order *models.Order) error
	GetOrdersByOption(key string, value *string) ([]models.Order, error)
	DeleteOrder(id string) error
	UpdateOrder(order *models.Order) error

	// Settings operations
	GetSiteSetting(key string) (*models.SiteSetting, error)
	UpdateSiteSetting(key string, value string) error

	// Admin operations
	UpdateOrderStatus(id, status, paymentStatus string) error
	CreateProduct(product *models.Product) error
	UpdateProduct(product *models.Product) error
	DeleteProduct(id string) error

	// website settings configuration
	GetAllWebsiteSettings() ([]models.SiteSetting, error)
	GetWebsiteSettingByKey(key string) (models.SiteSetting, error)
	UpdateWebsiteSetting(key string, value string) error

	// User management (admin)
	GetAllUsers() ([]models.User, error)
	UpdateUserRole(id, role string) error
	DeleteUser(id string) error

	// setup  (initial)
	GetSetupStatus() (*models.SetupStatus, error)
	SetupAdmin(user *models.User) (*models.User, error)

	// Lifecycle
	Close() error
}

// New creates a new database connection based on the type
func New(dbType, connStr string) (DB, error) {
	switch dbType {
	case "postgres":
		return postgres.NewPostgresDB(connStr)
	case "sqlite":
		return sqlite.NewSQLiteDB(connStr)
	default:
		return nil, fmt.Errorf("unsupported database type: %s", dbType)
	}
}
