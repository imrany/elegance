package postgres

import (
	"database/sql"
	"errors"

	"github.com/imrany/elegance/internal/models"
)

func (pg *PostgresDB) GetEmailSubscriptions() ([]models.EmailSubscription, error) {
	rows, err := pg.db.Query(`
		SELECT id, email, created_at
		FROM email_subscriptions
		ORDER BY created_at DESC
	`)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var subs []models.EmailSubscription
	for rows.Next() {
		var s models.EmailSubscription
		if err := rows.Scan(&s.ID, &s.Email, &s.CreatedAt); err != nil {
			return nil, err
		}
		subs = append(subs, s)
	}

	if err = rows.Err(); err != nil {
		return nil, err
	}

	return subs, nil
}

func (pg *PostgresDB) GetEmailSubscriptionByEmail(email string) (*models.EmailSubscription, error) {
	var s models.EmailSubscription
	err := pg.db.QueryRow(`
		SELECT id, email, created_at
		FROM email_subscriptions
		WHERE email = $1
	`, email).Scan(&s.ID, &s.Email, &s.CreatedAt)

	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return nil, errors.New("subscription not found")
		}
		return nil, err
	}
	return &s, nil
}

func (pg *PostgresDB) CreateEmailSubscription(subscription *models.EmailSubscription) error {
	err := pg.db.QueryRow(`
		INSERT INTO email_subscriptions (email)
		VALUES ($1)
		RETURNING id, created_at
	`, subscription.Email).Scan(&subscription.ID, &subscription.CreatedAt)

	return err
}

func (pg *PostgresDB) DeleteEmailSubscription(email string) error {
	res, err := pg.db.Exec(`
		DELETE FROM email_subscriptions
		WHERE email = $1
	`, email)
	if err != nil {
		return err
	}

	// Verify that a row was actually found and removed
	rowsAffected, err := res.RowsAffected()
	if err == nil && rowsAffected == 0 {
		return errors.New("subscription record not found")
	}

	return nil
}
