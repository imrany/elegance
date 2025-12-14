package postgres

import (
	"encoding/json"
	"fmt"

	"github.com/imrany/ecommerce/internal/models"
)

func (pg *PostgresDB) GetProducts(filters models.ProductFilters) ([]models.Product, error) {
	query := `
	SELECT p.id, p.name, p.slug, p.description, p.price, p.original_price, p.category_id,
						c.name AS category_name,
						p.images, p.sizes, p.colors, p.stock, p.featured, p.is_new, p.created_at, p.updated_at
		FROM products p
		LEFT JOIN categories c ON p.category_id = c.id
		WHERE 1=1
	`
	args := []any{}
	argIdx := 1

	if filters.CategoryID != nil {
		query += fmt.Sprintf(" AND p.category_id = $%d", argIdx)
		args = append(args, *filters.CategoryID)
		argIdx++
	}
	if filters.Featured != nil {
		query += fmt.Sprintf(" AND p.featured = $%d", argIdx)
		args = append(args, *filters.Featured)
		argIdx++
	}
	if filters.IsNew != nil {
		query += fmt.Sprintf(" AND p.is_new = $%d", argIdx)
		args = append(args, *filters.IsNew)
		argIdx++
	}
	if filters.Search != nil {
		query += fmt.Sprintf(" AND (p.name ILIKE $%d OR p.description ILIKE $%d)", argIdx, argIdx)
		searchTerm := "%" + *filters.Search + "%"
		args = append(args, searchTerm)
		argIdx++
	}

	if filters.Order != "" {
		query += " ORDER BY p." + filters.Order
	} else {
		query += " ORDER BY p.created_at DESC"
	}

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
			&p.CategoryID, &p.CategoryName, &images, &sizes, &colors, &p.Stock, &p.Featured, &p.IsNew,
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
		SELECT p.id, p.name, p.slug, p.description, p.price, p.original_price, p.category_id,
								c.name AS category_name,
								p.images, p.sizes, p.colors, p.stock, p.featured, p.is_new, p.created_at, p.updated_at
				FROM products p
				LEFT JOIN categories c ON p.category_id = c.id
		WHERE slug = $1
	`, slug).Scan(&p.ID, &p.Name, &p.Slug, &p.Description, &p.Price, &p.OriginalPrice,
		&p.CategoryID, &p.CategoryName, &images, &sizes, &colors, &p.Stock, &p.Featured, &p.IsNew,
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
