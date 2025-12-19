package handlers

import (
	"database/sql"
	"fmt"
	"net/http"
	"strings"

	"github.com/gin-gonic/gin"
	"github.com/imrany/elegance/internal/models"
	"github.com/imrany/elegance/pkg/utils"
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

// GetOrdersByUserID handles GET /api/order/user/?key=user_id&&value=123
func (h *Handler) GetOrdersByOption(c *gin.Context) {
	value := c.Query("value")
	key := c.Query("key")

	val := &value
	if value == "" {
		val = nil
	}

	userID, exists := c.Get("user_id")
	if !exists {
		utils.ErrorResponse(c, http.StatusUnauthorized, "User not authenticated", nil)
		return
	}
	userIDStr := fmt.Sprintf("%v", userID)
	_, err := h.db.GetUserByID(userIDStr)
	if err != nil {
		utils.ErrorResponse(c, http.StatusInternalServerError, "Failed to fetch user", err)
		return
	}

	orders, err := h.db.GetOrdersByOption(key, val)
	if err != nil {
		if err.Error() == "user not found" || err == sql.ErrNoRows {
			utils.ErrorResponse(c, http.StatusNotFound, "User not found", err)
			return
		}
		utils.ErrorResponse(c, http.StatusInternalServerError, "Failed to fetch orders", err)
		return
	}

	utils.SuccessResponse(c, http.StatusOK, orders)
}

// UpdateOrder handles PUT /api/orders/:id
func (h *Handler) UpdateOrder(c *gin.Context) {
	order_id := c.Param("id")

	var updatedPayload models.Order
	if err := c.ShouldBindJSON(&updatedPayload); err != nil {
		utils.ErrorResponse(c, http.StatusBadRequest, "Invalid request body", err)
		return
	}

	orders, err := h.db.GetOrdersByOption("id", &order_id)
	if err != nil {
		if err.Error() == "order not found" || err == sql.ErrNoRows {
			utils.ErrorResponse(c, http.StatusNotFound, "Order not found", err)
			return
		}
		utils.ErrorResponse(c, http.StatusInternalServerError, "Failed to fetch order", err)
		return
	}

	order := orders[0]
	order.Status = updatedPayload.Status
	order.PaymentStatus = updatedPayload.PaymentStatus
	order.Shipping.Address = updatedPayload.Shipping.Address
	order.Shipping.City = updatedPayload.Shipping.City
	order.Shipping.PostalCode = updatedPayload.Shipping.PostalCode

	if err := h.db.UpdateOrder(&order); err != nil {
		if err.Error() == "order not found" || err == sql.ErrNoRows {
			utils.ErrorResponse(c, http.StatusNotFound, "Order not found", err)
			return
		}
		utils.ErrorResponse(c, http.StatusInternalServerError, "Failed to update order", err)
		return
	}

	utils.SuccessResponse(c, http.StatusOK, order)
}

// DeleteOrder handles DELETE /api/orders/:id
func (h *Handler) DeleteOrder(c *gin.Context) {
	id := c.Param("id")

	if err := h.db.DeleteOrder(id); err != nil {
		if err.Error() == "order not found" || err == sql.ErrNoRows {
			utils.ErrorResponse(c, http.StatusNotFound, "Order not found", err)
			return
		}
		utils.ErrorResponse(c, http.StatusInternalServerError, "Failed to delete order", err)
		return
	}

	utils.SuccessResponse(c, http.StatusNoContent, nil)
}

// validateOrder validates order fields
func validateOrder(order *models.Order) error {
	if strings.TrimSpace(order.Customer.FirstName) == "" {
		return utils.ErrMissingField("first_name")
	}
	if strings.TrimSpace(order.Customer.LastName) == "" {
		return utils.ErrMissingField("last_name")
	}
	if strings.TrimSpace(order.Customer.Email) == "" {
		return utils.ErrMissingField("email")
	}
	if strings.TrimSpace(order.Customer.PhoneNumber) == "" {
		return utils.ErrMissingField("phone_number")
	}
	if strings.TrimSpace(order.Shipping.Address) == "" {
		return utils.ErrMissingField("address")
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
