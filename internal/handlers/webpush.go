package handlers

import (
	"encoding/json"
	"fmt"
	"log"
	"log/slog"
	"net/http"

	"github.com/SherClockHolmes/webpush-go"
	"github.com/gin-gonic/gin"
	"github.com/imrany/elegance/internal/models"
	"github.com/imrany/elegance/pkg/utils"
	"github.com/spf13/viper"
)

// NotificationPayload represents the notification data
type NotificationPayload struct {
	Title              string         `json:"title"`
	Body               string         `json:"body"`
	Icon               string         `json:"icon,omitempty"`
	Badge              string         `json:"badge,omitempty"`
	Image              string         `json:"image,omitempty"`
	Data               map[string]any `json:"data,omitempty"`
	Tag                string         `json:"tag,omitempty"`
	RequireInteraction bool           `json:"require_interaction,omitempty"`
}

// SendNotificationRequest for sending to specific users
type SendNotificationRequest struct {
	Endpoints []string            `json:"endpoints,omitempty"` // If empty, sends to all
	Payload   NotificationPayload `json:"payload"`
}

// SubscribeToPushNotification - Subscribes user to push notifications
func (s *Handler) SubscribeToPushNotification(c *gin.Context) {
	var sub models.WebPushSubscription
	if err := c.ShouldBindJSON(&sub); err != nil {
		utils.SendResponse(c, utils.Response{
			Status:  http.StatusBadRequest,
			Success: false,
			Message: "Invalid request body",
		})
		return
	}

	// Validate subscription data
	if sub.Endpoint == "" || sub.P256dh == "" || sub.Auth == "" {
		utils.SendResponse(c, utils.Response{
			Status:  http.StatusBadRequest,
			Success: false,
			Message: "Invalid subscription data: missing required fields",
		})
		return
	}

	if err := s.db.CreateWebPushSubscription(&sub); err != nil {
		slog.Error("Failed to save subscription", "error", err)
		utils.SendResponse(c, utils.Response{
			Status:  http.StatusInternalServerError,
			Success: false,
			Message: "Failed to save subscription",
		})
		return
	}

	slog.Info("Subscription saved successfully", "endpoint", sub.Endpoint)

	utils.SendResponse(c, utils.Response{
		Status:  http.StatusCreated,
		Success: true,
		Message: "Subscribed successfully",
	})
}

func (s *Handler) UnsubscribeToPushNotification(c *gin.Context) {
	endpoint := c.Param("endpoint")
	if err := s.db.DeleteSubscription(endpoint); err != nil {
		slog.Error("Failed to delete subscription", "Error", err.Error())
		utils.SendResponse(c, utils.Response{
			Status:  http.StatusInternalServerError,
			Success: false,
			Message: "Failed to unsubscribe",
		})
		return
	}

	slog.Info("Subscription deleted", "details: ", endpoint)
	utils.SendResponse(c, utils.Response{
		Status:  http.StatusOK,
		Success: true,
		Message: "Unsubscribed successfully",
	})
}

