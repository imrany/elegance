package sqlite

import (
	"database/sql"
	"encoding/json"
	"fmt"
	"time"

	"github.com/google/uuid"
	"github.com/imrany/ecommerce/internal/models"
)

// CreateOrder creates a new order with nested customer and shipping information
func (sq *SQLiteDB) CreateOrder(order *models.Order) error {
	order.ID = uuid.New().String()
	order.CreatedAt = time.Now()
	order.UpdatedAt = time.Now()
	order.Status = "pending"

	// Default payment status if not set
	if order.PaymentStatus == "" {
		order.PaymentStatus = "pending"
	}

	// Marshal nested structures to JSON
	customerJSON, err := json.Marshal(order.Customer)
	if err != nil {
		return fmt.Errorf("failed to marshal customer data: %w", err)
	}

	shippingJSON, err := json.Marshal(order.Shipping)
	if err != nil {
		return fmt.Errorf("failed to marshal shipping data: %w", err)
	}

	itemsJSON, err := json.Marshal(order.Items)
	if err != nil {
		return fmt.Errorf("failed to marshal items data: %w", err)
	}

	query := `
		INSERT INTO orders (
			id, customer, shipping, items, subtotal, delivery_fee, total,
			notes, payment_method, status, payment_status, created_at, updated_at
		)
		VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
	`

	_, err = sq.db.Exec(query,
		order.ID,
		string(customerJSON),
		string(shippingJSON),
		string(itemsJSON),
		order.Subtotal,
		order.DeliveryFee,
		order.Total,
		order.Notes,
		order.PaymentMethod,
		order.Status,
		order.PaymentStatus,
		order.CreatedAt,
		order.UpdatedAt,
	)

	if err != nil {
		return fmt.Errorf("failed to create order: %w", err)
	}

	return nil
}

// GetOrderByID retrieves a single order by ID
func (sq *SQLiteDB) GetOrderByID(id string) (*models.Order, error) {
	var order models.Order
	var customerJSON, shippingJSON, itemsJSON string

	query := `
		SELECT id, customer, shipping, items, subtotal, delivery_fee, total,
			   notes, payment_method, status, payment_status, created_at, updated_at
		FROM orders
		WHERE id = ?
	`

	err := sq.db.QueryRow(query, id).Scan(
		&order.ID,
		&customerJSON,
		&shippingJSON,
		&itemsJSON,
		&order.Subtotal,
		&order.DeliveryFee,
		&order.Total,
		&order.Notes,
		&order.PaymentMethod,
		&order.Status,
		&order.PaymentStatus,
		&order.CreatedAt,
		&order.UpdatedAt,
	)

	if err != nil {
		if err == sql.ErrNoRows {
			return nil, fmt.Errorf("order not found")
		}
		return nil, fmt.Errorf("failed to get order: %w", err)
	}

	// Unmarshal JSON data
	if err := json.Unmarshal([]byte(customerJSON), &order.Customer); err != nil {
		return nil, fmt.Errorf("failed to unmarshal customer data: %w", err)
	}

	if err := json.Unmarshal([]byte(shippingJSON), &order.Shipping); err != nil {
		return nil, fmt.Errorf("failed to unmarshal shipping data: %w", err)
	}

	if err := json.Unmarshal([]byte(itemsJSON), &order.Items); err != nil {
		return nil, fmt.Errorf("failed to unmarshal items data: %w", err)
	}

	return &order, nil
}

