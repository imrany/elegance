package handlers

import "github.com/imrany/elegance/internal/database"

// Handler holds dependencies and embeds all specialized handler sub-modules
type Handler struct {
	db           database.DB
	AuthHandler  *AuthHandler  // Embeds all Auth methods (SignUp, SignIn, GetMe...)
	AdminHandler *AdminHandler // Embeds all Admin methods (GetAllOrders, etc.)
}

// New creates a new unified handler instance
func New(db database.DB, jwtSecret string) *Handler {
	h := &Handler{
		db: db,
	}

	// Initialize sub-handlers passing the parent db reference
	h.AuthHandler = NewAuthHandler(db, jwtSecret)
	h.AdminHandler = NewAdminHandler(db, jwtSecret)

	return h
}
