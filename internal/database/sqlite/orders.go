package sqlite

import (
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
