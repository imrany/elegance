package postgres

import (
	"database/sql"
	"encoding/json"
	"fmt"
	"log"
	"time"

	"github.com/google/uuid"
	"github.com/imrany/elegance/internal/models"
)

func (pg *PostgresDB) GetPages() ([]models.Page, error) {
	query := `SELECT id, title, slug, template, status, meta_title, meta_description, meta_keywords, og_image, sections, created_at, updated_at, published_at FROM pages ORDER BY updated_at DESC`

	log.Printf("Executing query: %s", query)

	rows, err := pg.db.Query(query)
	if err != nil {
		log.Printf("Error executing query: %v", err)
		return nil, fmt.Errorf("failed to query pages: %w", err)
	}
	defer rows.Close()

	var pages []models.Page
	for rows.Next() {
		var p models.Page
		var sectionsJSON []byte
		var publishedAt sql.NullTime
		// Use sql.NullString for nullable string fields
		var metaTitle, metaDescription, metaKeywords, ogImage sql.NullString

		err := rows.Scan(
			&p.ID,
			&p.Title,
			&p.Slug,
			&p.Template,
			&p.Status,
			&metaTitle,
			&metaDescription,
			&metaKeywords,
			&ogImage,
			&sectionsJSON,
			&p.CreatedAt,
			&p.UpdatedAt,
			&publishedAt,
		)

		if err != nil {
			log.Printf("Error scanning row: %v", err)
			return nil, fmt.Errorf("failed to scan page: %w", err)
		}

		// Handle nullable strings
		if metaTitle.Valid {
			p.MetaTitle = metaTitle.String
		}
		if metaDescription.Valid {
			p.MetaDescription = metaDescription.String
		}
		if metaKeywords.Valid {
			p.MetaKeywords = metaKeywords.String
		}
		if ogImage.Valid {
			p.OGImage = ogImage.String
		}

		// Parse sections JSON
		if len(sectionsJSON) > 0 {
			if err := json.Unmarshal(sectionsJSON, &p.Sections); err != nil {
				log.Printf("Error unmarshaling sections: %v", err)
				p.Sections = []interface{}{}
			}
		} else {
			p.Sections = []interface{}{}
		}

		// Handle nullable published_at
		if publishedAt.Valid {
			p.PublishedAt = &publishedAt.Time
		}

		pages = append(pages, p)
	}

	log.Printf("Retrieved %d pages", len(pages))
	return pages, nil
}

func (pg *PostgresDB) GetPage(pageId string) (*models.Page, error) {
	query := `SELECT id, title, slug, template, status, meta_title, meta_description, meta_keywords, og_image, sections, created_at, updated_at, published_at FROM pages WHERE id = $1 OR template = $1 OR slug = $1`

	log.Printf("Getting page with ID/slug/template: %s", pageId)

	row := pg.db.QueryRow(query, pageId)

	var p models.Page
	var sectionsJSON []byte
	var publishedAt sql.NullTime
	// Use sql.NullString for nullable string fields
	var metaTitle, metaDescription, metaKeywords, ogImage sql.NullString

	err := row.Scan(
		&p.ID,
		&p.Title,
		&p.Slug,
		&p.Template,
		&p.Status,
		&metaTitle,
		&metaDescription,
		&metaKeywords,
		&ogImage,
		&sectionsJSON,
		&p.CreatedAt,
		&p.UpdatedAt,
		&publishedAt,
	)

	if err != nil {
		if err == sql.ErrNoRows {
			log.Printf("Page not found: %s", pageId)
			return nil, fmt.Errorf("page not found")
		}
		log.Printf("Error scanning page: %v", err)
		return nil, fmt.Errorf("failed to get page: %w", err)
	}

	// Handle nullable strings
	if metaTitle.Valid {
		p.MetaTitle = metaTitle.String
	}
	if metaDescription.Valid {
		p.MetaDescription = metaDescription.String
	}
	if metaKeywords.Valid {
		p.MetaKeywords = metaKeywords.String
	}
	if ogImage.Valid {
		p.OGImage = ogImage.String
	}

	// Parse sections JSON
	if len(sectionsJSON) > 0 {
		if err := json.Unmarshal(sectionsJSON, &p.Sections); err != nil {
			log.Printf("Error unmarshaling sections: %v", err)
			p.Sections = []interface{}{}
		}
	} else {
		p.Sections = []interface{}{}
	}

	// Handle nullable published_at
	if publishedAt.Valid {
		p.PublishedAt = &publishedAt.Time
	}

	log.Printf("Found page: %s - %s", p.ID, p.Title)
	return &p, nil
}

