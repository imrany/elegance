package handlers

import (
	"database/sql"
	"encoding/json"
	"fmt"
	"io"
	"log"
	"math/rand"
	"mime/multipart"
	"net/http"
	"os"
	"path/filepath"
	"strings"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/golang-jwt/jwt/v5"
	"github.com/google/uuid"
	"github.com/imrany/elegance/internal/database"
	"github.com/imrany/elegance/internal/models"
	"github.com/imrany/elegance/pkg/utils"
	"github.com/spf13/viper"
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
	orders, err := h.db.GetOrdersByOption("", nil)
	if err != nil {
		utils.ErrorResponse(c, http.StatusInternalServerError, "Failed to fetch orders", err)
		return
	}

	utils.SuccessResponse(c, http.StatusOK, orders)
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

	order, err := h.db.GetOrdersByOption("id", &id)
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
		Email       string `json:"email" db:"email"`
		FirstName   string `json:"first_name" db:"first_name"`
		LastName    string `json:"last_name" db:"last_name"`
		PhoneNumber string `json:"phone_number" db:"phone_number"`
		Password    string `json:"password" db:"password"`
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

func (h *AdminHandler) UploadImage(c *gin.Context) {
	userID, exists := c.Get("user_id")
	if !exists {
		utils.ErrorResponse(c, http.StatusUnauthorized, "User not authenticated", nil)
		return
	}

	// Convert user_id to string
	userIDStr := fmt.Sprintf("%v", userID)

	// Get the uploaded file
	file, header, err := c.Request.FormFile("file") // Changed from "image" to match frontend
	if err != nil {
		if err == http.ErrMissingFile {
			utils.ErrorResponse(c, http.StatusBadRequest, "No file uploaded or request Content-Type isn't multipart/form-data", err)
			return
		}
		utils.ErrorResponse(c, http.StatusBadRequest, "Failed to read file from form", err)
		return
	}
	defer file.Close()

	// Validate file size (max 2MB)
	if header.Size > 2*1024*1024 {
		utils.ErrorResponse(c, http.StatusBadRequest, "File size must be less than 2MB", nil)
		return
	}

	// Validate file type (images only)
	contentType := header.Header.Get("Content-Type")
	if !strings.HasPrefix(contentType, "image/") {
		utils.ErrorResponse(c, http.StatusBadRequest, "File must be an image", nil)
		return
	}

	// Generate unique filename to prevent overwrites
	ext := filepath.Ext(header.Filename)
	uniqueFilename := fmt.Sprintf("%d_%s%s", time.Now().Unix(), generateRandomString(8), ext)

	// Upload image to user-specific directory
	imageURL, err := StoreFile(file, userIDStr, uniqueFilename)
	if err != nil {
		utils.ErrorResponse(c, http.StatusInternalServerError, "Failed to upload image", err)
		return
	}

	utils.SuccessResponse(c, http.StatusCreated, gin.H{
		"url": imageURL,
	})
}

// Helper function to generate random string
func generateRandomString(length int) string {
	const charset = "abcdefghijklmnopqrstuvwxyz0123456789"
	b := make([]byte, length)
	for i := range b {
		b[i] = charset[rand.Intn(len(charset))]
	}
	return string(b)
}

func StoreFile(file multipart.File, userID, filename string) (string, error) {
	// Create user-specific upload directory
	uploadDir := filepath.Join(viper.GetString("upload-dir"), "images", userID)
	if err := os.MkdirAll(uploadDir, 0755); err != nil {
		return "", fmt.Errorf("failed to create upload directory: %w", err)
	}

	// Create file path
	filePath := filepath.Join(uploadDir, filename)

	// Create destination file
	dst, err := os.Create(filePath)
	if err != nil {
		return "", fmt.Errorf("failed to create file: %w", err)
	}
	defer dst.Close()

	// Copy uploaded file to destination
	if _, err := io.Copy(dst, file); err != nil {
		return "", fmt.Errorf("failed to save file: %w", err)
	}

	// Return public URL (adjust based on your server configuration)
	// Assuming you serve static files from /uploads
	publicURL := fmt.Sprintf("/uploads/images/%s/%s", userID, filename)

	return publicURL, nil
}

func DeleteFile(userID, filename string) error {
	// Create user-specific upload directory
	uploadDir := filepath.Join(viper.GetString("upload-dir"), "images", userID)

	// Create file path
	filePath := filepath.Join(uploadDir, filename)

	// Delete file
	if err := os.Remove(filePath); err != nil {
		return fmt.Errorf("failed to delete file: %w", err)
	}

	return nil
}

// DeleteImage deletes an image from the server.
func (h *AdminHandler) DeleteImage(c *gin.Context) {
	userID, exists := c.Get("user_id")
	if !exists {
		utils.ErrorResponse(c, http.StatusUnauthorized, "User not authenticated", nil)
		return
	}
	// Convert user_id to string
	userIDStr := fmt.Sprintf("%v", userID)
	filename := c.Param("filename")

	if err := DeleteFile(userIDStr, filename); err != nil {
		utils.ErrorResponse(c, http.StatusInternalServerError, "Failed to delete image", err)
		return
	}

	utils.SuccessResponse(c, http.StatusOK, gin.H{
		"message": "Image deleted successfully",
	})
}

func (h *AdminHandler) GetUserOrders(c *gin.Context) {
	userID := c.Param("userId")
	// Convert user_id to string
	userIDStr := fmt.Sprintf("%v", userID)

	if orders, err := h.db.GetOrdersByOption("user_id", &userIDStr); err != nil {
		utils.ErrorResponse(c, http.StatusInternalServerError, "Failed to get user orders", err)
		return
	} else {
		utils.SuccessResponse(c, http.StatusOK, orders)
	}
}

func (h *AdminHandler) UpdateUserPassword(c *gin.Context) {
	userID, exists := c.Get("user_id")
	if !exists {
		utils.ErrorResponse(c, http.StatusUnauthorized, "User not authenticated", nil)
		return
	}
	// Convert user_id to string
	userIDStr := fmt.Sprintf("%v", userID)
	var req struct {
		CurrentPassword string `json:"current_password"`
		NewPassword     string `json:"new_password"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		utils.ErrorResponse(c, http.StatusBadRequest, "Invalid request body", err)
		return
	}

	user, err := h.db.GetUserByID(userIDStr)
	if err != nil {
		utils.ErrorResponse(c, http.StatusInternalServerError, "Failed to get user", err)
		return
	}

	if err := bcrypt.CompareHashAndPassword([]byte(user.Password), []byte(req.CurrentPassword)); err != nil {
		utils.ErrorResponse(c, http.StatusUnauthorized, "Invalid current password", err)
		return
	}

	newPasswordHash, err := bcrypt.GenerateFromPassword([]byte(req.NewPassword), bcrypt.DefaultCost)
	if err != nil {
		utils.ErrorResponse(c, http.StatusInternalServerError, "Failed to hash new password", err)
		return
	}
	newUser := user
	newUser.Password = string(newPasswordHash)
	err = h.db.UpdateUser(newUser)
	if err != nil {
		utils.ErrorResponse(c, http.StatusInternalServerError, "Failed to update user", err)
		return
	}

	utils.SuccessResponse(c, http.StatusOK, gin.H{
		"message": "User password updated successfully",
	})
}

func (h *AdminHandler) UpdateUser(c *gin.Context) {
	var req struct {
		Id        string `json:"id"`
		FirstName string `json:"first_name"`
		LastName  string `json:"last_name"`
		Email     string `json:"email"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		utils.ErrorResponse(c, http.StatusBadRequest, "Invalid request body", err)
		return
	}

	user, err := h.db.GetUserByID(req.Id)
	if err != nil {
		utils.ErrorResponse(c, http.StatusInternalServerError, "Failed to get user", err)
		return
	}

	newUser := user
	newUser.FirstName = req.FirstName
	newUser.LastName = req.LastName
	newUser.Email = req.Email
	err = h.db.UpdateUser(newUser)
	if err != nil {
		utils.ErrorResponse(c, http.StatusInternalServerError, "Failed to update user", err)
		return
	}

	utils.SuccessResponse(c, http.StatusOK, gin.H{
		"message": "User updated successfully",
	})
}

func (h *AdminHandler) CreateCategory(c *gin.Context) {
	var req models.Category

	if err := c.ShouldBindJSON(&req); err != nil {
		utils.ErrorResponse(c, http.StatusBadRequest, "Invalid request body", err)
		return
	}

	_, err := h.db.CreateCategory(&req)
	if err != nil {
		utils.ErrorResponse(c, http.StatusInternalServerError, "Failed to create category", err)
		return
	}

	utils.SuccessResponse(c, http.StatusCreated, gin.H{
		"message": "Category created successfully",
	})
}

func (h *AdminHandler) UpdateCategory(c *gin.Context) {
	slug := c.Param("slug")
	var req models.Category

	if err := c.ShouldBindJSON(&req); err != nil {
		utils.ErrorResponse(c, http.StatusBadRequest, "Invalid request body", err)
		return
	}

	category, err := h.db.GetCategoryBySlug(slug)
	if err != nil {
		utils.ErrorResponse(c, http.StatusInternalServerError, "Failed to get category", err)
		return
	}

	category.Name = req.Name
	category.Description = req.Description
	category.ImageURL = req.ImageURL
	category.Slug = req.Slug

	err = h.db.UpdateCategory(category)
	if err != nil {
		utils.ErrorResponse(c, http.StatusInternalServerError, "Failed to update category", err)
		return
	}

	utils.SuccessResponse(c, http.StatusOK, gin.H{
		"message": "Category updated successfully",
	})
}

func (h *AdminHandler) DeleteCategory(c *gin.Context) {
	idOrSlug := c.Param("unique_value")

	err := h.db.DeleteCategory(idOrSlug)
	if err != nil {
		utils.ErrorResponse(c, http.StatusInternalServerError, "Failed to delete category", err)
		return
	}

	utils.SuccessResponse(c, http.StatusOK, gin.H{
		"message": "Category deleted successfully",
	})
}

func (h *AdminHandler) UpdateWebsiteSetting(c *gin.Context) {
	key := c.Param("key")
	userID, exists := c.Get("user_id")
	if !exists {
		utils.ErrorResponse(c, http.StatusUnauthorized, "User not authenticated", nil)
		return
	}

	userIDStr := fmt.Sprintf("%v", userID)

	var req struct {
		Value string `json:"value" binding:"required"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		log.Println("Failed to bind JSON:", err)
		utils.ErrorResponse(c, http.StatusBadRequest, "Invalid request body", err)
		return
	}

	log.Println("UpdateWebsiteSetting:", key, req.Value)

	// --- Centralized Image Cleanup Logic (Helper Function needed in your codebase) ---
	// Define a helper function structure to clean up the logic
	cleanupImage := func(currentValue string, newValue string, jsonField string) {
		var current map[string]any
		var new map[string]any

		if err := json.Unmarshal([]byte(currentValue), &current); err != nil {
			log.Printf("Failed to unmarshal existing JSON for cleanup (%s): %v", key, err)
			return
		}
		if err := json.Unmarshal([]byte(newValue), &new); err != nil {
			log.Printf("Failed to unmarshal new JSON for cleanup (%s): %v", key, err)
			return
		}

		// We must type assert the values now that they are interfaces
		oldImagePath, oldOk := current[jsonField].(string)
		newImagePath, newOk := new[jsonField].(string)

		if oldOk && newOk && oldImagePath != "" && oldImagePath != newImagePath {
			parsedFilename := filepath.Base(oldImagePath)
			if err := DeleteFile(userIDStr, parsedFilename); err != nil {
				log.Printf("Failed to delete old image file (%s): %v", jsonField, err)
			}
		}
	}
	// --- End Helper Function ---

	// Check if the current setting has an image we need to potentially delete
	// We only need to fetch the existing setting once, before we update it in the database.
	setting, err := h.db.GetWebsiteSettingByKey(key)
	if err == nil && setting.Value != "" {
		currentValue := strings.TrimSpace(setting.Value)

		switch key {
		case "store":
			cleanupImage(currentValue, req.Value, "logo")
		case "hero":
			cleanupImage(currentValue, req.Value, "background_image")
		case "about":
			cleanupImage(currentValue, req.Value, "image")
		case "seo":
			// SEO handles multiple images, needs slight modification to the generic helper
			var oldSEO struct {
				OgImage string `json:"og_image"`
				Favicon string `json:"favicon"`
			}
			var newSEO struct {
				OgImage string `json:"og_image"`
				Favicon string `json:"favicon"`
			}

			if json.Unmarshal([]byte(currentValue), &oldSEO) == nil && json.Unmarshal([]byte(req.Value), &newSEO) == nil {
				// Check and delete OgImage
				if oldSEO.OgImage != "" && oldSEO.OgImage != newSEO.OgImage {
					if err := DeleteFile(userIDStr, filepath.Base(oldSEO.OgImage)); err != nil {
						log.Printf("Failed to delete old og_image file: %v", err)
					}
				}
				// Check and delete Favicon
				if oldSEO.Favicon != "" && oldSEO.Favicon != newSEO.Favicon {
					if err := DeleteFile(userIDStr, filepath.Base(oldSEO.Favicon)); err != nil {
						log.Printf("Failed to delete old favicon file: %v", err)
					}
				}
			}
		}
	} else if err != nil && err != sql.ErrNoRows { // Check if the error was something other than 'not found'
		log.Printf("Error fetching existing setting for key %s: %v", key, err)
	}

	// Update the database with the new value
	if err := h.db.UpdateWebsiteSetting(key, req.Value); err != nil {
		utils.ErrorResponse(c, http.StatusInternalServerError, "Failed to update setting", err)
		return
	}

	// Fetch the updated setting
	config, err := h.db.GetWebsiteSettingByKey(key)
	if err != nil {
		utils.ErrorResponse(c, http.StatusInternalServerError, "Failed to fetch updated setting", err)
		return
	}
	utils.SuccessResponse(c, http.StatusOK, config)
}
