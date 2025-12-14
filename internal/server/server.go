package server

import (
	"fmt"
	"net/http"
	"time"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	"github.com/imrany/ecommerce/internal/database"
	"github.com/imrany/ecommerce/internal/handlers"
	"github.com/imrany/ecommerce/internal/middleware"
)

type ServerConfig struct {
	Port int
	Host string
}

type Config struct {
	Server    ServerConfig
	DBType    string
	JWTSecret string
}

// Server represents the HTTP server
type Server struct {
	config  *Config
	router  *gin.Engine
	handler *handlers.Handler
	db      database.DB
}

// New creates a new server instance
func New(cfg *Config, db database.DB) *Server {
	// Set Gin mode
	if cfg.Server.Host == "0.0.0.0" {
		gin.SetMode(gin.ReleaseMode)
	} else {
		gin.SetMode(gin.DebugMode)
	}

	router := gin.New()

	// Middleware
	router.Use(gin.Logger())
	router.Use(gin.Recovery())

	// CORS middleware
	router.Use(cors.New(cors.Config{
		AllowOrigins:     []string{"*"}, // TODO: Configure specific origins in production
		AllowMethods:     []string{"GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"},
		AllowHeaders:     []string{"Origin", "Content-Type", "Authorization", "Accept"},
		ExposeHeaders:    []string{"Content-Length"},
		AllowCredentials: true,
		MaxAge:           12 * time.Hour,
	}))

	handler := handlers.New(db)

	srv := &Server{
		config:  cfg,
		router:  router,
		handler: handler,
		db:      db,
	}

	srv.setupRoutes()
	return srv
}

// setupRoutes configures all API routes
func (s *Server) setupRoutes() {
	// Health check
	s.router.GET("/health", s.handleHealth)
	s.router.GET("/", s.handleRoot)

	// API v1 routes
	api := s.router.Group("/api")
	{
		// Auth endpoints (public)
		authHandler := handlers.NewAuthHandler(s.db, s.config.JWTSecret)
		auth := api.Group("/auth")
		{
			auth.POST("/signup", authHandler.SignUp)
			auth.POST("/signin", authHandler.SignIn)
		}

		// Setup endpoints (public)
		setup := api.Group("/setup")
		{
			setupHandler := handlers.NewAdminHandler(s.db, s.config.JWTSecret)
			setup.GET("/status", setupHandler.GetSetupStatus)
			setup.POST("/admin", setupHandler.CreateInitialAdmin)
		}

		// Categories (public)
		categories := api.Group("/categories")
		{
			categories.GET("", s.handler.GetCategories)
			categories.GET("/:slug", s.handler.GetCategoryBySlug)
		}

		// Products (public)
		products := api.Group("/products")
		{
			products.GET("", s.handler.GetProducts)
			products.GET("/featured", s.handler.GetFeaturedProducts)
			products.GET("/new", s.handler.GetNewProducts)
			products.GET("/:slug", s.handler.GetProductBySlug)
		}

		// Settings (public)
		settings := api.Group("/settings")
		{
			settings.GET("/:key", s.handler.GetSiteSetting)
		}

		// Protected routes (require authentication)
		authenticated := api.Group("")
		authenticated.Use(middleware.AuthMiddleware(s.config.JWTSecret))
		{
			authenticated.GET("/auth/me", authHandler.GetMe)

			// Orders
			authenticated.POST("/orders", s.handler.CreateOrder)
			authenticated.GET("/orders/:id", s.handler.GetOrderByID)
		}

		// Admin routes (require admin role)
		admin := api.Group("/admin")
		admin.Use(middleware.AuthMiddleware(s.config.JWTSecret), middleware.AdminOnly())
		{
			// Add admin-only routes here
			adminHandler := handlers.NewAdminHandler(s.db, s.config.JWTSecret)

			// User management
			admin.GET("/users", adminHandler.GetAllUsers)
			admin.PUT("/users/:id/role", adminHandler.UpdateUserRole)
			admin.DELETE("/users/:id", adminHandler.DeleteUser)

			// Orders management
			admin.GET("/orders", adminHandler.GetAllOrders)
			admin.PUT("/orders/:id/status", adminHandler.UpdateOrderStatus)

			// Products management
			admin.GET("/products", adminHandler.GetAllProducts)
			admin.POST("/products", adminHandler.CreateProduct)
			admin.PUT("/products/:id", adminHandler.UpdateProduct)
			admin.DELETE("/products/:id", adminHandler.DeleteProduct)

			// Settings management
			admin.PUT("/settings/:key", adminHandler.UpdateSetting)
		}
	}
}

// handleHealth handles health check requests
func (s *Server) handleHealth(c *gin.Context) {
	c.JSON(http.StatusOK, gin.H{
		"status":    "ok",
		"timestamp": time.Now().Unix(),
		"database":  s.config.DBType,
		"version":   "1.0.0",
	})
}

// handleRoot handles root endpoint requests
func (s *Server) handleRoot(c *gin.Context) {
	c.JSON(http.StatusOK, gin.H{
		"message": "E-Commerce API",
		"version": "1.0.0",
		"endpoints": map[string]string{
			"health":     "GET /health",
			"categories": "GET /api/categories",
			"products":   "GET /api/products",
			"orders":     "POST /api/orders, GET /api/orders/:id, DELETE /api/orders/:id, PUT /api/orders/:id, PATCH /api/orders/:id, GET /api/orders",
			"settings":   "GET /api/settings/:key",
			"auth":       "POST /api/auth/signup, POST /api/auth/signin",
		},
		"documentation": "https://github.com/imrany/ecommerce",
	})
}

// Start starts the HTTP server
func (s *Server) Start() error {
	addr := fmt.Sprintf("%s:%d", s.config.Server.Host, s.config.Server.Port)
	return s.router.Run(addr)
}
