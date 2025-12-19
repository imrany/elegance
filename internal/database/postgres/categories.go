package postgres

import (
	"time"

	"github.com/google/uuid"
	"github.com/imrany/elegance/internal/models"
)

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

func (pg *PostgresDB) CreateCategory(category *models.Category) (*models.Category, error) {
	_, err := pg.db.Exec(`
		INSERT INTO categories (id, name, slug, description, image_url, created_at, updated_at)
		VALUES ($1, $2, $3, $4, $5, $6, $7)
	`, uuid.New().String(), category.Name, category.Slug, category.Description, category.ImageURL, time.Now(), time.Now())
	if err != nil {
		return nil, err
	}
	return category, nil
}

func (pg *PostgresDB) UpdateCategory(category *models.Category) error {
	_, err := pg.db.Exec(`
		UPDATE categories
		SET name = $1, slug = $2, description = $3, image_url = $4, updated_at = $5
		WHERE id = $6
	`, category.Name, category.Slug, category.Description, category.ImageURL, time.Now(), category.ID)
	return err
}

func (pg *PostgresDB) DeleteCategory(idOrSlug string) error {
	_, err := pg.db.Exec(`
		DELETE FROM categories
		WHERE id = $1 OR slug = $1
	`, idOrSlug)
	return err
}
