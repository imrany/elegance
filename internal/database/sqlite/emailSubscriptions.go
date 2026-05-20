package sqlite

import (
	"database/sql"
	"errors"

	"github.com/imrany/elegance/internal/models"
)

func (sq *SQLiteDB) GetEmailSubscriptions() ([]models.EmailSubscription, error) {
	rows, err := sq.db.Query(`
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

func (sq *SQLiteDB) GetEmailSubscriptionByEmail(email string) (*models.EmailSubscription, error) {
	var s models.EmailSubscription
	err := sq.db.QueryRow(`
		SELECT id, email, created_at
		FROM email_subscriptions
		WHERE email = ?
	`, email).Scan(&s.ID, &s.Email, &s.CreatedAt)

	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return nil, errors.New("subscription not found")
		}
		return nil, err
	}
	return &s, nil
}

func (sq *SQLiteDB) CreateEmailSubscription(subscription *models.EmailSubscription) error {
	err := sq.db.QueryRow(`
		INSERT INTO email_subscriptions (email)
		VALUES (?)
		RETURNING id, created_at
	`, subscription.Email).Scan(&subscription.ID, &subscription.CreatedAt)

	return err
}

func (sq *SQLiteDB) DeleteEmailSubscription(email string) error {
	res, err := sq.db.Exec(`
		DELETE FROM email_subscriptions
		WHERE email = ?
	`, email)
	if err != nil {
		return err
	}

	// Safeguard validation loop to verify an actual match was removed
	rowsAffected, err := res.RowsAffected()
	if err == nil && rowsAffected == 0 {
		return errors.New("subscription record not found")
	}

	return nil
}
