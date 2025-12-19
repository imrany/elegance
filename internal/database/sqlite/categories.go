package sqlite

import (
	"time"

	"github.com/google/uuid"
	"github.com/imrany/elegance/internal/models"
)

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

func (sq *SQLiteDB) DeleteCategory(idOrSlug string) error {
	_, err := sq.db.Exec(`
		DELETE FROM categories
		WHERE id = ? OR slug = ?
	`, idOrSlug, idOrSlug)
	return err
}

func (sq *SQLiteDB) CreateCategory(category *models.Category) (*models.Category, error) {
	_, err := sq.db.Exec(`
		INSERT INTO categories (id, name, slug, description, image_url, created_at, updated_at)
		VALUES (?, ?, ?, ?, ?, ?, ?)
	`, uuid.New().String(), category.Name, category.Slug, category.Description, category.ImageURL, time.Now(), time.Now())
	if err != nil {
		return nil, err
	}
	return category, nil
}

func (sq *SQLiteDB) UpdateCategory(category *models.Category) error {
	_, err := sq.db.Exec(`
		UPDATE categories
		SET name = ?, slug = ?, description = ?, image_url = ?, updated_at = ?
		WHERE id = ?
	`, category.Name, category.Slug, category.Description, category.ImageURL, time.Now(), category.ID)
	return err
}
