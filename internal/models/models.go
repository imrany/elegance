package models

import (
	"encoding/json"
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
type Order struct {
	ID              string          `json:"id" db:"id"`
	UserID          *string         `json:"user_id" db:"user_id"`
	CustomerName    string          `json:"customer_name" db:"customer_name"`
	CustomerEmail   string          `json:"customer_email" db:"customer_email"`
	CustomerPhone   string          `json:"customer_phone" db:"customer_phone"`
	DeliveryAddress string          `json:"delivery_address" db:"delivery_address"`
	Items           json.RawMessage `json:"items" db:"items"`
	Subtotal        float64         `json:"subtotal" db:"subtotal"`
	DeliveryFee     float64         `json:"delivery_fee" db:"delivery_fee"`
	Total           float64         `json:"total" db:"total"`
	Status          string          `json:"status" db:"status"`
	PaymentMethod   *string         `json:"payment_method" db:"payment_method"`
	PaymentStatus   string          `json:"payment_status" db:"payment_status"`
	Notes           *string         `json:"notes" db:"notes"`
	CreatedAt       time.Time       `json:"created_at" db:"created_at"`
	UpdatedAt       time.Time       `json:"updated_at" db:"updated_at"`
}

// SiteSetting represents a site configuration setting
type SiteSetting struct {
	ID        string          `json:"id" db:"id"`
	Key       string          `json:"key" db:"key"`
	Value     json.RawMessage `json:"value" db:"value"`
	CreatedAt time.Time       `json:"created_at" db:"created_at"`
	UpdatedAt time.Time       `json:"updated_at" db:"updated_at"`
}

// ProductFilters holds filter options for product queries
type ProductFilters struct {
	CategoryID *string
	Featured   *bool
	IsNew      *bool
	Search     *string
	Limit      int
	Offset     int
}
