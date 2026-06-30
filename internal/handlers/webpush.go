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
	RequireInteraction bool           `json:"requireInteraction,omitempty"`
}

// SendNotificationRequest for sending to specific users
type SendNotificationRequest struct {
	UserIDs []string            `json:"user_ids,omitempty"` // If empty, sends to all
	Payload NotificationPayload `json:"payload"`
}

// SubscribeToPushNotificationHandler - Subscribes user to push notifications
func (s *Handler) SubscribeToPushNotificationHandler(c *gin.Context) {
	userID := c.GetHeader("X-User-ID")
	if userID == "" {
		utils.SendResponse(c, utils.Response{
			Status:  http.StatusUnauthorized,
			Success: false,
			Message: "user id required",
		})
		return
	}

	user, err := s.db.GetUserByID(userID)
	if err != nil || user == nil {
		utils.SendResponse(c, utils.Response{
			Status:  http.StatusNotFound,
			Success: false,
			Message: "User not found",
		})
		return
	}

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
	if sub.Endpoint == "" || sub.Keys.P256dh == "" || sub.Keys.Auth == "" {
		utils.SendResponse(c, utils.Response{
			Status:  http.StatusBadRequest,
			Success: false,
			Message: "Invalid subscription data: missing required fields",
		})
		return
	}

	userAgent := c.GetHeader("User-Agent")

	if err := s.db.CreateWebPushSubscription(userID, &sub, userAgent); err != nil {
		slog.Error("Failed to save subscription", "user_id", userID, "error", err)
		utils.SendResponse(c, utils.Response{
			Status:  http.StatusInternalServerError,
			Success: false,
			Message: "Failed to save subscription",
		})
		return
	}

	slog.Info("Subscription saved successfully", "user_id", userID, "endpoint", sub.Endpoint)

	utils.SendResponse(c, utils.Response{
		Status:  http.StatusCreated,
		Success: true,
		Message: "Subscribed successfully",
	})
}

func (s *Handler) UnsubscribeToPushNotificationHandler(c *gin.Context) {
	c.Header("Content-Type", "application/json")

	userID := c.GetHeader("X-User-ID")
	if userID == "" {
		utils.SendResponse(c, utils.Response{
			Status:  http.StatusUnauthorized,
			Success: false,
			Message: "user id required",
		})
		return
	}

	user, err := s.db.GetUserByID(userID)
	if err != nil || user == nil {
		utils.SendResponse(c, utils.Response{
			Status:  http.StatusNotFound,
			Success: false,
			Message: "User not found",
		})
		return
	}

	var sub models.WebPushSubscription
	if err := c.ShouldBindJSON(&sub); err != nil {
		utils.SendResponse(c, utils.Response{
			Status:  http.StatusBadRequest,
			Success: false,
			Message: "Invalid request body",
		})
		return
	}

	if err := s.db.DeleteSubscription(sub.Endpoint); err != nil {
		slog.Error("Failed to delete subscription", "Error", err.Error())
		utils.SendResponse(c, utils.Response{
			Status:  http.StatusInternalServerError,
			Success: false,
			Message: "Failed to unsubscribe",
		})
		return
	}

	slog.Info("Subscription deleted", "details: ", sub.Endpoint)
	utils.SendResponse(c, utils.Response{
		Status:  http.StatusOK,
		Success: true,
		Message: "Unsubscribed successfully",
	})
}

func (s *Handler) SendPushNotificationHandler(c *gin.Context) {
	userID := c.GetHeader("X-User-ID")
	if userID == "" {
		utils.SendResponse(c, utils.Response{
			Status:  http.StatusUnauthorized,
			Success: false,
			Message: "user id required",
		})
		return
	}

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
	subscriptions, err := s.db.GetSubscriptionsByUserIDs(req.UserIDs)
	if err != nil {
		slog.Error("Failed to get subscriptions", "Error", err)
		utils.SendResponse(c, utils.Response{
			Success: false,
			Message: "Failed to get subscriptions",
			Status:  http.StatusInternalServerError,
		})
		return
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
			slog.Info("Failed to send to notification", "Endpoint", sub.Endpoint, "Error", err, "Vapid Private Key", viper.GetString("VAPID_PRIVATE_KEY"), "request", req)
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
		Success: successCount > 0,
		Message: message,
		Data: map[string]any{
			"sent":             successCount,
			"failed":           failureCount,
			"failed_endpoints": failedEndpoints,
		},
	})
}

// GetUserSubscriptionsHandler -  Get user subscriptions
func (s *Handler) GetUserSubscriptionsHandler(c *gin.Context) {
	userID := c.GetHeader("X-User-ID")
	if userID == "" {
		utils.SendResponse(c, utils.Response{
			Success: false,
			Message: "User ID required",
			Status:  http.StatusUnauthorized,
		})
		return
	}

	subscriptions, err := s.db.GetSubscriptionsByUserID(userID)
	if err != nil {
		log.Printf("Failed to get subscriptions: %v", err)
		utils.SendResponse(c, utils.Response{
			Status:  http.StatusInternalServerError,
			Message: fmt.Sprintf("Failed to get subscriptions: %s", err.Error()),
			Success: false,
		})
		return
	}

	utils.SendResponse(c, utils.Response{
		Success: true,
		Message: "Subscriptions retrieved successfully",
		Data:    subscriptions,
	})
}

// VerifySubscriptionHandler - Verify if a subscription exists in the backend
func (s *Handler) VerifySubscriptionHandler(c *gin.Context) {
	userID := c.GetHeader("X-User-ID")
	if userID == "" {
		utils.SendResponse(c, utils.Response{
			Status:  http.StatusUnauthorized,
			Success: false,
			Message: "User ID required",
		})
		return
	}

	var req struct {
		Endpoint string `json:"endpoint"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		utils.SendResponse(c, utils.Response{
			Status:  http.StatusBadRequest,
			Success: false,
			Message: "Invalid request body",
		})
		return
	}

	if req.Endpoint == "" {
		utils.SendResponse(c, utils.Response{
			Status:  http.StatusBadRequest,
			Success: false,
			Message: "Endpoint required",
		})
		return
	}

	// Check if subscription exists
	exists, err := s.db.SubscriptionExists(req.Endpoint)
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
