package handlers

import (
	"database/sql"
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/imrany/elegance/pkg/utils"
)

// GetCategories handles GET /api/categories
func (h *Handler) GetCategories(c *gin.Context) {
	categories, err := h.db.GetCategories()
	if err != nil {
		utils.SendResponse(c, utils.Response{
			Status:  http.StatusInternalServerError,
			Message: "Failed to fetch categories",
			Success: false,
		})
		return
	}
	utils.SendResponse(c, utils.Response{
		Status:  http.StatusOK,
		Success: true,
		Data:    categories,
	})
}

// GetCategoryBySlug handles GET /api/categories/:slug
func (h *Handler) GetCategoryBySlug(c *gin.Context) {
	slug := c.Param("slug")

	category, err := h.db.GetCategoryBySlug(slug)
	if err != nil {
		if err.Error() == "category not found" || err == sql.ErrNoRows {
			utils.SendResponse(c, utils.Response{
				Status:  http.StatusNotFound,
				Message: "Category not found",
				Success: false,
			})
			return
		}
		utils.SendResponse(c, utils.Response{
			Status:  http.StatusInternalServerError,
			Message: "Failed to fetch category",
			Success: false,
		})
		return
	}

	utils.SendResponse(c, utils.Response{
		Status:  http.StatusOK,
		Success: true,
		Data:    category,
	})
}
