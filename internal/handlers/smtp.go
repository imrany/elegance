package handlers

import (
	"encoding/json"
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/imrany/elegance/pkg/mailer"
	"github.com/imrany/elegance/pkg/utils"
)

// GetWebsiteSmtpConfig returns the SMTP configuration for the website
func (s *Handler) GetWebsiteSmtpConfig(c *gin.Context) (*mailer.SmtpConfig, error) {
	settings, err := s.db.GetWebsiteSettingByKey("smtp")
	if err != nil {
		return nil, err
	}

	//parse settings.Value string into SmtpConfig
	config := mailer.SmtpConfig{}
	if err := json.Unmarshal([]byte(settings.Value), &config); err != nil {
		return nil, err
	}
	return &config, nil
}

// TestSmtpConnection handles GET /api/admin/smtp/test
func (s *Handler) TestSmtpConnection(c *gin.Context) {
	config, err := s.GetWebsiteSmtpConfig(c)
	if err != nil {
		utils.SendResponse(c, utils.Response{
			Status:  http.StatusInternalServerError,
			Success: false,
			Message: "Failed to get SMTP configuration",
		})
		return
	}
	ok, err := mailer.TestConnection(config)
	if err != nil || !ok {
		utils.SendResponse(c, utils.Response{
			Status:  http.StatusInternalServerError,
			Success: false,
			Message: "Failed to establish server handshake: " + err.Error(),
		})
		return
	}

	utils.SendResponse(c, utils.Response{
		Status:  http.StatusOK,
		Success: true,
		Message: "SMTP Server Connection Successful!",
	})
}

// ComposeEmail handles POST /api/admin/smtp/compose
func (s *Handler) ComposeEmail(c *gin.Context) {
	var req mailer.EmailPayload

	if err := c.ShouldBindJSON(&req); err != nil {
		utils.SendResponse(c, utils.Response{
			Status:  http.StatusBadRequest,
			Success: false,
			Message: err.Error(),
		})
		return
	}

	config, err := s.GetWebsiteSmtpConfig(c)
	if err != nil {
		utils.SendResponse(c, utils.Response{
			Status:  http.StatusInternalServerError,
			Success: false,
			Message: "Failed to get SMTP configuration",
		})
		return
	}

	msg, err := mailer.ComposeEmail(&req, config)
	if err != nil {
		utils.SendResponse(c, utils.Response{
			Status:  http.StatusInternalServerError,
			Success: false,
			Message: "Failed to send email: " + err.Error(),
		})
		return
	}
	if err := mailer.Send(config, msg); err != nil {
		utils.SendResponse(c, utils.Response{
			Status:  http.StatusInternalServerError,
			Success: false,
			Message: "Failed to send email: " + err.Error(),
		})
		return
	}
	utils.SendResponse(c, utils.Response{
		Status:  http.StatusOK,
		Success: true,
		Message: "Email sent successfully",
	})
}
