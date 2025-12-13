package sqlite

import "github.com/imrany/ecommerce/internal/models"

func (sq *SQLiteDB) GetCategories() ([]models.Category, error) {
	rows, err := sq.db.Query(`
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

func (sq *SQLiteDB) GetCategoryBySlug(slug string) (*models.Category, error) {
	var c models.Category
	err := sq.db.QueryRow(`
		SELECT id, name, slug, description, image_url, created_at, updated_at
		FROM categories
		WHERE slug = ?
	`, slug).Scan(&c.ID, &c.Name, &c.Slug, &c.Description, &c.ImageURL, &c.CreatedAt, &c.UpdatedAt)
	if err != nil {
		return nil, err
	}
	return &c, nil
}
