package handlers

import (
	"encoding/json"
	"net/http"
	"strings"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/golang-jwt/jwt/v5"
	"github.com/google/uuid"
	"github.com/imrany/ecommerce/internal/database"
	"github.com/imrany/ecommerce/internal/models"
	"github.com/imrany/ecommerce/pkg/utils"
	"golang.org/x/crypto/bcrypt"
)

// AdminHandler handles admin-specific operations
type AdminHandler struct {
	db        database.DB
	jwtSecret string
}

// NewAdminHandler creates a new admin handler
func NewAdminHandler(db database.DB, jwtSecret string) *AdminHandler {
	return &AdminHandler{db: db, jwtSecret: jwtSecret}
}

// GetAllOrders retrieves all orders (admin only)
func (h *AdminHandler) GetAllOrders(c *gin.Context) {
	orders, err := h.db.GetAllOrders()
	if err != nil {
		utils.ErrorResponse(c, http.StatusInternalServerError, "Failed to fetch orders", err)
		return
	}

	utils.SuccessResponse(c, http.StatusOK, orders)
}

// UpdateSetting updates a site setting (admin only)
func (h *AdminHandler) UpdateSetting(c *gin.Context) {
	key := c.Param("key")

	var req struct {
		Value string `json:"value" binding:"required"`
	}

	// Update the setting
	if err := h.db.UpdateSiteSetting(key, req.Value); err != nil {
		utils.ErrorResponse(c, http.StatusInternalServerError, "Failed to update setting", err)
		return
	}

	// Fetch the updated setting
	setting, err := h.db.GetSiteSetting(key)
	if err != nil {
		utils.ErrorResponse(c, http.StatusInternalServerError, "Failed to fetch updated setting", err)
		return
	}

	utils.SuccessResponse(c, http.StatusOK, setting)
}

// GetAllProducts retrieves all products (admin only)
func (h *AdminHandler) GetAllProducts(c *gin.Context) {
	products, err := h.db.GetProducts(models.ProductFilters{})
	if err != nil {
		utils.ErrorResponse(c, http.StatusInternalServerError, "Failed to fetch products", err)
		return
	}

	utils.SuccessResponse(c, http.StatusOK, products)
}

// CreateProduct creates a new product (admin only)
func (h *AdminHandler) CreateProduct(c *gin.Context) {
	var product models.Product

	if err := c.ShouldBindJSON(&product); err != nil {
		utils.ErrorResponse(c, http.StatusBadRequest, "Invalid request body", err)
		return
	}

	if err := h.db.CreateProduct(&product); err != nil {
		utils.ErrorResponse(c, http.StatusInternalServerError, "Failed to create product", err)
		return
	}

	utils.SuccessResponse(c, http.StatusCreated, product)
}

// UpdateProduct updates an existing product (admin only)
func (h *AdminHandler) UpdateProduct(c *gin.Context) {
	id := c.Param("id")

	var product models.Product
	if err := c.ShouldBindJSON(&product); err != nil {
		utils.ErrorResponse(c, http.StatusBadRequest, "Invalid request body", err)
		return
	}

	product.ID = id

	if err := h.db.UpdateProduct(&product); err != nil {
		utils.ErrorResponse(c, http.StatusInternalServerError, "Failed to update product", err)
		return
	}

	utils.SuccessResponse(c, http.StatusOK, product)
}

// DeleteProduct deletes a product (admin only)
func (h *AdminHandler) DeleteProduct(c *gin.Context) {
	id := c.Param("id")

	if err := h.db.DeleteProduct(id); err != nil {
		utils.ErrorResponse(c, http.StatusInternalServerError, "Failed to delete product", err)
		return
	}

	utils.MessageResponse(c, http.StatusOK, "Product deleted successfully")
}

