package handlers

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/imrany/elegance/pkg/utils"
)

// GetAllWebsiteConfig handles GET /api/website-builder
func (s *Handler) GetAllWebsiteConfig(c *gin.Context) {
	settings, err := s.db.GetAllWebsiteSettings()
	if err != nil {
		utils.SendResponse(c, utils.Response{
			Status:  http.StatusInternalServerError,
			Success: false,
			Message: "Failed to get website settings",
		})
		return
	}

	utils.SendResponse(c, utils.Response{
		Status:  http.StatusOK,
		Success: true,
		Message: "Website settings retrieved successfully",
		Data:    settings,
	})
}

// GetWebsiteConfig handles GET /api/website-builder/:key
func (s *Handler) GetWebsiteConfig(c *gin.Context) {
	key := c.Param("key")
	settings, err := s.db.GetWebsiteSettingByKey(key)
	if err != nil {
		utils.SendResponse(c, utils.Response{
			Status:  http.StatusInternalServerError,
			Success: false,
			Message: "Failed to get website settings",
		})
		return
	}

	utils.SendResponse(c, utils.Response{
		Status:  http.StatusOK,
		Success: true,
		Message: "Website settings retrieved successfully",
		Data:    settings,
	})
}
