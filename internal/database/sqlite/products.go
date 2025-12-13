package sqlite

import (
	"encoding/json"

	"github.com/imrany/ecommerce/internal/models"
)

func (sq *SQLiteDB) GetProducts(filters models.ProductFilters) ([]models.Product, error) {
	query := `
		SELECT id, name, slug, description, price, original_price, category_id,
			   images, sizes, colors, stock, featured, is_new, created_at, updated_at
		FROM products WHERE 1=1
	`
	args := []interface{}{}

	if filters.CategoryID != nil {
		query += " AND category_id = ?"
		args = append(args, *filters.CategoryID)
	}
	if filters.Featured != nil {
		query += " AND featured = ?"
		args = append(args, *filters.Featured)
	}
	if filters.IsNew != nil {
		query += " AND is_new = ?"
		args = append(args, *filters.IsNew)
	}
	if filters.Search != nil {
		query += " AND (name LIKE ? OR description LIKE ?)"
		searchTerm := "%" + *filters.Search + "%"
		args = append(args, searchTerm, searchTerm)
	}

	query += " ORDER BY created_at DESC"

	if filters.Limit > 0 {
		query += " LIMIT ?"
		args = append(args, filters.Limit)
	}
	if filters.Offset > 0 {
		query += " OFFSET ?"
		args = append(args, filters.Offset)
	}

	rows, err := sq.db.Query(query, args...)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var products []models.Product
	for rows.Next() {
		var p models.Product
		var images, sizes, colors string
		if err := rows.Scan(&p.ID, &p.Name, &p.Slug, &p.Description, &p.Price, &p.OriginalPrice,
			&p.CategoryID, &images, &sizes, &colors, &p.Stock, &p.Featured, &p.IsNew,
			&p.CreatedAt, &p.UpdatedAt); err != nil {
			return nil, err
		}
		json.Unmarshal([]byte(images), &p.Images)
		json.Unmarshal([]byte(sizes), &p.Sizes)
		json.Unmarshal([]byte(colors), &p.Colors)
		products = append(products, p)
	}
	return products, nil
}

func (sq *SQLiteDB) GetProductBySlug(slug string) (*models.Product, error) {
	var p models.Product
	var images, sizes, colors string
	err := sq.db.QueryRow(`
		SELECT id, name, slug, description, price, original_price, category_id,
			   images, sizes, colors, stock, featured, is_new, created_at, updated_at
		FROM products
		WHERE slug = ?
	`, slug).Scan(&p.ID, &p.Name, &p.Slug, &p.Description, &p.Price, &p.OriginalPrice,
		&p.CategoryID, &images, &sizes, &colors, &p.Stock, &p.Featured, &p.IsNew,
		&p.CreatedAt, &p.UpdatedAt)
	if err != nil {
		return nil, err
	}
	json.Unmarshal([]byte(images), &p.Images)
	json.Unmarshal([]byte(sizes), &p.Sizes)
	json.Unmarshal([]byte(colors), &p.Colors)
	return &p, nil
}

func (sq *SQLiteDB) GetFeaturedProducts() ([]models.Product, error) {
	featured := true
	return sq.GetProducts(models.ProductFilters{Featured: &featured, Limit: 10})
}

func (sq *SQLiteDB) GetNewProducts() ([]models.Product, error) {
	isNew := true
	return sq.GetProducts(models.ProductFilters{IsNew: &isNew, Limit: 10})
}
