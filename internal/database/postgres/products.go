package postgres

import (
	"encoding/json"
	"fmt"

	"github.com/imrany/ecommerce/internal/models"
)

func (pg *PostgresDB) GetProducts(filters models.ProductFilters) ([]models.Product, error) {
	query := `
		SELECT id, name, slug, description, price, original_price, category_id,
			   images, sizes, colors, stock, featured, is_new, created_at, updated_at
		FROM products WHERE 1=1
	`
	args := []interface{}{}
	argIdx := 1

	if filters.CategoryID != nil {
		query += fmt.Sprintf(" AND category_id = $%d", argIdx)
		args = append(args, *filters.CategoryID)
		argIdx++
	}
	if filters.Featured != nil {
		query += fmt.Sprintf(" AND featured = $%d", argIdx)
		args = append(args, *filters.Featured)
		argIdx++
	}
	if filters.IsNew != nil {
		query += fmt.Sprintf(" AND is_new = $%d", argIdx)
		args = append(args, *filters.IsNew)
		argIdx++
	}
	if filters.Search != nil {
		query += fmt.Sprintf(" AND (name ILIKE $%d OR description ILIKE $%d)", argIdx, argIdx)
		searchTerm := "%" + *filters.Search + "%"
		args = append(args, searchTerm)
		argIdx++
	}

	query += " ORDER BY created_at DESC"

	if filters.Limit > 0 {
		query += fmt.Sprintf(" LIMIT $%d", argIdx)
		args = append(args, filters.Limit)
		argIdx++
	}
	if filters.Offset > 0 {
		query += fmt.Sprintf(" OFFSET $%d", argIdx)
		args = append(args, filters.Offset)
	}

	rows, err := pg.db.Query(query, args...)
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
		// Parse PostgreSQL arrays
		json.Unmarshal([]byte(images), &p.Images)
		json.Unmarshal([]byte(sizes), &p.Sizes)
		json.Unmarshal([]byte(colors), &p.Colors)
		products = append(products, p)
	}
	return products, nil
}

func (pg *PostgresDB) GetProductBySlug(slug string) (*models.Product, error) {
	var p models.Product
	var images, sizes, colors string
	err := pg.db.QueryRow(`
		SELECT id, name, slug, description, price, original_price, category_id,
			   images, sizes, colors, stock, featured, is_new, created_at, updated_at
		FROM products
		WHERE slug = $1
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

func (pg *PostgresDB) GetFeaturedProducts() ([]models.Product, error) {
	featured := true
	return pg.GetProducts(models.ProductFilters{Featured: &featured, Limit: 10})
}

func (pg *PostgresDB) GetNewProducts() ([]models.Product, error) {
	isNew := true
	return pg.GetProducts(models.ProductFilters{IsNew: &isNew, Limit: 10})
}
