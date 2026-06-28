package handlers

import (
	"fmt"
	"net/http"
	"strings"

	"github.com/gin-gonic/gin"
	"github.com/imrany/elegance/internal/models"
	"github.com/imrany/elegance/pkg/utils"
)

// POST: /email/subscribe
func (h *Handler) SubscribeEmail(c *gin.Context) {
	var req struct {
		Email string `json:"email" binding:"required,email"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		utils.SendResponse(c, utils.Response{
			Status:  http.StatusBadRequest,
			Message: "A valid email address is required",
		})
		return
	}

	if err := h.Subscribe(c, req.Email); err != nil {
		utils.SendResponse(c, utils.Response{
			Status:  http.StatusInternalServerError,
			Message: err.Error(),
		})
		return
	}

	utils.SendResponse(c, utils.Response{
		Status:  http.StatusOK,
		Message: "Successfully subscribed to newsletter!",
	})
}

// Subscribe handles the subscription process for a given email address
func (h *Handler) Subscribe(c *gin.Context, email string) error {
	// Normalize email strings to lowercase to prevent case-sensitive duplicate records
	cleanEmail := strings.ToLower(strings.TrimSpace(email))

	subscription := &models.EmailSubscription{
		Email: cleanEmail,
	}

	if err := h.WelcomeNewsletterSubscription(c, []string{cleanEmail}); err != nil {
		return fmt.Errorf("failed to send newsletter: %w", err)
	}

	if err := h.db.CreateEmailSubscription(subscription); err != nil {
		// Catch database unique constraint errors cleanly without exposing raw SQL errors
		if strings.Contains(err.Error(), "UNIQUE") || strings.Contains(err.Error(), "duplicate key") {
			return fmt.Errorf("already subscribed, We'll keep you updated!")
		}

		return fmt.Errorf("failed to save subscription details: %w", err)
	}
	return nil
}

// GET: /email/subscriptions
func (h *Handler) GetEmailSubscriptions(c *gin.Context) {
	subs, err := h.db.GetEmailSubscriptions()
	if err != nil {
		utils.SendResponse(c, utils.Response{
			Status:  http.StatusInternalServerError,
			Message: "Failed to fetch email subscriptions",
		})
		return
	}

	utils.SendResponse(c, utils.Response{
		Status: http.StatusOK,
		Data:   subs,
	})
}

// GET: /email/subscriptions/:email
func (h *Handler) GetEmailSubscription(c *gin.Context) {
	email := strings.TrimSpace(c.Param("email"))
	if email == "" {
		utils.SendResponse(c, utils.Response{
			Status:  http.StatusBadRequest,
			Message: "Email parameter is required",
		})
		return
	}

	subs, err := h.db.GetEmailSubscriptionByEmail(strings.ToLower(email))
	if err != nil {
		// Handle database entity missing / row not found errors
		if strings.Contains(err.Error(), "not found") {
			utils.SendResponse(c, utils.Response{
				Status:  http.StatusNotFound,
				Message: "No active subscription found for that email address",
			})
			return
		}

		utils.SendResponse(c, utils.Response{
			Status:  http.StatusInternalServerError,
			Message: "Error looking up subscription profile",
		})
		return
	}

	utils.SendResponse(c, utils.Response{
		Status: http.StatusOK,
		Data:   subs,
	})
}

// DELETE: /email/unsubscribe/:email
func (h *Handler) UnsubscribeEmail(c *gin.Context) {
	email := strings.TrimSpace(c.Param("email"))
	if email == "" {
		utils.SendResponse(c, utils.Response{
			Status:  http.StatusBadRequest,
			Message: "Target email address is missing",
		})
		return
	}

	if err := h.db.DeleteEmailSubscription(strings.ToLower(email)); err != nil {
		utils.SendResponse(c, utils.Response{
			Status:  http.StatusInternalServerError,
			Message: "Failed to process cancellation request",
		})
		return
	}

	utils.SendResponse(c, utils.Response{
		Status:  http.StatusOK,
		Message: "Unsubscribed successfully",
	})
}
