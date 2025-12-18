package postgres

import (
	"fmt"
	"time"

	"github.com/imrany/ecommerce/internal/models"
)

func (pg *PostgresDB) GetWebsiteSettingByKey(key string) (models.WebsiteSetting, error) {
	query := `
		SELECT id, key, value, created_at, updated_at
		FROM website_settings_config
		WHERE key = $1
	`
	var s models.WebsiteSetting
	err := pg.db.QueryRow(query, key).Scan(
		&s.ID,
		&s.Key,
		&s.Value,
		&s.CreatedAt,
		&s.UpdatedAt,
	)
	if err != nil {
		return models.WebsiteSetting{}, fmt.Errorf("failed to retrieve setting for key '%s': %w", key, err)
	}
	return s, nil
}

// GetAllWebsiteSettings retrieves all website settings, ordered by creation date.
// Returns a slice of models.WebsiteSetting. If no settings are found, an empty slice is returned.
func (pg *PostgresDB) GetAllWebsiteSettings() ([]models.WebsiteSetting, error) {
	var settings []models.WebsiteSetting
	query := `
		SELECT id, key, value, created_at, updated_at
		FROM website_settings_config
		ORDER BY created_at DESC
	`

	rows, err := pg.db.Query(query)
	if err != nil {
		return nil, fmt.Errorf("failed to execute query for all settings: %w", err)
	}
	defer rows.Close()

	for rows.Next() {
		var s models.WebsiteSetting
		err := rows.Scan(
			&s.ID,
			&s.Key,
			&s.Value,
			&s.CreatedAt,
			&s.UpdatedAt,
		)
		if err != nil {
			return nil, fmt.Errorf("failed to scan all settings row: %w", err)
		}
		settings = append(settings, s)
	}

	if err = rows.Err(); err != nil {
		return nil, fmt.Errorf("error iterating all settings rows: %w", err)
	}

	return settings, nil
}

// UpdateWebsiteSetting updates an existing website setting
func (pg *PostgresDB) UpdateWebsiteSetting(key string, value string) error {
	query := `
		UPDATE website_settings_config
		SET value = $1, updated_at = $2
		WHERE key = $3
	`
	_, err := pg.db.Exec(query, value, time.Now(), key)
	if err != nil {
		return fmt.Errorf("failed to update setting: %w", err)
	}
	return nil
}
