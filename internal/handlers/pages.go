package handlers

import (
	"fmt"
	"log"
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/imrany/elegance/internal/models"
	"github.com/imrany/elegance/pkg/utils"
)

// GetPages retrieves all pages - GET /api/pages.
func (h *Handler) GetPages(c *gin.Context) {
	log.Println("GetPages handler called")

	pages, err := h.db.GetPages()
	if err != nil {
		log.Printf("Error from database: %v", err)
		utils.SendResponse(c, utils.Response{
			Success: false,
			Status:  http.StatusInternalServerError,
			Message: fmt.Sprintf("Database error: %v", err),
		})
		return
	}

	log.Printf("Successfully retrieved %d pages", len(pages))
	utils.SendResponse(c, utils.Response{
		Success: true,
		Status:  http.StatusOK,
		Data:    pages,
	})
}

// GetPage retrieves a single page by ID - GET /api/pages/:id
func (h *Handler) GetPage(c *gin.Context) {
	pageID := c.Param("id")
	page, err := h.db.GetPage(pageID)
	if err != nil {
		utils.SendResponse(c, utils.Response{
			Success: false,
			Status:  http.StatusNotFound,
			Message: "Page not found",
		})
		return
	}

	utils.SendResponse(c, utils.Response{
		Success: true,
		Status:  http.StatusOK,
		Data:    page,
	})
}

// CreatePage creates a new page - POST /api/admin/pages
func (h *Handler) CreatePage(c *gin.Context) {
	var page models.Page
	if err := c.ShouldBindJSON(&page); err != nil {
		utils.SendResponse(c, utils.Response{
			Success: false,
			Status:  http.StatusBadRequest,
			Message: err.Error(),
		})
		return
	}

	// Set default status to draft if not provided
	if page.Status == "" {
		page.Status = "draft"
	}

	pag, err := h.db.CreatePage(page)
	if err != nil {
		utils.SendResponse(c, utils.Response{
			Success: false,
			Status:  http.StatusInternalServerError,
			Message: err.Error(),
		})
		return
	}

	utils.SendResponse(c, utils.Response{
		Success: true,
		Status:  http.StatusCreated,
		Data:    pag,
	})
}

// UpdatePage updates an existing page - PUT /api/admin/pages/:id
func (h *Handler) UpdatePage(c *gin.Context) {
	pageId := c.Param("id")

	var page models.Page
	if err := c.ShouldBindJSON(&page); err != nil {
		utils.SendResponse(c, utils.Response{
			Success: false,
			Status:  http.StatusBadRequest,
			Message: err.Error(),
		})
		return
	}

	// Set the ID from the URL parameter
	page.ID = pageId

	pag, err := h.db.UpdatePage(pageId, page)
	if err != nil {
		utils.SendResponse(c, utils.Response{
			Success: false,
			Status:  http.StatusInternalServerError,
			Message: err.Error(),
		})
		return
	}

	utils.SendResponse(c, utils.Response{
		Success: true,
		Status:  http.StatusOK,
		Data:    pag,
	})
}

// DeletePage deletes an existing page - DELETE /api/admin/pages/:id
func (h *Handler) DeletePage(c *gin.Context) {
	pageId := c.Param("id")

	if err := h.db.DeletePage(pageId); err != nil {
		utils.SendResponse(c, utils.Response{
			Success: false,
			Status:  http.StatusInternalServerError,
			Message: err.Error(),
		})
		return
	}

	utils.SendResponse(c, utils.Response{
		Success: true,
		Status:  http.StatusOK,
		Message: "Page deleted successfully",
	})
}

// PublishPage publishes an existing page - POST /api/admin/pages/:id/publish
func (h *Handler) PublishPage(c *gin.Context) {
	pageId := c.Param("id")

	page, err := h.db.PublishPage(pageId)
	if err != nil {
		utils.SendResponse(c, utils.Response{
			Success: false,
			Status:  http.StatusInternalServerError,
			Message: err.Error(),
		})
		return
	}

	utils.SendResponse(c, utils.Response{
		Success: true,
		Status:  http.StatusOK,
		Data:    page,
	})
}

// UnpublishPage unpublishes an existing page - POST /api/admin/pages/:id/unpublish
func (h *Handler) UnpublishPage(c *gin.Context) {
	pageId := c.Param("id")

	page, err := h.db.UnpublishPage(pageId)
	if err != nil {
		utils.SendResponse(c, utils.Response{
			Success: false,
			Status:  http.StatusInternalServerError,
			Message: err.Error(),
		})
		return
	}

	utils.SendResponse(c, utils.Response{
		Success: true,
		Status:  http.StatusOK,
		Data:    page,
	})
}

// DuplicatePage duplicates an existing page - POST /api/admin/pages/:id/duplicate
func (h *Handler) DuplicatePage(c *gin.Context) {
	pageId := c.Param("id")

	page, err := h.db.DuplicatePage(pageId)
	if err != nil {
		utils.SendResponse(c, utils.Response{
			Success: false,
			Status:  http.StatusInternalServerError,
			Message: err.Error(),
		})
		return
	}

	utils.SendResponse(c, utils.Response{
		Success: true,
		Status:  http.StatusCreated,
		Data:    page,
	})
}

// ReorderPageSections reorders page sections - POST /api/admin/pages/:id/reorder-sections
func (h *Handler) ReorderPageSections(c *gin.Context) {
	pageId := c.Param("id")

	var sectionIds models.ReorderSectionsRequest
	if err := c.BindJSON(&sectionIds); err != nil {
		utils.SendResponse(c, utils.Response{
			Success: false,
			Status:  http.StatusBadRequest,
			Message: err.Error(),
		})
		return
	}

	page, err := h.db.ReorderPageSections(pageId, sectionIds.SectionIDs)
	if err != nil {
		utils.SendResponse(c, utils.Response{
			Success: false,
			Status:  http.StatusInternalServerError,
			Message: err.Error(),
		})
		return
	}

	utils.SendResponse(c, utils.Response{
		Success: true,
		Status:  http.StatusOK,
		Data:    page,
	})
}
