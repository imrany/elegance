package handlers

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/imrany/ecommerce/pkg/utils"
)

// GetAllWebsiteConfig handles GET /api/website-builder
func (s *Handler) GetAllWebsiteConfig(c *gin.Context) {
	settings, err := s.db.GetAllWebsiteSettings()
	if err != nil {
		utils.ErrorResponse(c, http.StatusInternalServerError, "Failed to get website settings", err)
		return
	}

	utils.SuccessResponse(c, http.StatusOK, settings)
}

// GetWebsiteConfig handles GET /api/website-builder/:key
func (s *Handler) GetWebsiteConfig(c *gin.Context) {
	key := c.Param("key")
	settings, err := s.db.GetWebsiteSettingByKey(key)
	if err != nil {
		utils.ErrorResponse(c, http.StatusInternalServerError, "Failed to get website settings", err)
		return
	}

	utils.SuccessResponse(c, http.StatusOK, settings)
}
