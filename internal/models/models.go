package models

import (
	"time"
)

// User represents a user
type User struct {
	ID          string    `json:"id" db:"id"`
	Email       string    `json:"email" db:"email"`
	FirstName   string    `json:"first_name" db:"first_name"`
	LastName    string    `json:"last_name" db:"last_name"`
	PhoneNumber string    `json:"phone_number" db:"phone_number"`
	Password    string    `json:"-" db:"password"` // Never expose password in JSON
	Role        string    `json:"role" db:"role"`
	CreatedAt   time.Time `json:"created_at" db:"created_at"`
	UpdatedAt   time.Time `json:"updated_at" db:"updated_at"`
}

// Category represents a product category
type Category struct {
	ID          string    `json:"id" db:"id"`
	Name        string    `json:"name" db:"name"`
	Slug        string    `json:"slug" db:"slug"`
	Description *string   `json:"description" db:"description"`
	ImageURL    *string   `json:"image_url" db:"image_url"`
	CreatedAt   time.Time `json:"created_at" db:"created_at"`
	UpdatedAt   time.Time `json:"updated_at" db:"updated_at"`
}

// Product represents a product
type Product struct {
	ID            string    `json:"id" db:"id"`
	Name          string    `json:"name" db:"name"`
	Slug          string    `json:"slug" db:"slug"`
	Description   *string   `json:"description" db:"description"`
	Price         float64   `json:"price" db:"price"`
	OriginalPrice *float64  `json:"original_price" db:"original_price"`
	CategoryID    *string   `json:"category_id" db:"category_id"`
	CategoryName  *string   `json:"category_name" db:"category_name"`
	Images        []string  `json:"images" db:"images"`
	Sizes         []string  `json:"sizes" db:"sizes"`
	Colors        []string  `json:"colors" db:"colors"`
	Stock         int       `json:"stock" db:"stock"`
	Featured      bool      `json:"featured" db:"featured"`
	IsNew         bool      `json:"is_new" db:"is_new"`
	CreatedAt     time.Time `json:"created_at" db:"created_at"`
	UpdatedAt     time.Time `json:"updated_at" db:"updated_at"`
}

// Order represents a customer order
type OrderCustomer struct {
	UserID      string `json:"user_id"`
	FirstName   string `json:"first_name"`
	LastName    string `json:"last_name"`
	Email       string `json:"email"`
	PhoneNumber string `json:"phone_number"`
}

type OrderShipping struct {
	Address    string `json:"address"`
	City       string `json:"city"`
	PostalCode string `json:"postalCode"`
}

type OrderItem struct {
	ProductID string  `json:"product_id"`
	Name      string  `json:"name"`
	Price     float64 `json:"price"`
	Quantity  int     `json:"quantity"`
	Size      string  `json:"size"`
	Color     string  `json:"color"`
	Image     string  `json:"image"`
}

type Order struct {
	ID            string        `json:"id" db:"id"`
	Customer      OrderCustomer `json:"customer" db:"customer"` // Assuming nested customer object is stored as JSONB column
	Shipping      OrderShipping `json:"shipping" db:"shipping"` // Assuming nested shipping object is stored as JSONB column
	Items         []OrderItem   `json:"items" db:"items"`       // Items are now a slice of OrderItem struct, still likely stored as JSONB
	Subtotal      float64       `json:"subtotal" db:"subtotal"`
	DeliveryFee   float64       `json:"delivery_fee" db:"delivery_fee"`
	Total         float64       `json:"total" db:"total"`
	Notes         string        `json:"notes" db:"notes"`                   // Changed from *string to string as per prompt
	PaymentMethod string        `json:"payment_method" db:"payment_method"` // Changed from *string to string as per prompt (Go doesn't have literal types)
	Status        string        `json:"status" db:"status"`
	PaymentStatus string        `json:"payment_status" db:"payment_status"` // Changed from *string to string as per prompt (Go doesn't have literal types)`
	CreatedAt     time.Time     `json:"created_at" db:"created_at"`
	UpdatedAt     time.Time     `json:"updated_at" db:"updated_at"`
}

// SiteSetting represents a site configuration setting
type WebsiteSetting struct {
	ID        string    `json:"id" db:"id"`
	Key       string    `json:"key" db:"key"`
	Value     string    `json:"value" db:"value"`
	CreatedAt time.Time `json:"created_at" db:"created_at"`
	UpdatedAt time.Time `json:"updated_at" db:"updated_at"`
}

// ProductFilters holds filter options for product queries
type ProductFilters struct {
	CategoryID *string
	Featured   *bool
	IsNew      *bool
	Search     *string
	Limit      int
	Offset     int
	Order      string
}

type SetupStatus struct {
	SetupComplete bool `json:"setup_complete" db:"setup_complete"`
	HasAdmin      bool `json:"has_admin" db:"has_admin"`
}

// PageStatus represents the publication status of a page
type PageStatus string

const (
	PageStatusDraft     PageStatus = "draft"
	PageStatusPublished PageStatus = "published"
)

// PageTemplate represents predefined page templates
type PageTemplate string

const (
	PageTemplateHome    PageTemplate = "home"
	PageTemplateAbout   PageTemplate = "about"
	PageTemplateContact PageTemplate = "contact"
	PageTemplateCustom  PageTemplate = "custom"
)

// Page represents a website page
type Page struct {
	ID              string       `json:"id" db:"id"`
	Title           string       `json:"title" db:"title" binding:"required"`
	Slug            string       `json:"slug" db:"slug" binding:"required"`
	Template        PageTemplate `json:"template" db:"template" binding:"required"`
	Status          PageStatus   `json:"status" db:"status"`
	MetaTitle       string       `json:"meta_title" db:"meta_title"`
	MetaDescription string       `json:"meta_description" db:"meta_description"`
	MetaKeywords    string       `json:"meta_keywords" db:"meta_keywords"`
	OGImage         string       `json:"og_image" db:"og_image"`
	Sections        []any        `json:"sections" db:"sections"`
	CreatedAt       time.Time    `json:"created_at" db:"created_at"`
	UpdatedAt       time.Time    `json:"updated_at" db:"updated_at"`
	PublishedAt     *time.Time   `json:"published_at,omitempty" db:"published_at"`
}

// ReorderSectionsRequest represents the request body for reordering sections
type ReorderSectionsRequest struct {
	SectionIDs []string `json:"section_ids" binding:"required"`
}
