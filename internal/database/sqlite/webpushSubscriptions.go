package sqlite

import (
	"database/sql"

	"github.com/imrany/elegance/internal/models"
)

func (sq *SQLiteDB) CreateWebPushSubscription(sub *models.WebPushSubscription) error {
	query := `
        INSERT INTO webpush_subscriptions (endpoint, p256dh_key, auth_key, user_agent, updated_at)
        VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP)
        ON CONFLICT (endpoint)
        DO UPDATE SET
            p256dh_key = EXCLUDED.p256dh_key,
            auth_key = EXCLUDED.auth_key,
            user_agent = EXCLUDED.user_agent,
            updated_at = CURRENT_TIMESTAMP
    `
	_, err := sq.db.Exec(query, sub.Endpoint, sub.P256dh, sub.Auth, sub.UserAgent)
	return err
}

// DeleteSubscription removes a subscription
func (sq *SQLiteDB) DeleteSubscription(endpoint string) error {
	query := `DELETE FROM webpush_subscriptions WHERE endpoint = ?`
	_, err := sq.db.Exec(query, endpoint)
	return err
}

// SubscriptionExists checks if a subscription exists for a given endpoint
func (sq *SQLiteDB) SubscriptionExists(endpoint string) (bool, error) {
	// SQLite supports the EXISTS expression natively with integer conversion
	query := `SELECT EXISTS(SELECT 1 FROM webpush_subscriptions WHERE endpoint = ?)`
	var exists bool
	err := sq.db.QueryRow(query, endpoint).Scan(&exists)
	if err != nil {
		return false, err
	}
	return exists, nil
}

// GetSubscriptionByEndpoint retrieves a single subscription by endpoint
func (sq *SQLiteDB) GetSubscriptionByEndpoint(endpoint string) (*models.PushSubscription, error) {
	query := `
        SELECT endpoint, p256dh_key, auth_key, user_agent, created_at, updated_at
        FROM webpush_subscriptions
        WHERE endpoint = ?
    `
	var sub models.PushSubscription
	err := sq.db.QueryRow(query, endpoint).Scan(
		&sub.Endpoint, &sub.P256dhKey,
		&sub.AuthKey, &sub.UserAgent, &sub.CreatedAt, &sub.UpdatedAt,
	)
	if err == sql.ErrNoRows {
		return nil, nil
	}
	if err != nil {
		return nil, err
	}
	return &sub, nil
}

// GetAllSubscriptions retrieves all subscriptions
func (sq *SQLiteDB) GetAllSubscriptions() ([]models.PushSubscription, error) {
	query := `
        SELECT endpoint, p256dh_key, auth_key, user_agent, created_at, updated_at
        FROM webpush_subscriptions
        ORDER BY created_at DESC
    `
	rows, err := sq.db.Query(query)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var subscriptions []models.PushSubscription
	for rows.Next() {
		var sub models.PushSubscription
		err := rows.Scan(
			&sub.Endpoint, &sub.P256dhKey,
			&sub.AuthKey, &sub.UserAgent, &sub.CreatedAt, &sub.UpdatedAt,
		)
		if err != nil {
			return nil, err
		}
		subscriptions = append(subscriptions, sub)
	}
	return subscriptions, rows.Err()
}
