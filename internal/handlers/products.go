package handlers

import (
	"database/sql"
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
	"github.com/imrany/elegance/internal/models"
	"github.com/imrany/elegance/pkg/utils"
)

// GetProducts handles GET /api/products
func (h *Handler) GetProducts(c *gin.Context) {
	filters := models.ProductFilters{}

	// Parse query parameters
	if catID := c.Query("category_id"); catID != "" {
		filters.CategoryID = &catID
	}

	if featuredStr := c.Query("featured"); featuredStr != "" {
		if featured, err := strconv.ParseBool(featuredStr); err == nil {
			filters.Featured = &featured
		}
	}

	if isNewStr := c.Query("is_new"); isNewStr != "" {
		if isNew, err := strconv.ParseBool(isNewStr); err == nil {
			filters.IsNew = &isNew
		}
	}

	if search := c.Query("search"); search != "" {
		filters.Search = &search
	}

	// Pagination
	if limitStr := c.Query("limit"); limitStr != "" {
		if limit, err := strconv.Atoi(limitStr); err == nil && limit > 0 {
			filters.Limit = limit
		}
	}

	if offsetStr := c.Query("offset"); offsetStr != "" {
		if offset, err := strconv.Atoi(offsetStr); err == nil && offset >= 0 {
			filters.Offset = offset
		}
	}

	products, err := h.db.GetProducts(filters)
	if err != nil {
		utils.SendResponse(c, utils.Response{
			Status:  http.StatusInternalServerError,
			Success: false,
			Message: "Failed to fetch products",
		})
		return
	}

	utils.SendResponse(c, utils.Response{
		Status:  http.StatusOK,
		Success: true,
		Message: "Products retrieved successfully",
		Data:    products,
	})
}

// GetProductBySlug handles GET /api/products/:slug
func (h *Handler) GetProductBySlug(c *gin.Context) {
	slug := c.Param("slug")

	product, err := h.db.GetProductBySlug(slug)
	if err != nil {
		if err.Error() == "product not found" || err == sql.ErrNoRows {
			utils.SendResponse(c, utils.Response{
				Status:  http.StatusNotFound,
				Message: "Product not found",
				Success: false,
			})
			return
		}
		utils.SendResponse(c, utils.Response{
			Status:  http.StatusInternalServerError,
			Success: false,
			Message: "Failed to fetch product",
		})
		return
	}

	utils.SendResponse(c, utils.Response{
		Status:  http.StatusOK,
		Success: true,
		Message: "Product retrieved successfully",
		Data:    product,
	})
}

// GetFeaturedProducts handles GET /api/products/featured
func (h *Handler) GetFeaturedProducts(c *gin.Context) {
	products, err := h.db.GetFeaturedProducts()
	if err != nil {
		utils.SendResponse(c, utils.Response{
			Status:  http.StatusInternalServerError,
			Success: false,
			Message: "Failed to fetch featured products",
		})
		return
	}

	utils.SendResponse(c, utils.Response{
		Status:  http.StatusOK,
		Success: true,
		Message: "Featured products retrieved successfully",
		Data:    products,
	})
}

// GetNewProducts handles GET /api/products/new
func (h *Handler) GetNewProducts(c *gin.Context) {
	products, err := h.db.GetNewProducts()
	if err != nil {
		utils.SendResponse(c, utils.Response{
			Status:  http.StatusInternalServerError,
			Success: false,
			Message: "Failed to fetch new products",
		})
		return
	}

	utils.SendResponse(c, utils.Response{
		Status:  http.StatusOK,
		Success: true,
		Message: "New products retrieved successfully",
		Data:    products,
	})
}
