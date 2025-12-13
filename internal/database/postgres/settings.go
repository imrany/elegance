package postgres

import (
	"fmt"
	"time"

	"github.com/imrany/ecommerce/internal/models"
)

func (pg *PostgresDB) GetSiteSetting(key string) (*models.SiteSetting, error) {
	var s models.SiteSetting
	err := pg.db.QueryRow(`
		SELECT id, key, value, created_at, updated_at
		FROM site_settings
		WHERE key = $1
	`, key).Scan(&s.ID, &s.Key, &s.Value, &s.CreatedAt, &s.UpdatedAt)
	if err != nil {
		return nil, err
	}
	return &s, nil
}

func (pg *PostgresDB) UpdateSiteSetting(key string, value []byte) error {
	query := `
		UPDATE site_settings
		SET value = $1, updated_at = $2
		WHERE key = $3
	`
	_, err := pg.db.Exec(query, value, time.Now(), key)
	if err != nil {
		return fmt.Errorf("failed to update setting: %w", err)
	}
	return nil
}
