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
		utils.SendResponse(c, utils.Response{
			Status:  http.StatusBadRequest,
			Success: false,
			Message: "Invalid request body",
		})
		return
	}

	// Validate required fields
	validateOrder(c, &order)

	if err := h.db.CreateOrder(&order); err != nil {
		utils.SendResponse(c, utils.Response{
			Status:  http.StatusInternalServerError,
			Success: false,
			Message: "Failed to create order",
		})
		return
	}

	utils.SendResponse(c, utils.Response{
		Status:  http.StatusCreated,
		Success: true,
		Message: "Order created successfully",
		Data:    order,
	})
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
		utils.SendResponse(c, utils.Response{
			Status:  http.StatusUnauthorized,
			Success: false,
			Message: "User not authenticated",
		})
		return
	}
	userIDStr := fmt.Sprintf("%v", userID)
	_, err := h.db.GetUserByID(userIDStr)
	if err != nil {
		utils.SendResponse(c, utils.Response{
			Status:  http.StatusInternalServerError,
			Success: false,
			Message: "Failed to fetch user",
		})
		return
	}

	orders, err := h.db.GetOrdersByOption(key, val)
	if err != nil {
		if err.Error() == "user not found" || err == sql.ErrNoRows {
			utils.SendResponse(c, utils.Response{
				Status:  http.StatusNotFound,
				Success: false,
				Message: "User not found",
			})
			return
		}
		utils.SendResponse(c, utils.Response{
			Status:  http.StatusInternalServerError,
			Success: false,
			Message: "Failed to fetch orders",
		})
		return
	}

	utils.SendResponse(c, utils.Response{
		Status:  http.StatusOK,
		Success: true,
		Message: "Orders fetched successfully",
		Data:    orders,
	})
}

// UpdateOrder handles PUT /api/orders/:id
func (h *Handler) UpdateOrder(c *gin.Context) {
	order_id := c.Param("id")

	var updatedPayload models.Order
	if err := c.ShouldBindJSON(&updatedPayload); err != nil {
		utils.SendResponse(c, utils.Response{
			Status:  http.StatusBadRequest,
			Success: false,
			Message: "Invalid request body",
		})
		return
	}

	orders, err := h.db.GetOrdersByOption("id", &order_id)
	if err != nil {
		if err.Error() == "order not found" || err == sql.ErrNoRows {
			utils.SendResponse(c, utils.Response{Status: http.StatusNotFound, Message: "Order not found", Success: false})
			return
		}
		utils.SendResponse(c, utils.Response{Status: http.StatusInternalServerError, Message: "Failed to fetch order", Success: false})
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
			utils.SendResponse(c, utils.Response{Status: http.StatusNotFound, Message: "Order not found", Success: false})
			return
		}
		utils.SendResponse(c, utils.Response{Status: http.StatusInternalServerError, Message: "Failed to update order", Success: false})
		return
	}

	utils.SendResponse(c, utils.Response{Status: http.StatusOK, Data: order, Success: true})
}

// DeleteOrder handles DELETE /api/orders/:id
func (h *Handler) DeleteOrder(c *gin.Context) {
	id := c.Param("id")

	if err := h.db.DeleteOrder(id); err != nil {
		if err.Error() == "order not found" || err == sql.ErrNoRows {
			utils.SendResponse(c, utils.Response{Status: http.StatusNotFound, Message: "Order not found", Success: false})
			return
		}
		utils.SendResponse(c, utils.Response{Status: http.StatusInternalServerError, Message: "Failed to delete order", Success: false})
		return
	}

	utils.SendResponse(c, utils.Response{Status: http.StatusNoContent, Success: true, Message: "Order deleted successfully"})
}

// validateOrder validates order fields
func validateOrder(c *gin.Context, order *models.Order) {
	if strings.TrimSpace(order.Customer.FirstName) == "" {
		utils.SendResponse(c, utils.Response{Status: http.StatusUnprocessableEntity, Message: "First name is required", Success: false})
	}
	if strings.TrimSpace(order.Customer.LastName) == "" {
		utils.SendResponse(c, utils.Response{Status: http.StatusUnprocessableEntity, Message: "Last name is required", Success: false})
	}
	if strings.TrimSpace(order.Customer.Email) == "" {
		utils.SendResponse(c, utils.Response{Status: http.StatusUnprocessableEntity, Message: "Email is required", Success: false})
	}
	if strings.TrimSpace(order.Customer.PhoneNumber) == "" {
		utils.SendResponse(c, utils.Response{Status: http.StatusUnprocessableEntity, Message: "Phone number is required", Success: false})
	}
	if strings.TrimSpace(order.Shipping.Address) == "" {
		utils.SendResponse(c, utils.Response{Status: http.StatusUnprocessableEntity, Message: "Address is required", Success: false})
	}
	if order.Subtotal <= 0 {
		utils.SendResponse(c, utils.Response{Status: http.StatusUnprocessableEntity, Message: "Subtotal must be greater than 0", Success: false})
	}
	if order.Total <= 0 {
		utils.SendResponse(c, utils.Response{Status: http.StatusUnprocessableEntity, Message: "Total must be greater than 0", Success: false})
	}
	if len(order.Items) == 0 {
		utils.SendResponse(c, utils.Response{Status: http.StatusUnprocessableEntity, Message: "Items are required", Success: false})
	}
}
