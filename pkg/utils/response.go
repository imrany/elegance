package utils

import (
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
