package utils

import (
	"fmt"
	"log"

	"github.com/gin-gonic/gin"
)

// ErrorResponse sends a standardized error response
func ErrorResponse(c *gin.Context, status int, message string, err error) {
	if err != nil {
		log.Printf("Error [%d]: %s - %v", status, message, err)
	}

	c.JSON(status, gin.H{
		"error":   message,
		"status":  status,
		"success": false,
	})
}

// SuccessResponse sends a standardized success response
func SuccessResponse(c *gin.Context, status int, data any) {
	c.JSON(status, gin.H{
		"data":    data,
		"status":  status,
		"success": true,
	})
}

// MessageResponse sends a simple message response
func MessageResponse(c *gin.Context, status int, message string) {
	c.JSON(status, gin.H{
		"message": message,
		"status":  status,
		"success": true,
	})
}

// Custom error types
type ValidationError struct {
	Field   string
	Message string
}

func (e ValidationError) Error() string {
	return fmt.Sprintf("%s: %s", e.Field, e.Message)
}

// Error helpers
func ErrMissingField(field string) error {
	return ValidationError{
		Field:   field,
		Message: "is required",
	}
}

func ErrInvalidField(field, message string) error {
	return ValidationError{
		Field:   field,
		Message: message,
	}
}