func (pg *PostgresDB) CreatePage(page models.Page) (*models.Page, error) {
	// Generate new UUID if not provided
	if page.ID == "" {
		page.ID = uuid.New().String()
	}

	// Initialize sections if nil
	if page.Sections == nil {
		page.Sections = []interface{}{}
	}

	// Marshal sections to JSON
	sectionsJSON, err := json.Marshal(page.Sections)
	if err != nil {
		return nil, fmt.Errorf("failed to marshal sections: %w", err)
	}

	// Set timestamps
	now := time.Now()
	page.CreatedAt = now
	page.UpdatedAt = now

	// Set default status
	if page.Status == "" {
		page.Status = "draft"
	}

	// Handle NULL values for optional fields
	var metaTitle, metaDescription, metaKeywords, ogImage interface{}
	if page.MetaTitle != "" {
		metaTitle = page.MetaTitle
	}
	if page.MetaDescription != "" {
		metaDescription = page.MetaDescription
	}
	if page.MetaKeywords != "" {
		metaKeywords = page.MetaKeywords
	}
	if page.OGImage != "" {
		ogImage = page.OGImage
	}

	query := `INSERT INTO pages (id, title, slug, template, status, meta_title, meta_description, meta_keywords, og_image, sections, created_at, updated_at, published_at) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13) RETURNING id`

	err = pg.db.QueryRow(
		query,
		page.ID,
		page.Title,
		page.Slug,
		page.Template,
		page.Status,
		metaTitle,
		metaDescription,
		metaKeywords,
		ogImage,
		sectionsJSON,
		page.CreatedAt,
		page.UpdatedAt,
		page.PublishedAt,
	).Scan(&page.ID)

	if err != nil {
		log.Printf("Error creating page: %v", err)
		return nil, fmt.Errorf("failed to create page: %w", err)
	}

	log.Printf("Created page: %s - %s", page.ID, page.Title)
	return &page, nil
}

func (pg *PostgresDB) UpdatePage(pageId string, page models.Page) (*models.Page, error) {
	// Initialize sections if nil
	if page.Sections == nil {
		page.Sections = []interface{}{}
	}

	// Marshal sections to JSON
	sectionsJSON, err := json.Marshal(page.Sections)
	if err != nil {
		return nil, fmt.Errorf("failed to marshal sections: %w", err)
	}

	// Update timestamp
	page.UpdatedAt = time.Now()

	// Handle NULL values for optional fields
	var metaTitle, metaDescription, metaKeywords, ogImage interface{}
	if page.MetaTitle != "" {
		metaTitle = page.MetaTitle
	}
	if page.MetaDescription != "" {
		metaDescription = page.MetaDescription
	}
	if page.MetaKeywords != "" {
		metaKeywords = page.MetaKeywords
	}
	if page.OGImage != "" {
		ogImage = page.OGImage
	}

	query := `UPDATE pages SET title = $1, slug = $2, template = $3, status = $4, meta_title = $5, meta_description = $6, meta_keywords = $7, og_image = $8, sections = $9, updated_at = $10, published_at = $11 WHERE id = $12 RETURNING id`

	err = pg.db.QueryRow(
		query,
		page.Title,
		page.Slug,
		page.Template,
		page.Status,
		metaTitle,
		metaDescription,
		metaKeywords,
		ogImage,
		sectionsJSON,
		page.UpdatedAt,
		page.PublishedAt,
		pageId,
	).Scan(&page.ID)

	if err != nil {
		log.Printf("Error updating page: %v", err)
		return nil, fmt.Errorf("failed to update page: %w", err)
	}

	log.Printf("Updated page: %s - %s", page.ID, page.Title)
	return &page, nil
}

func (pg *PostgresDB) DeletePage(pageId string) error {
	query := `DELETE FROM pages WHERE id = $1`
	_, err := pg.db.Exec(query, pageId)
	return err
}

func (pg *PostgresDB) PublishPage(pageId string) (*models.Page, error) {
	now := time.Now()
	query := `UPDATE pages SET status = 'published', published_at = $1, updated_at = $2 WHERE id = $3`

	_, err := pg.db.Exec(query, now, now, pageId)
	if err != nil {
		return nil, err
	}

	// Return the updated page
	return pg.GetPage(pageId)
}

func (pg *PostgresDB) UnpublishPage(pageId string) (*models.Page, error) {
	now := time.Now()
	query := `UPDATE pages SET status = 'draft', updated_at = $1 WHERE id = $2`

	_, err := pg.db.Exec(query, now, pageId)
	if err != nil {
		return nil, err
	}

	// Return the updated page
	return pg.GetPage(pageId)
}

func (pg *PostgresDB) DuplicatePage(pageId string) (*models.Page, error) {
	// Get the original page
	originalPage, err := pg.GetPage(pageId)
	if err != nil {
		return nil, err
	}

	// Create a new page with modified title and slug
	newPage := *originalPage
	newPage.ID = uuid.New().String()
	newPage.Title = fmt.Sprintf("%s (Copy)", originalPage.Title)
	newPage.Slug = fmt.Sprintf("%s-copy", originalPage.Slug)
	newPage.Status = "draft"
	newPage.PublishedAt = nil

	// Ensure unique slug
	counter := 1
	baseSlug := newPage.Slug
	for {
		_, err := pg.GetPage(newPage.Slug)
		if err != nil {
			// Slug is available
			break
		}
		counter++
		newPage.Slug = fmt.Sprintf("%s-%d", baseSlug, counter)
	}

	// Create the new page
	return pg.CreatePage(newPage)
}

func (pg *PostgresDB) ReorderPageSections(pageId string, sectionIds []string) (*models.Page, error) {
	// Get the current page
	page, err := pg.GetPage(pageId)
	if err != nil {
		return nil, err
	}

	// Create a map of sections by ID
	sectionMap := make(map[string]interface{})
	for _, section := range page.Sections {
		if sectionData, ok := section.(map[string]interface{}); ok {
			if id, ok := sectionData["id"].(string); ok {
				sectionMap[id] = section
			}
		}
	}

	// Reorder sections
	newSections := make([]interface{}, 0, len(sectionIds))
	for _, sectionId := range sectionIds {
		if section, exists := sectionMap[sectionId]; exists {
			newSections = append(newSections, section)
		}
	}

	// Update the page
	page.Sections = newSections
	return pg.UpdatePage(pageId, *page)
}
