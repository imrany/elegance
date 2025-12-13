package sqlite

import (
	"fmt"
	"time"

	"github.com/imrany/ecommerce/internal/models"
)

func (sq *SQLiteDB) GetSiteSetting(key string) (*models.SiteSetting, error) {
	var s models.SiteSetting
	err := sq.db.QueryRow(`
		SELECT id, key, value, created_at, updated_at
		FROM site_settings
		WHERE key = ?
	`, key).Scan(&s.ID, &s.Key, &s.Value, &s.CreatedAt, &s.UpdatedAt)
	if err != nil {
		return nil, err
	}
	return &s, nil
}

func (sq *SQLiteDB) UpdateSiteSetting(key string, value []byte) error {
	query := `
		UPDATE site_settings
		SET value = ?, updated_at = ?
		WHERE key = ?
	`
	_, err := sq.db.Exec(query, value, time.Now(), key)
	if err != nil {
		return fmt.Errorf("failed to update setting: %w", err)
	}
	return nil
}
