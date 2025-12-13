package handlers

import (
	"database/sql"
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
	"github.com/imrany/ecommerce/internal/models"
	"github.com/imrany/ecommerce/pkg/utils"
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
		utils.ErrorResponse(c, http.StatusInternalServerError, "Failed to fetch products", err)
		return
	}

	utils.SuccessResponse(c, http.StatusOK, products)
}

// GetProductBySlug handles GET /api/products/:slug
func (h *Handler) GetProductBySlug(c *gin.Context) {
	slug := c.Param("slug")

	product, err := h.db.GetProductBySlug(slug)
	if err != nil {
		if err.Error() == "product not found" || err == sql.ErrNoRows {
			utils.ErrorResponse(c, http.StatusNotFound, "Product not found", err)
			return
		}
		utils.ErrorResponse(c, http.StatusInternalServerError, "Failed to fetch product", err)
		return
	}

	utils.SuccessResponse(c, http.StatusOK, product)
}

// GetFeaturedProducts handles GET /api/products/featured
func (h *Handler) GetFeaturedProducts(c *gin.Context) {
	products, err := h.db.GetFeaturedProducts()
	if err != nil {
		utils.ErrorResponse(c, http.StatusInternalServerError, "Failed to fetch featured products", err)
		return
	}

	utils.SuccessResponse(c, http.StatusOK, products)
}

// GetNewProducts handles GET /api/products/new
func (h *Handler) GetNewProducts(c *gin.Context) {
	products, err := h.db.GetNewProducts()
	if err != nil {
		utils.ErrorResponse(c, http.StatusInternalServerError, "Failed to fetch new products", err)
		return
	}

	utils.SuccessResponse(c, http.StatusOK, products)
}
