package handlers

import (
	"database/sql"
	"net/http"
	"strings"

	"github.com/gin-gonic/gin"
	"github.com/imrany/ecommerce/internal/models"
	"github.com/imrany/ecommerce/pkg/utils"
)

// CreateOrder handles POST /api/orders
func (h *Handler) CreateOrder(c *gin.Context) {
	var order models.Order

	if err := c.ShouldBindJSON(&order); err != nil {
		utils.ErrorResponse(c, http.StatusBadRequest, "Invalid request body", err)
		return
	}

	// Validate required fields
	if err := validateOrder(&order); err != nil {
		utils.ErrorResponse(c, http.StatusBadRequest, err.Error(), nil)
		return
	}

	if err := h.db.CreateOrder(&order); err != nil {
		utils.ErrorResponse(c, http.StatusInternalServerError, "Failed to create order", err)
		return
	}

	utils.SuccessResponse(c, http.StatusCreated, order)
}

// GetOrderByID handles GET /api/orders/:id
func (h *Handler) GetOrderByID(c *gin.Context) {
	id := c.Param("id")

	order, err := h.db.GetOrderByID(id)
	if err != nil {
		if err.Error() == "order not found" || err == sql.ErrNoRows {
			utils.ErrorResponse(c, http.StatusNotFound, "Order not found", err)
			return
		}
		utils.ErrorResponse(c, http.StatusInternalServerError, "Failed to fetch order", err)
		return
	}

	utils.SuccessResponse(c, http.StatusOK, order)
}

// validateOrder validates order fields
func validateOrder(order *models.Order) error {
	if strings.TrimSpace(order.CustomerName) == "" {
		return utils.ErrMissingField("customer_name")
	}
	if strings.TrimSpace(order.CustomerEmail) == "" {
		return utils.ErrMissingField("customer_email")
	}
	if strings.TrimSpace(order.CustomerPhone) == "" {
		return utils.ErrMissingField("customer_phone")
	}
	if strings.TrimSpace(order.DeliveryAddress) == "" {
		return utils.ErrMissingField("delivery_address")
	}
	if order.Subtotal <= 0 {
		return utils.ErrInvalidField("subtotal", "must be greater than 0")
	}
	if order.Total <= 0 {
		return utils.ErrInvalidField("total", "must be greater than 0")
	}
	if len(order.Items) == 0 {
		return utils.ErrMissingField("items")
	}
	return nil
}
