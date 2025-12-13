package handlers

import (
	"database/sql"
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/imrany/ecommerce/pkg/utils"
)

// GetCategories handles GET /api/categories
func (h *Handler) GetCategories(c *gin.Context) {
	categories, err := h.db.GetCategories()
	if err != nil {
		utils.ErrorResponse(c, http.StatusInternalServerError, "Failed to fetch categories", err)
		return
	}
	utils.SuccessResponse(c, http.StatusOK, categories)
}

// GetCategoryBySlug handles GET /api/categories/:slug
func (h *Handler) GetCategoryBySlug(c *gin.Context) {
	slug := c.Param("slug")

	category, err := h.db.GetCategoryBySlug(slug)
	if err != nil {
		if err.Error() == "category not found" || err == sql.ErrNoRows {
			utils.ErrorResponse(c, http.StatusNotFound, "Category not found", err)
			return
		}
		utils.ErrorResponse(c, http.StatusInternalServerError, "Failed to fetch category", err)
		return
	}

	utils.SuccessResponse(c, http.StatusOK, category)
}
