package postgres

import (
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
