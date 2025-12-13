package postgres

import "github.com/imrany/ecommerce/internal/models"

func (pg *PostgresDB) GetCategories() ([]models.Category, error) {
	rows, err := pg.db.Query(`
		SELECT id, name, slug, description, image_url, created_at, updated_at
		FROM categories
		ORDER BY created_at DESC
	`)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var categories []models.Category
	for rows.Next() {
		var c models.Category
		if err := rows.Scan(&c.ID, &c.Name, &c.Slug, &c.Description, &c.ImageURL, &c.CreatedAt, &c.UpdatedAt); err != nil {
			return nil, err
		}
		categories = append(categories, c)
	}
	return categories, nil
}

func (pg *PostgresDB) GetCategoryBySlug(slug string) (*models.Category, error) {
	var c models.Category
	err := pg.db.QueryRow(`
		SELECT id, name, slug, description, image_url, created_at, updated_at
		FROM categories
		WHERE slug = $1
	`, slug).Scan(&c.ID, &c.Name, &c.Slug, &c.Description, &c.ImageURL, &c.CreatedAt, &c.UpdatedAt)
	if err != nil {
		return nil, err
	}
	return &c, nil
}
