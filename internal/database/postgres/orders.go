package postgres

import (
	"encoding/json"
	"fmt"
	"time"

	"github.com/google/uuid"
	"github.com/imrany/ecommerce/internal/models"
)

func (pg *PostgresDB) CreateOrder(order *models.Order) error {
	order.ID = uuid.New().String()
	order.CreatedAt = time.Now()
	order.UpdatedAt = time.Now()
	order.Status = "pending"
	order.PaymentStatus = "pending"

	_, err := pg.db.Exec(`
		INSERT INTO orders (id, user_id, customer_name, customer_email, customer_phone,
			delivery_address, items, subtotal, delivery_fee, total, status, payment_method,
			payment_status, notes, created_at, updated_at)
		VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16)
	`, order.ID, order.UserID, order.CustomerName, order.CustomerEmail, order.CustomerPhone,
		order.DeliveryAddress, order.Items, order.Subtotal, order.DeliveryFee, order.Total,
		order.Status, order.PaymentMethod, order.PaymentStatus, order.Notes,
		order.CreatedAt, order.UpdatedAt)
	return err
}

func (pg *PostgresDB) GetOrderByID(id string) (*models.Order, error) {
	var o models.Order
	err := pg.db.QueryRow(`
		SELECT id, user_id, customer_name, customer_email, customer_phone, delivery_address,
			   items, subtotal, delivery_fee, total, status, payment_method, payment_status,
			   notes, created_at, updated_at
		FROM orders
		WHERE id = $1
	`, id).Scan(&o.ID, &o.UserID, &o.CustomerName, &o.CustomerEmail, &o.CustomerPhone,
		&o.DeliveryAddress, &o.Items, &o.Subtotal, &o.DeliveryFee, &o.Total, &o.Status,
		&o.PaymentMethod, &o.PaymentStatus, &o.Notes, &o.CreatedAt, &o.UpdatedAt)
	if err != nil {
		return nil, err
	}
	return &o, nil
}

// GetAllOrders retrieves all orders (admin)
func (pg *PostgresDB) GetAllOrders() ([]models.Order, error) {
	query := `
		SELECT id, user_id, customer_name, customer_email, customer_phone, delivery_address,
			   items, subtotal, delivery_fee, total, status, payment_method, payment_status,
			   notes, created_at, updated_at
		FROM orders
		ORDER BY created_at DESC
	`

	rows, err := pg.db.Query(query)
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

	if err := rows.Err(); err != nil {
		return nil, fmt.Errorf("error iterating orders: %w", err)
	}

	return orders, nil
}

// UpdateOrderStatus updates an order's status
func (pg *PostgresDB) UpdateOrderStatus(id, status, paymentStatus string) error {
	query := `
		UPDATE orders
		SET status = $1, payment_status = $2, updated_at = NOW()
		WHERE id = $3
	`

	_, err := pg.db.Exec(query, status, paymentStatus, id)
	if err != nil {
		return fmt.Errorf("failed to update order status: %w", err)
	}

	return nil
}

// CreateProduct creates a new product
func (pg *PostgresDB) CreateProduct(product *models.Product) error {
	product.ID = uuid.New().String()
	product.CreatedAt = time.Now()
	product.UpdatedAt = time.Now()

	// Convert slices to PostgreSQL arrays
	images, _ := json.Marshal(product.Images)
	sizes, _ := json.Marshal(product.Sizes)
	colors, _ := json.Marshal(product.Colors)

	query := `
		INSERT INTO products (id, name, slug, description, price, original_price, category_id,
			images, sizes, colors, stock, featured, is_new, created_at, updated_at)
		VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
	`

	_, err := pg.db.Exec(query,
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
func (pg *PostgresDB) UpdateProduct(product *models.Product) error {
	product.UpdatedAt = time.Now()

	// Convert slices to PostgreSQL arrays
	images, _ := json.Marshal(product.Images)
	sizes, _ := json.Marshal(product.Sizes)
	colors, _ := json.Marshal(product.Colors)

	query := `
		UPDATE products
		SET name = $1, slug = $2, description = $3, price = $4, original_price = $5,
			category_id = $6, images = $7, sizes = $8, colors = $9, stock = $10,
			featured = $11, is_new = $12, updated_at = $13
		WHERE id = $14
	`

	_, err := pg.db.Exec(query,
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
func (pg *PostgresDB) DeleteProduct(id string) error {
	query := `DELETE FROM products WHERE id = $1`

	result, err := pg.db.Exec(query, id)
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
