package sqlite

import (
	"database/sql"

	"github.com/imrany/elegance/internal/models"
)

func (sq *SQLiteDB) CreateWebPushSubscription(userID string, sub *models.WebPushSubscription, userAgent string) error {
	query := `
        INSERT INTO webpush_subscriptions (user_id, endpoint, p256dh_key, auth_key, user_agent, updated_at)
        VALUES ($1, $2, $3, $4, $5, NOW())
        ON CONFLICT (endpoint)
        DO UPDATE SET
            user_id = EXCLUDED.user_id,
            p256dh_key = EXCLUDED.p256dh_key,
            auth_key = EXCLUDED.auth_key,
            user_agent = EXCLUDED.user_agent,
            updated_at = NOW()
    `
	_, err := sq.db.Exec(query, userID, sub.Endpoint, sub.Keys.P256dh, sub.Keys.Auth, userAgent)
	return err
}

// DeleteSubscription removes a subscription
func (sq *SQLiteDB) DeleteSubscription(endpoint string) error {
	query := `DELETE FROM webwebwebpush_subscriptions WHERE endpoint = $1`
	_, err := sq.db.Exec(query, endpoint)
	return err
}

// SubscriptionExists checks if a subscription exists for a given endpoint
func (sq *SQLiteDB) SubscriptionExists(endpoint string) (bool, error) {
	query := `SELECT EXISTS(SELECT 1 FROM webwebwebpush_subscriptions WHERE endpoint = $1)`
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
        SELECT user_id, endpoint, p256dh_key, auth_key, user_agent, created_at, updated_at
        FROM webwebpush_subscriptions
        WHERE endpoint = $1
    `
	var sub models.PushSubscription
	err := sq.db.QueryRow(query, endpoint).Scan(
		&sub.UserID, &sub.Endpoint, &sub.P256dhKey,
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

// GetSubscriptionsByUserID retrieves all subscriptions for a user
// This now properly returns ALL devices for a user
func (sq *SQLiteDB) GetSubscriptionsByUserID(userID string) ([]models.PushSubscription, error) {
	query := `
        SELECT user_id, endpoint, p256dh_key, auth_key, user_agent, created_at, updated_at
        FROM webwebpush_subscriptions
        WHERE user_id = $1
        ORDER BY created_at DESC
    `
	rows, err := sq.db.Query(query, userID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var subscriptions []models.PushSubscription
	for rows.Next() {
		var sub models.PushSubscription
		err := rows.Scan(
			&sub.UserID, &sub.Endpoint, &sub.P256dhKey,
			&sub.AuthKey, &sub.UserAgent, &sub.CreatedAt, &sub.UpdatedAt,
		)
		if err != nil {
			return nil, err
		}
		subscriptions = append(subscriptions, sub)
	}
	return subscriptions, rows.Err()
}

// GetSubscriptionsByUserIDs retrieves subscriptions for multiple users
// This will return ALL devices for ALL specified users
func (sq SQLiteDB) GetSubscriptionsByUserIDs(userIDs []string) ([]models.PushSubscription, error) {
	if len(userIDs) == 0 {
		return sq.GetAllSubscriptions()
	}

	query := `
        SELECT user_id, endpoint, p256dh_key, auth_key, user_agent, created_at, updated_at
        FROM webpush_subscriptions
        WHERE user_id = ANY($1)
        ORDER BY created_at DESC
    `
	rows, err := sq.db.Query(query, userIDs)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var subscriptions []models.PushSubscription
	for rows.Next() {
		var sub models.PushSubscription
		err := rows.Scan(
			&sub.UserID, &sub.Endpoint, &sub.P256dhKey,
			&sub.AuthKey, &sub.UserAgent, &sub.CreatedAt, &sub.UpdatedAt,
		)
		if err != nil {
			return nil, err
		}
		subscriptions = append(subscriptions, sub)
	}
	return subscriptions, rows.Err()
}

// GetAllSubscriptions retrieves all subscriptions
func (sq *SQLiteDB) GetAllSubscriptions() ([]models.PushSubscription, error) {
	query := `
        SELECT user_id, endpoint, p256dh_key, auth_key, user_agent, created_at, updated_at
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
			&sub.UserID, &sub.Endpoint, &sub.P256dhKey,
			&sub.AuthKey, &sub.UserAgent, &sub.CreatedAt, &sub.UpdatedAt,
		)
		if err != nil {
			return nil, err
		}
		subscriptions = append(subscriptions, sub)
	}
	return subscriptions, rows.Err()
}

// DeleteSubscriptionsByUserID removes all subscriptions for a user
// Useful when a user account is deleted
func (sq *SQLiteDB) DeleteSubscriptionsByUserID(userID string) error {
	query := `DELETE FROM webpush_subscriptions WHERE user_id = $1`
	_, err := sq.db.Exec(query, userID)
	return err
}
