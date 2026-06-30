package utils

import (
	"log/slog"
	"os"

	"github.com/SherClockHolmes/webpush-go"
	"github.com/gin-gonic/gin"
)

type Response struct {
	Status  int    `json:"status"`
	Success bool   `json:"success"`
	Message string `json:"message"`
	Data    any    `json:"data"`
}

func SendResponse(c *gin.Context, response Response) {
	c.JSON(response.Status, gin.H{
		"status":  response.Status,
		"success": response.Success,
		"message": response.Message,
		"data":    response.Data,
	})
}

// GenerateVAPIDKeys - Generate VAPID keys (run once) - go run cmd/server/main.go generate-vapid
func GenerateVAPIDKeys() {
	privateKey, publicKey, err := webpush.GenerateVAPIDKeys()
	if err != nil {
		slog.Error("Failed to generate VAPID keys", "Error", err)
		os.Exit(1)
	}
	slog.Info("GENERATED_VAPID_KEYS", "Public Key", publicKey)
	slog.Info("GENERATED_VAPID_KEYS", "Private Key", privateKey)
}
