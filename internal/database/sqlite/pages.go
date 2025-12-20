package sqlite

import (
	"database/sql"
	"encoding/json"
	"fmt"
	"log"
	"time"

	"github.com/google/uuid"
	"github.com/imrany/elegance/internal/models"
)

func (sq *SQLiteDB) GetPages() ([]models.Page, error) {
	query := `SELECT id, title, slug, template, status, meta_title, meta_description, meta_keywords, og_image, sections, created_at, updated_at, published_at FROM pages ORDER BY updated_at DESC`

	log.Printf("Executing query: %s", query)

	rows, err := sq.db.Query(query)
	if err != nil {
		log.Printf("Error executing query: %v", err)
		return nil, fmt.Errorf("failed to query pages: %w", err)
	}
	defer rows.Close()

	var pages []models.Page
	for rows.Next() {
		var p models.Page
		var sectionsJSON string
		var publishedAt sql.NullTime
		var createdAt, updatedAt string
		// Use sql.NullString for nullable string fields
		var metaTitle, metaDescription, metaKeywords, ogImage sql.NullString

		err := rows.Scan(
			&p.ID,
			&p.Title,
			&p.Slug,
			&p.Template,
			&p.Status,
			&metaTitle,       // NULL-safe
			&metaDescription, // NULL-safe
			&metaKeywords,    // NULL-safe
			&ogImage,         // NULL-safe
			&sectionsJSON,
			&createdAt,
			&updatedAt,
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

		// Parse timestamps
		if createdAt != "" {
			p.CreatedAt, _ = time.Parse("2006-01-02 15:04:05", createdAt)
		}
		if updatedAt != "" {
			p.UpdatedAt, _ = time.Parse("2006-01-02 15:04:05", updatedAt)
		}

		// Parse sections JSON
		if sectionsJSON != "" && sectionsJSON != "[]" {
			if err := json.Unmarshal([]byte(sectionsJSON), &p.Sections); err != nil {
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

func (sq *SQLiteDB) GetPage(pageId string) (*models.Page, error) {
	query := `SELECT id, title, slug, template, status, meta_title, meta_description, meta_keywords, og_image, sections, created_at, updated_at, published_at FROM pages WHERE id = ? OR template = ? OR slug = ?`

	log.Printf("Getting page with ID/slug/template: %s", pageId)

	row := sq.db.QueryRow(query, pageId, pageId, pageId)

	var p models.Page
	var sectionsJSON string
	var publishedAt sql.NullTime
	var createdAt, updatedAt string
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
		&createdAt,
		&updatedAt,
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

	// Parse timestamps
	if createdAt != "" {
		p.CreatedAt, _ = time.Parse("2006-01-02 15:04:05", createdAt)
	}
	if updatedAt != "" {
		p.UpdatedAt, _ = time.Parse("2006-01-02 15:04:05", updatedAt)
	}

	// Parse sections JSON
	if sectionsJSON != "" && sectionsJSON != "[]" {
		if err := json.Unmarshal([]byte(sectionsJSON), &p.Sections); err != nil {
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

func (sq *SQLiteDB) CreatePage(page models.Page) (*models.Page, error) {
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

	query := `INSERT INTO pages (id, title, slug, template, status, meta_title, meta_description, meta_keywords, og_image, sections, created_at, updated_at, published_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`

	_, err = sq.db.Exec(
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
		string(sectionsJSON),
		page.CreatedAt.Format("2006-01-02 15:04:05"),
		page.UpdatedAt.Format("2006-01-02 15:04:05"),
		page.PublishedAt,
	)

	if err != nil {
		log.Printf("Error creating page: %v", err)
		return nil, fmt.Errorf("failed to create page: %w", err)
	}

	log.Printf("Created page: %s - %s", page.ID, page.Title)
	return &page, nil
}

func (sq *SQLiteDB) UpdatePage(pageId string, page models.Page) (*models.Page, error) {
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

	query := `UPDATE pages SET title = ?, slug = ?, template = ?, status = ?, meta_title = ?, meta_description = ?, meta_keywords = ?, og_image = ?, sections = ?, updated_at = ?, published_at = ? WHERE id = ?`

	_, err = sq.db.Exec(
		query,
		page.Title,
		page.Slug,
		page.Template,
		page.Status,
		metaTitle,
		metaDescription,
		metaKeywords,
		ogImage,
		string(sectionsJSON),
		page.UpdatedAt.Format("2006-01-02 15:04:05"),
		page.PublishedAt,
		pageId,
	)

	if err != nil {
		log.Printf("Error updating page: %v", err)
		return nil, fmt.Errorf("failed to update page: %w", err)
	}

	page.ID = pageId
	log.Printf("Updated page: %s - %s", page.ID, page.Title)
	return &page, nil
}

func (sq *SQLiteDB) DeletePage(pageId string) error {
	query := `DELETE FROM pages WHERE id = ?`
	result, err := sq.db.Exec(query, pageId)
	if err != nil {
		return fmt.Errorf("failed to delete page: %w", err)
	}

	rows, _ := result.RowsAffected()
	if rows == 0 {
		return fmt.Errorf("page not found")
	}

	log.Printf("Deleted page: %s", pageId)
	return nil
}

func (sq *SQLiteDB) PublishPage(pageId string) (*models.Page, error) {
	now := time.Now()
	query := `UPDATE pages SET status = 'published', published_at = ?, updated_at = ? WHERE id = ?`

	_, err := sq.db.Exec(query, now.Format("2006-01-02 15:04:05"), now.Format("2006-01-02 15:04:05"), pageId)
	if err != nil {
		return nil, fmt.Errorf("failed to publish page: %w", err)
	}

	log.Printf("Published page: %s", pageId)
	return sq.GetPage(pageId)
}

func (sq *SQLiteDB) UnpublishPage(pageId string) (*models.Page, error) {
	now := time.Now()
	query := `UPDATE pages SET status = 'draft', updated_at = ? WHERE id = ?`

	_, err := sq.db.Exec(query, now.Format("2006-01-02 15:04:05"), pageId)
	if err != nil {
		return nil, fmt.Errorf("failed to unpublish page: %w", err)
	}

	log.Printf("Unpublished page: %s", pageId)
	return sq.GetPage(pageId)
}

func (sq *SQLiteDB) DuplicatePage(pageId string) (*models.Page, error) {
	// Get the original page
	originalPage, err := sq.GetPage(pageId)
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
		_, err := sq.GetPage(newPage.Slug)
		if err != nil {
			// Slug is available
			break
		}
		counter++
		newPage.Slug = fmt.Sprintf("%s-%d", baseSlug, counter)
	}

	log.Printf("Duplicating page %s to %s", pageId, newPage.ID)
	return sq.CreatePage(newPage)
}

func (sq *SQLiteDB) ReorderPageSections(pageId string, sectionIds []string) (*models.Page, error) {
	// Get the current page
	page, err := sq.GetPage(pageId)
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
	log.Printf("Reordering sections for page: %s", pageId)
	return sq.UpdatePage(pageId, *page)
}
