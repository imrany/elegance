package handlers

import "github.com/imrany/ecommerce/internal/database"

// Handler holds dependencies for all handlers
type Handler struct {
	db database.DB
}

// New creates a new handler instance
func New(db database.DB) *Handler {
	return &Handler{db: db}
}
