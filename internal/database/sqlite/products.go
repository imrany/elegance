package sqlite

import (
	"encoding/json"
	"fmt"
	"time"

	"github.com/google/uuid"
	"github.com/imrany/elegance/internal/models"
)

func (sq *SQLiteDB) GetProducts(filters models.ProductFilters) ([]models.Product, error) {
	query := `
	SELECT p.id, p.name, p.slug, p.description, p.price, p.original_price, p.category_id,
					c.name AS category_name,
					p.images, p.sizes, p.colors, p.stock, p.featured, p.is_new, p.created_at, p.updated_at
	FROM products p
	LEFT JOIN categories c ON p.category_id = c.id
	WHERE 1=1
	`
	args := []any{}

	if filters.CategoryID != nil {
		query += " AND p.category_id = ?" // Qualified column name
		args = append(args, *filters.CategoryID)
	}
	if filters.Featured != nil {
		query += " AND p.featured = ?" // Qualified column name
		args = append(args, *filters.Featured)
	}
	if filters.IsNew != nil {
		query += " AND p.is_new = ?" // Qualified column name
		args = append(args, *filters.IsNew)
	}
	if filters.Search != nil {
		query += " AND (p.name LIKE ? OR p.description LIKE ?)" // Qualified column names
		searchTerm := "%" + *filters.Search + "%"
		args = append(args, searchTerm, searchTerm)
	}

	if filters.Order != "" {
		query += " ORDER BY p." + filters.Order
	} else {
		query += " ORDER BY p.created_at DESC" // Qualified column name
	}

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
			&p.CategoryID, &p.CategoryName, &images, &sizes, &colors, &p.Stock, &p.Featured, &p.IsNew,
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
		SELECT p.id, p.name, p.slug, p.description, p.price, p.original_price, p.category_id,
							c.name AS category_name,
							p.images, p.sizes, p.colors, p.stock, p.featured, p.is_new, p.created_at, p.updated_at
			FROM products p
			LEFT JOIN categories c ON p.category_id = c.id
		WHERE p.slug = ?
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

func (sq *SQLiteDB) GetFeaturedProducts() ([]models.Product, error) {
	featured := true
	return sq.GetProducts(models.ProductFilters{Featured: &featured, Limit: 10})
}

func (sq *SQLiteDB) GetNewProducts() ([]models.Product, error) {
	isNew := true
	return sq.GetProducts(models.ProductFilters{IsNew: &isNew, Limit: 10})
}

// CreateProduct creates a new product
func (sq *SQLiteDB) CreateProduct(product *models.Product) error {
	product.ID = uuid.New().String()
	product.CreatedAt = time.Now()
	product.UpdatedAt = time.Now()

	// Convert slices to JSON strings for SQLite
	images, _ := json.Marshal(product.Images)
	sizes, _ := json.Marshal(product.Sizes)
	colors, _ := json.Marshal(product.Colors)

	query := `
		INSERT INTO products (id, name, slug, description, price, original_price, category_id,
			images, sizes, colors, stock, featured, is_new, created_at, updated_at)
		VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
	`

	_, err := sq.db.Exec(query,
		product.ID, product.Name, product.Slug, product.Description,
		product.Price, product.OriginalPrice, product.CategoryID,
		images, sizes, colors, product.Stock, product.Featured, product.IsNew,
		product.CreatedAt, product.UpdatedAt,
	)

	if err != nil {
		return fmt.Errorf("failed to create product: %w", err)
	}

	return nil
}

// UpdateProduct updates an existing product
func (sq *SQLiteDB) UpdateProduct(product *models.Product) error {
	product.UpdatedAt = time.Now()

	// Convert slices to JSON strings for SQLite
	images, _ := json.Marshal(product.Images)
	sizes, _ := json.Marshal(product.Sizes)
	colors, _ := json.Marshal(product.Colors)

	query := `
		UPDATE products
		SET name = ?, slug = ?, description = ?, price = ?, original_price = ?,
			category_id = ?, images = ?, sizes = ?, colors = ?, stock = ?,
			featured = ?, is_new = ?, updated_at = ?
		WHERE id = ?
	`

	_, err := sq.db.Exec(query,
		product.Name, product.Slug, product.Description,
		product.Price, product.OriginalPrice, product.CategoryID,
		images, sizes, colors, product.Stock, product.Featured, product.IsNew,
		product.UpdatedAt, product.ID,
	)

	if err != nil {
		return fmt.Errorf("failed to update product: %w", err)
	}

	return nil
}

// DeleteProduct deletes a product
func (sq *SQLiteDB) DeleteProduct(id string) error {
	query := `DELETE FROM products WHERE id = ?`

	result, err := sq.db.Exec(query, id)
	if err != nil {
		return fmt.Errorf("failed to delete product: %w", err)
	}

	rows, err := result.RowsAffected()
	if err != nil {
		return fmt.Errorf("failed to get affected rows: %w", err)
	}

	if rows == 0 {
		return fmt.Errorf("product not found")
	}

	return nil
}