func (s *Handler) SendPushNotification(c *gin.Context) {
	var req SendNotificationRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		utils.SendResponse(c, utils.Response{
			Status:  http.StatusBadRequest,
			Success: false,
			Message: "Invalid request body",
		})
		return
	}

	// Get subscriptions
	var subscriptions []models.PushSubscription
	for _, e := range req.Endpoints {
		subscription, err := s.db.GetSubscriptionByEndpoint(e)
		if err != nil {
			slog.Error("Failed to get subscriptions", "Error", err)
			continue // Avoid crashing
		}
		// FIXED: Check for nil pointers to prevent application runtime panics
		if subscription != nil {
			subscriptions = append(subscriptions, *subscription)
		}
	}

	if len(subscriptions) == 0 {
		utils.SendResponse(c, utils.Response{
			Status:  http.StatusOK,
			Success: true,
			Data: map[string]any{
				"success": 0,
				"failed":  0,
				"message": "No subscriptions found",
			},
		})
		return
	}

	// Convert payload to JSON
	data, err := json.Marshal(req.Payload)
	if err != nil {
		utils.SendResponse(c, utils.Response{
			Status:  http.StatusInternalServerError,
			Success: false,
			Message: err.Error(),
		})
		return
	}

	successCount := 0
	failureCount := 0
	failedEndpoints := []string{}

	for _, sub := range subscriptions {
		resp, err := webpush.SendNotification(data, &webpush.Subscription{
			Endpoint: sub.Endpoint,
			Keys: webpush.Keys{
				Auth:   sub.AuthKey,
				P256dh: sub.P256dhKey,
			},
		}, &webpush.Options{
			Subscriber:      viper.GetString("vapid-email"),
			VAPIDPublicKey:  viper.GetString("vapid-public-key"),
			VAPIDPrivateKey: viper.GetString("vapid-private-key"),
			TTL:             30,
		})

		if err != nil {
			slog.Info("Failed to send notification", "Endpoint", sub.Endpoint, "Error", err, "request", req)
			failureCount++
			failedEndpoints = append(failedEndpoints, sub.Endpoint)

			// Delete invalid subscriptions (410 Gone or 404 Not Found)
			if resp != nil && (resp.StatusCode == http.StatusGone || resp.StatusCode == http.StatusNotFound) {
				s.db.DeleteSubscription(sub.Endpoint)
				slog.Info("Deleted invalid subscription", "Endpoint", sub.Endpoint)
			}
		} else {
			resp.Body.Close()
			if resp.StatusCode >= 200 && resp.StatusCode < 300 {
				successCount++
			} else {
				slog.Info("Push failed", "Status", resp.StatusCode, "Endpoint", sub.Endpoint)
				failureCount++
				failedEndpoints = append(failedEndpoints, sub.Endpoint)
			}
		}
	}

	message := "Failed to send push notification"
	if successCount > 0 {
		message = "Push notifications sent"
	}
	utils.SendResponse(c, utils.Response{
		Status:  http.StatusOK, // Expressly specified standard status code
		Success: successCount > 0,
		Message: message,
		Data: map[string]any{
			"sent":             successCount,
			"failed":           failureCount,
			"failed_endpoints": failedEndpoints,
		},
	})
}

// GetSubscription -  Get subscriptions
func (s *Handler) GetSubscription(c *gin.Context) {
	endpoint := c.Param("endpoint")
	subscription, err := s.db.GetSubscriptionByEndpoint(endpoint)
	if err != nil {
		log.Printf("Failed to get subscriptions: %v", err)
		utils.SendResponse(c, utils.Response{
			Status:  http.StatusInternalServerError,
			Message: fmt.Sprintf("Failed to get subscriptions: %s", err.Error()),
			Success: false,
		})
		return
	}

	// FIXED: Gracefully handle missing subscription check matching your database layer
	if subscription == nil {
		utils.SendResponse(c, utils.Response{
			Status:  http.StatusNotFound,
			Message: "Subscription not found",
			Success: false,
		})
		return
	}

	utils.SendResponse(c, utils.Response{
		Status:  http.StatusOK,
		Success: true,
		Message: "Subscription retrieved successfully",
		Data:    subscription,
	})
}

// VerifySubscription - Verify if a subscription exists in the backend
func (s *Handler) VerifySubscription(c *gin.Context) {
	endpoint := c.Param("endpoint")
	if endpoint == "" {
		utils.SendResponse(c, utils.Response{
			Status:  http.StatusBadRequest,
			Success: false,
			Message: "Endpoint required",
		})
		return
	}

	// Check if subscription exists
	exists, err := s.db.SubscriptionExists(endpoint)
	if err != nil {
		slog.Error("Failed to verify subscription", "error", err)
		utils.SendResponse(c, utils.Response{
			Success: false,
			Message: "Failed to verify subscription",
			Status:  http.StatusInternalServerError,
		})
		return
	}

	if !exists {
		utils.SendResponse(c, utils.Response{
			Status:  http.StatusNotFound,
			Success: false,
			Message: "Subscription not found",
		})
		return
	}

	utils.SendResponse(c, utils.Response{
		Status:  http.StatusOK,
		Success: true,
		Message: "Subscription exists",
	})
}
