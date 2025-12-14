package sqlite

import (
	"encoding/json"
	"fmt"
	"time"

	"github.com/google/uuid"
	"github.com/imrany/ecommerce/internal/models"
)

func (sq *SQLiteDB) CreateOrder(order *models.Order) error {
	order.ID = uuid.New().String()
	order.CreatedAt = time.Now()
	order.UpdatedAt = time.Now()
	order.Status = "pending"
	order.PaymentStatus = "pending"

	_, err := sq.db.Exec(`
		INSERT INTO orders (id, user_id, customer_name, customer_email, customer_phone,
			delivery_address, items, subtotal, delivery_fee, total, status, payment_method,
			payment_status, notes, created_at, updated_at)
		VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
	`, order.ID, order.UserID, order.CustomerName, order.CustomerEmail, order.CustomerPhone,
		order.DeliveryAddress, order.Items, order.Subtotal, order.DeliveryFee, order.Total,
		order.Status, order.PaymentMethod, order.PaymentStatus, order.Notes,
		order.CreatedAt, order.UpdatedAt)
	return err
}

func (sq *SQLiteDB) GetOrderByID(id string) (*models.Order, error) {
	var o models.Order
	err := sq.db.QueryRow(`
		SELECT id, user_id, customer_name, customer_email, customer_phone, delivery_address,
			   items, subtotal, delivery_fee, total, status, payment_method, payment_status,
			   notes, created_at, updated_at
		FROM orders
		WHERE id = ?
	`, id).Scan(&o.ID, &o.UserID, &o.CustomerName, &o.CustomerEmail, &o.CustomerPhone,
		&o.DeliveryAddress, &o.Items, &o.Subtotal, &o.DeliveryFee, &o.Total, &o.Status,
		&o.PaymentMethod, &o.PaymentStatus, &o.Notes, &o.CreatedAt, &o.UpdatedAt)
	if err != nil {
		return nil, err
	}
	return &o, nil
}

// GetAllOrders retrieves all orders (admin)
func (sq *SQLiteDB) GetAllOrders() ([]models.Order, error) {
	query := `
		SELECT id, user_id, customer_name, customer_email, customer_phone, delivery_address,
			   items, subtotal, delivery_fee, total, status, payment_method, payment_status,
			   notes, created_at, updated_at
		FROM orders
		ORDER BY created_at DESC
	`

	rows, err := sq.db.Query(query)
	if err != nil {
		return nil, fmt.Errorf("failed to query orders: %w", err)
	}
	defer rows.Close()

	var orders []models.Order
	for rows.Next() {
		var o models.Order
		if err := rows.Scan(
			&o.ID, &o.UserID, &o.CustomerName, &o.CustomerEmail, &o.CustomerPhone,
			&o.DeliveryAddress, &o.Items, &o.Subtotal, &o.DeliveryFee, &o.Total,
			&o.Status, &o.PaymentMethod, &o.PaymentStatus, &o.Notes,
			&o.CreatedAt, &o.UpdatedAt,
		); err != nil {
			return nil, fmt.Errorf("failed to scan order: %w", err)
		}
		orders = append(orders, o)
	}

	return orders, nil
}

// UpdateOrderStatus updates an order's status
func (sq *SQLiteDB) UpdateOrderStatus(id, status, paymentStatus string) error {
	query := `
		UPDATE orders
		SET status = ?, payment_status = ?, updated_at = datetime('now')
		WHERE id = ?
	`

	_, err := sq.db.Exec(query, status, paymentStatus, id)
	if err != nil {
		return fmt.Errorf("failed to update order status: %w", err)
	}

	return nil
}

// CreateProduct creates a new product
func (sq *SQLiteDB) CreateProduct(product *models.Product) error {
	product.ID = uuid.New().String()
	product.CreatedAt = time.Now()
	product.UpdatedAt = time.Now()

	// Convert slices to JSON strings for SQLite
	images, _ := json.Marshal(product.Images)
	sizes, _ := json.Marshal(product.Sizes)
	colors, _ := json.Marshal(product.Colors)

	query := `
		INSERT INTO products (id, name, slug, description, price, original_price, category_id,
			images, sizes, colors, stock, featured, is_new, created_at, updated_at)
		VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
	`

	_, err := sq.db.Exec(query,
		product.ID, product.Name, product.Slug, product.Description,
		product.Price, product.OriginalPrice, product.CategoryID,
		images, sizes, colors, product.Stock, product.Featured, product.IsNew,
		product.CreatedAt, product.UpdatedAt,
	)

	if err != nil {
		return fmt.Errorf("failed to create product: %w", err)
	}

	return nil
}

// UpdateProduct updates an existing product
func (sq *SQLiteDB) UpdateProduct(product *models.Product) error {
	product.UpdatedAt = time.Now()

	// Convert slices to JSON strings for SQLite
	images, _ := json.Marshal(product.Images)
	sizes, _ := json.Marshal(product.Sizes)
	colors, _ := json.Marshal(product.Colors)

	query := `
		UPDATE products
		SET name = ?, slug = ?, description = ?, price = ?, original_price = ?,
			category_id = ?, images = ?, sizes = ?, colors = ?, stock = ?,
			featured = ?, is_new = ?, updated_at = ?
		WHERE id = ?
	`

	_, err := sq.db.Exec(query,
		product.Name, product.Slug, product.Description,
		product.Price, product.OriginalPrice, product.CategoryID,
		images, sizes, colors, product.Stock, product.Featured, product.IsNew,
		product.UpdatedAt, product.ID,
	)

	if err != nil {
		return fmt.Errorf("failed to update product: %w", err)
	}

	return nil
}

// DeleteProduct deletes a product
func (sq *SQLiteDB) DeleteProduct(id string) error {
	query := `DELETE FROM products WHERE id = ?`

	result, err := sq.db.Exec(query, id)
	if err != nil {
		return fmt.Errorf("failed to delete product: %w", err)
	}

	rows, err := result.RowsAffected()
	if err != nil {
		return fmt.Errorf("failed to get affected rows: %w", err)
	}

	if rows == 0 {
		return fmt.Errorf("product not found")
	}

	return nil
}