// UpdateOrderStatus updates an order's status (admin only)
func (h *AdminHandler) UpdateOrderStatus(c *gin.Context) {
	id := c.Param("id")

	var req struct {
		Status        string `json:"status" binding:"required"`
		PaymentStatus string `json:"payment_status"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		utils.ErrorResponse(c, http.StatusBadRequest, "Invalid request body", err)
		return
	}

	if err := h.db.UpdateOrderStatus(id, req.Status, req.PaymentStatus); err != nil {
		utils.ErrorResponse(c, http.StatusInternalServerError, "Failed to update order", err)
		return
	}

	order, err := h.db.GetOrderByID(id)
	if err != nil {
		utils.ErrorResponse(c, http.StatusInternalServerError, "Failed to fetch updated order", err)
		return
	}

	utils.SuccessResponse(c, http.StatusOK, order)
}

// GetAllUsers retrieves all users (admin only)
func (h *AdminHandler) GetAllUsers(c *gin.Context) {
	users, err := h.db.GetAllUsers()
	if err != nil {
		utils.ErrorResponse(c, http.StatusInternalServerError, "Failed to fetch users", err)
		return
	}

	utils.SuccessResponse(c, http.StatusOK, users)
}

// UpdateUserRole updates a user's role (admin only)
func (h *AdminHandler) UpdateUserRole(c *gin.Context) {
	userID := c.Param("id")

	var req struct {
		Role string `json:"role" binding:"required,oneof=user admin"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		utils.ErrorResponse(c, http.StatusBadRequest, "Invalid request body", err)
		return
	}

	// Get current user ID (the admin making the change)
	currentUserID := c.GetString("user_id")

	// Prevent admin from demoting themselves
	if userID == currentUserID && req.Role != "admin" {
		utils.ErrorResponse(c, http.StatusBadRequest, "Cannot change your own role", nil)
		return
	}

	// Update the role
	if err := h.db.UpdateUserRole(userID, req.Role); err != nil {
		utils.ErrorResponse(c, http.StatusInternalServerError, "Failed to update user role", err)
		return
	}

	// Fetch updated user
	user, err := h.db.GetUserByID(userID)
	if err != nil {
		utils.ErrorResponse(c, http.StatusInternalServerError, "Failed to fetch updated user", err)
		return
	}

	utils.SuccessResponse(c, http.StatusOK, user)
}

// DeleteUser deletes a user account (admin only)
func (h *AdminHandler) DeleteUser(c *gin.Context) {
	userID := c.Param("id")

	// Get current user ID (the admin making the change)
	currentUserID := c.GetString("user_id")

	// Prevent admin from deleting themselves
	if userID == currentUserID {
		utils.ErrorResponse(c, http.StatusBadRequest, "Cannot delete your own account", nil)
		return
	}

	// Delete the user
	if err := h.db.DeleteUser(userID); err != nil {
		utils.ErrorResponse(c, http.StatusInternalServerError, "Failed to delete user", err)
		return
	}

	utils.MessageResponse(c, http.StatusOK, "User deleted successfully")
}

// Setup status check
func (h *AdminHandler) GetSetupStatus(c *gin.Context) {
	setupStatus, err := h.db.GetSetupStatus()
	if err != nil {
		utils.ErrorResponse(c, http.StatusInternalServerError, "Failed to get setup status", err)
		return
	}

	utils.SuccessResponse(c, http.StatusOK, setupStatus)
}

// Create admin
func (h *AdminHandler) CreateInitialAdmin(c *gin.Context) {
	// First check if any users exist
	setupStatus, err := h.db.GetSetupStatus()
	if err != nil {
		utils.ErrorResponse(c, http.StatusInternalServerError, "Failed to get setup status", err)
		return
	}

	if setupStatus.SetupComplete {
		utils.ErrorResponse(c, http.StatusForbidden, "Setup already complete", nil)
		return
	}

	var req struct {
		Email       string `json:"email"`
		Password    string `json:"password"`
		FirstName   string `json:"firstName"`
		LastName    string `json:"lastName"`
		PhoneNumber string `json:"phoneNumber"`
	}

	if err := json.NewDecoder(c.Request.Body).Decode(&req); err != nil {
		utils.ErrorResponse(c, http.StatusBadRequest, "Invalid request", err)
		return
	}

	// Hash password and create user with role = "admin"
	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(req.Password), bcrypt.DefaultCost)
	if err != nil {
		utils.ErrorResponse(c, http.StatusInternalServerError, "Failed to process password", err)
		return
	}

	userRequest := models.User{
		FirstName:   req.FirstName,
		LastName:    req.LastName,
		PhoneNumber: req.PhoneNumber,
		ID:          uuid.New().String(),
		Email:       req.Email,
		Role:        "admin",
		Password:    string(hashedPassword),
		CreatedAt:   time.Now(),
		UpdatedAt:   time.Now(),
	}
	admin, err := h.db.CreateUser(&userRequest)
	if err != nil {
		if strings.Contains(err.Error(), "already exists") {
			utils.ErrorResponse(c, http.StatusConflict, "Email already registered", err)
			return
		}
		utils.ErrorResponse(c, http.StatusInternalServerError, "Failed to create admin", err)
		return
	}

	// Generate JWT token
	token := jwt.NewWithClaims(jwt.SigningMethodHS256, jwt.MapClaims{
		"user_id": admin.ID,
		"email":   admin.Email,
		"role":    admin.Role,
		"exp":     time.Now().Add(24 * time.Hour).Unix(),
		"iat":     time.Now().Unix(),
	})

	tokenString, err := token.SignedString([]byte(h.jwtSecret))
	if err != nil {
		utils.ErrorResponse(c, http.StatusInternalServerError, "Failed to generate token", err)
		return
	}
	utils.SuccessResponse(c, http.StatusCreated, gin.H{
		"admin": admin,
		"token": tokenString,
	})
}
