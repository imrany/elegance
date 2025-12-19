package sqlite

import (
	"encoding/json"
	"fmt"
	"time"

	"github.com/google/uuid"
	"github.com/imrany/elegance/internal/models"
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

// We need to change the function signature to take a key (column) and a value (search term).
// The value can be a pointer if it's optional. The key should be a string.
func (sq *SQLiteDB) GetOrdersByOption(key string, value *string) ([]models.Order, error) {
	// Base query structure
	baseQuery := `
			SELECT id, customer, shipping, items, subtotal, delivery_fee, total,
						   notes, payment_method, status, payment_status, created_at, updated_at
					FROM orders
		`

	// Start building dynamic query parts
	whereClause := ""
	args := []any{}

	// Validate the input key against a whitelist to prevent SQL injection vulnerabilities
	validColumns := map[string]string{
		"id":             "id",
		"status":         "status",
		"payment_status": "payment_status",
		"created_at":     "created_at",
		"updated_at":     "updated_at",
		"email":          "json_extract(customer, '$.email')",
		"user_id":        "json_extract(customer, '$.user_id')",
		"phone_number":   "json_extract(customer, '$.phone_number')",
		"first_name":     "json_extract(customer, '$.first_name')",
		"last_name":      "json_extract(customer, '$.last_name')",
		"address":        "json_extract(shipping, '$.address')",
		"city":           "json_extract(shipping, '$.city')",
	}

	if value != nil && key != "" {
		dbColumn, ok := validColumns[key]
		if !ok {
			return nil, fmt.Errorf("invalid search key: %s", key)
		}

		// Add the specific WHERE condition
		whereClause = fmt.Sprintf(" WHERE %s = ?", dbColumn)
		args = append(args, *value)
	}

	// Finalize the query
	query := baseQuery + whereClause + " ORDER BY created_at DESC"

	// Execute the query using the dynamic arguments slice
	rows, err := sq.db.Query(query, args...)

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
