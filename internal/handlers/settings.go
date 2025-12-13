package handlers

import (
	"database/sql"
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/imrany/ecommerce/pkg/utils"
)

// GetSiteSetting handles GET /api/settings/:key
func (h *Handler) GetSiteSetting(c *gin.Context) {
	key := c.Param("key")

	setting, err := h.db.GetSiteSetting(key)
	if err != nil {
		if err.Error() == "setting not found" || err == sql.ErrNoRows {
			utils.ErrorResponse(c, http.StatusNotFound, "Setting not found", err)
			return
		}
		utils.ErrorResponse(c, http.StatusInternalServerError, "Failed to fetch setting", err)
		return
	}

	utils.SuccessResponse(c, http.StatusOK, setting)
}