// GetAllOrders retrieves all orders (admin)
func (sq *SQLiteDB) GetAllOrders() ([]models.Order, error) {
	query := `
		SELECT id, customer, shipping, items, subtotal, delivery_fee, total,
			   notes, payment_method, status, payment_status, created_at, updated_at
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
		var order models.Order
		var customerJSON, shippingJSON, itemsJSON string

		if err := rows.Scan(
			&order.ID,
			&customerJSON,
			&shippingJSON,
			&itemsJSON,
			&order.Subtotal,
			&order.DeliveryFee,
			&order.Total,
			&order.Notes,
			&order.PaymentMethod,
			&order.Status,
			&order.PaymentStatus,
			&order.CreatedAt,
			&order.UpdatedAt,
		); err != nil {
			return nil, fmt.Errorf("failed to scan order: %w", err)
		}

		// Unmarshal JSON data
		if err := json.Unmarshal([]byte(customerJSON), &order.Customer); err != nil {
			return nil, fmt.Errorf("failed to unmarshal customer data: %w", err)
		}

		if err := json.Unmarshal([]byte(shippingJSON), &order.Shipping); err != nil {
			return nil, fmt.Errorf("failed to unmarshal shipping data: %w", err)
		}

		if err := json.Unmarshal([]byte(itemsJSON), &order.Items); err != nil {
			return nil, fmt.Errorf("failed to unmarshal items data: %w", err)
		}

		orders = append(orders, order)
	}

	if err := rows.Err(); err != nil {
		return nil, fmt.Errorf("error iterating orders: %w", err)
	}

	return orders, nil
}

// GetOrdersByCustomerEmail retrieves all orders for a specific customer email
func (sq *SQLiteDB) GetOrdersByCustomerEmail(email string) ([]models.Order, error) {
	query := `
		SELECT id, customer, shipping, items, subtotal, delivery_fee, total,
			   notes, payment_method, status, payment_status, created_at, updated_at
		FROM orders
		WHERE json_extract(customer, '$.email') = ?
		ORDER BY created_at DESC
	`

	rows, err := sq.db.Query(query, email)
	if err != nil {
		return nil, fmt.Errorf("failed to query orders: %w", err)
	}
	defer rows.Close()

	var orders []models.Order
	for rows.Next() {
		var order models.Order
		var customerJSON, shippingJSON, itemsJSON string

		if err := rows.Scan(
			&order.ID,
			&customerJSON,
			&shippingJSON,
			&itemsJSON,
			&order.Subtotal,
			&order.DeliveryFee,
			&order.Total,
			&order.Notes,
			&order.PaymentMethod,
			&order.Status,
			&order.PaymentStatus,
			&order.CreatedAt,
			&order.UpdatedAt,
		); err != nil {
			return nil, fmt.Errorf("failed to scan order: %w", err)
		}

		// Unmarshal JSON data
		if err := json.Unmarshal([]byte(customerJSON), &order.Customer); err != nil {
			return nil, fmt.Errorf("failed to unmarshal customer data: %w", err)
		}

		if err := json.Unmarshal([]byte(shippingJSON), &order.Shipping); err != nil {
			return nil, fmt.Errorf("failed to unmarshal shipping data: %w", err)
		}

		if err := json.Unmarshal([]byte(itemsJSON), &order.Items); err != nil {
			return nil, fmt.Errorf("failed to unmarshal items data: %w", err)
		}

		orders = append(orders, order)
	}

	if err := rows.Err(); err != nil {
		return nil, fmt.Errorf("error iterating orders: %w", err)
	}

	return orders, nil
}

// UpdateOrderStatus updates an order's status and payment status
func (sq *SQLiteDB) UpdateOrderStatus(id, status, paymentStatus string) error {
	query := `
		UPDATE orders
		SET status = ?, payment_status = ?, updated_at = datetime('now')
		WHERE id = ?
	`

	result, err := sq.db.Exec(query, status, paymentStatus, id)
	if err != nil {
		return fmt.Errorf("failed to update order status: %w", err)
	}

	rows, err := result.RowsAffected()
	if err != nil {
		return fmt.Errorf("failed to get affected rows: %w", err)
	}

	if rows == 0 {
		return fmt.Errorf("order not found")
	}

	return nil
}

// UpdateOrder updates the entire order
func (sq *SQLiteDB) UpdateOrder(order *models.Order) error {
	order.UpdatedAt = time.Now()

	// Marshal nested structures to JSON
	customerJSON, err := json.Marshal(order.Customer)
	if err != nil {
		return fmt.Errorf("failed to marshal customer data: %w", err)
	}

	shippingJSON, err := json.Marshal(order.Shipping)
	if err != nil {
		return fmt.Errorf("failed to marshal shipping data: %w", err)
	}

	itemsJSON, err := json.Marshal(order.Items)
	if err != nil {
		return fmt.Errorf("failed to marshal items data: %w", err)
	}

	query := `
		UPDATE orders
		SET customer = ?, shipping = ?, items = ?, subtotal = ?, delivery_fee = ?,
			total = ?, notes = ?, payment_method = ?, status = ?, payment_status = ?,
			updated_at = ?
		WHERE id = ?
	`

	result, err := sq.db.Exec(query,
		string(customerJSON),
		string(shippingJSON),
		string(itemsJSON),
		order.Subtotal,
		order.DeliveryFee,
		order.Total,
		order.Notes,
		order.PaymentMethod,
		order.Status,
		order.PaymentStatus,
		order.UpdatedAt,
		order.ID,
	)

	if err != nil {
		return fmt.Errorf("failed to update order: %w", err)
	}

	rows, err := result.RowsAffected()
	if err != nil {
		return fmt.Errorf("failed to get affected rows: %w", err)
	}

	if rows == 0 {
		return fmt.Errorf("order not found")
	}

	return nil
}

// DeleteOrder deletes an order
func (sq *SQLiteDB) DeleteOrder(id string) error {
	query := `DELETE FROM orders WHERE id = ?`

	result, err := sq.db.Exec(query, id)
	if err != nil {
		return fmt.Errorf("failed to delete order: %w", err)
	}

	rows, err := result.RowsAffected()
	if err != nil {
		return fmt.Errorf("failed to get affected rows: %w", err)
	}

	if rows == 0 {
		return fmt.Errorf("order not found")
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

// GetUserOrders retrieves orders for a specific user
func (sq *SQLiteDB) GetUserOrders(userId string) ([]models.Order, error) {
	query := `
		SELECT id, user_id, status, total_price, created_at, updated_at
		FROM orders
		WHERE user_id = ?
	`

	rows, err := sq.db.Query(query, userId)
	if err != nil {
		return nil, fmt.Errorf("failed to get user orders: %w", err)
	}
	defer rows.Close()

	var orders []models.Order
	for rows.Next() {
		var order models.Order
		if err := rows.Scan(
			&order.ID, &order.Customer.UserID, &order.Status, &order.Total,
			&order.CreatedAt, &order.UpdatedAt,
		); err != nil {
			return nil, fmt.Errorf("failed to scan order: %w", err)
		}
		orders = append(orders, order)
	}

	if err := rows.Err(); err != nil {
		return nil, fmt.Errorf("failed to iterate over rows: %w", err)
	}

	return orders, nil
}
