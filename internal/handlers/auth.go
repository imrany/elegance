package handlers

import (
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

// AuthHandler handles authentication endpoints
type AuthHandler struct {
	db        database.DB
	jwtSecret string
}

// NewAuthHandler creates a new auth handler
func NewAuthHandler(db database.DB, jwtSecret string) *AuthHandler {
	return &AuthHandler{
		db:        db,
		jwtSecret: jwtSecret,
	}
}

// SignUpRequest represents signup request body
type SignUpRequest struct {
	Email       string `json:"email" binding:"required,email"`
	Password    string `json:"password" binding:"required,min=6"`
	FirstName   string `json:"first_name" binding:"required"`
	LastName    string `json:"last_name" binding:"required"`
	PhoneNumber string `json:"phone_number" binding:"required"`
}

// SignInRequest represents signin request body
type SignInRequest struct {
	Email    string `json:"email" binding:"required,email"`
	Password string `json:"password" binding:"required"`
}

// SignUp handles user registration
func (h *AuthHandler) SignUp(c *gin.Context) {
	var req SignUpRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		utils.ErrorResponse(c, http.StatusBadRequest, "Invalid request body", err)
		return
	}

	// Check if user already exists
	existingUser, _ := h.db.GetUserByEmail(req.Email)
	if existingUser != nil {
		utils.ErrorResponse(c, http.StatusConflict, "Email already registered", nil)
		return
	}

	// Hash password
	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(req.Password), bcrypt.DefaultCost)
	if err != nil {
		utils.ErrorResponse(c, http.StatusInternalServerError, "Failed to process password", err)
		return
	}

	// Create user
	userRequest := models.User{
		FirstName:   req.FirstName,
		LastName:    req.LastName,
		PhoneNumber: req.PhoneNumber,
		ID:          uuid.New().String(),
		Email:       req.Email,
		Role:        "user",
		Password:    string(hashedPassword),
		CreatedAt:   time.Now(),
		UpdatedAt:   time.Now(),
	}
	user, err := h.db.CreateUser(&userRequest)
	if err != nil {
		if strings.Contains(err.Error(), "already exists") {
			utils.ErrorResponse(c, http.StatusConflict, "Email already registered", err)
			return
		}
		utils.ErrorResponse(c, http.StatusInternalServerError, "Failed to create user", err)
		return
	}

	utils.SuccessResponse(c, http.StatusCreated, gin.H{
		"user": user,
	})
}

// SignIn handles user login
func (h *AuthHandler) SignIn(c *gin.Context) {
	var req SignInRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		utils.ErrorResponse(c, http.StatusBadRequest, "Invalid request body", err)
		return
	}

	// Get user
	user, err := h.db.GetUserByEmail(req.Email)
	if err != nil {
		utils.ErrorResponse(c, http.StatusUnauthorized, "Invalid email or password", nil)
		return
	}

	// Verify password
	if err := bcrypt.CompareHashAndPassword([]byte(user.Password), []byte(req.Password)); err != nil {
		utils.ErrorResponse(c, http.StatusUnauthorized, "Invalid email or password", nil)
		return
	}

	// Generate JWT token
	token := jwt.NewWithClaims(jwt.SigningMethodHS256, jwt.MapClaims{
		"user_id": user.ID,
		"email":   user.Email,
		"role":    user.Role,
		"exp":     time.Now().Add(24 * time.Hour).Unix(),
		"iat":     time.Now().Unix(),
	})

	tokenString, err := token.SignedString([]byte(h.jwtSecret))
	if err != nil {
		utils.ErrorResponse(c, http.StatusInternalServerError, "Failed to generate token", err)
		return
	}

	utils.SuccessResponse(c, http.StatusOK, gin.H{
		"token": tokenString,
		"user":  user,
	})
}

// GetMe returns current user info
func (h *AuthHandler) GetMe(c *gin.Context) {
	userID := c.GetString("user_id")

	user, err := h.db.GetUserByID(userID)
	if err != nil {
		utils.ErrorResponse(c, http.StatusNotFound, "User not found", err)
		return
	}

	utils.SuccessResponse(c, http.StatusOK, gin.H{
		"user": user,
	})
}
