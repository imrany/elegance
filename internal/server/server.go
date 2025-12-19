package server

import (
	"embed"
	"fmt"
	"io/fs"
	"log"
	"net/http"
	"path/filepath"
	"strings"
	"time"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	"github.com/imrany/elegance/internal/database"
	"github.com/imrany/elegance/internal/handlers"
	"github.com/imrany/elegance/internal/middleware"
)

//go:embed dist/*
var dist embed.FS

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
	// static assets
	s.router.Static("/uploads", "./uploads")

	// API v1 routes
	api := s.router.Group("/api")
	{
		api.GET("", s.handleRoot)

		// Health check
		api.GET("/health", s.handleHealth)

		// website builder endpoints (public)
		websiteBuilder := api.Group("/website-builder")
		{
			websiteBuilder.GET("", s.handler.GetAllWebsiteConfig)
			websiteBuilder.GET("/:key", s.handler.GetWebsiteConfig)
		}

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

		// Protected routes (require authentication)
		authenticated := api.Group("")
		authenticated.Use(middleware.AuthMiddleware(s.config.JWTSecret))
		{
			authenticated.GET("/auth/me", authHandler.GetMe)
			authenticated.PUT("/auth/me", authHandler.UpdateUserAccount)
			authenticated.PUT("/auth/me/password", authHandler.ChangeUserPassword)

			// Orders
			authenticated.POST("/orders", s.handler.CreateOrder)
			// /api/orders?key=user_id&&value=123
			authenticated.GET("/orders", s.handler.GetOrdersByOption)
			authenticated.DELETE("/orders/:id", s.handler.DeleteOrder)
			authenticated.PUT("/orders/:id", s.handler.UpdateOrder)
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

			// Category management
			admin.POST("/categories", adminHandler.CreateCategory)
			admin.PUT("/categories/:slug", adminHandler.UpdateCategory)
			admin.DELETE("/categories/:unique_value", adminHandler.DeleteCategory)

			// Orders management
			admin.GET("/orders", adminHandler.GetAllOrders)
			admin.PUT("/orders/:id/status", adminHandler.UpdateOrderStatus)

			// Products management
			admin.GET("/products", adminHandler.GetAllProducts)
			admin.POST("/products", adminHandler.CreateProduct)
			admin.PUT("/products/:id", adminHandler.UpdateProduct)
			admin.DELETE("/products/:id", adminHandler.DeleteProduct)
			admin.GET("/users/:userId/orders", adminHandler.GetUserOrders)
			admin.PUT("/users/password", adminHandler.UpdateUserPassword)
			admin.PUT("/users", adminHandler.UpdateUser)

			// Website builder management (admin endpoints)
			admin.PUT("/website-builder/:key", adminHandler.UpdateWebsiteSetting)

			// Images management
			admin.POST("/upload/image", adminHandler.UploadImage)
			admin.DELETE("/images/:filename", adminHandler.DeleteImage)
		}
	}

	// Frontend SPA Routing - Serve embedded dist folder
	s.setupSPARouting()
}

// setupSPARouting configures the SPA routing for the embedded frontend
func (s *Server) setupSPARouting() {
	// Get the embedded dist filesystem
	distFS, err := fs.Sub(dist, "dist")
	if err != nil {
		log.Fatal("Failed to load embedded dist folder: ", err)
	}

	// Create file server for static assets
	fileServer := http.FileServer(http.FS(distFS))

	// Handle all remaining routes for SPA
	s.router.NoRoute(func(c *gin.Context) {
		path := c.Request.URL.Path

		// Check if the requested path is a static file (has an extension)
		if isStaticFile(path) {
			// Try to open the file from embedded FS
			_, err := distFS.Open(strings.TrimPrefix(path, "/"))
			if err == nil {
				// File exists, serve it
				c.Request.URL.Path = path
				fileServer.ServeHTTP(c.Writer, c.Request)
				return
			}
			// File doesn't exist, return 404
			c.Status(http.StatusNotFound)
			return
		}

		// Not a static file, serve index.html for client-side routing
		indexData, err := fs.ReadFile(distFS, "index.html")
		if err != nil {
			log.Printf("Failed to read index.html: %v", err)
			c.Status(http.StatusInternalServerError)
			return
		}

		c.Data(http.StatusOK, "text/html; charset=utf-8", indexData)
	})
}

// isStaticFile checks if the path looks like a static file
func isStaticFile(path string) bool {
	ext := filepath.Ext(path)
	staticExtensions := []string{
		".js", ".css", ".png", ".jpg", ".jpeg", ".gif", ".svg", ".ico",
		".woff", ".woff2", ".ttf", ".eot", ".json", ".xml", ".txt",
		".webp", ".mp4", ".webm", ".mp3", ".pdf", ".zip",
	}

	for _, staticExt := range staticExtensions {
		if strings.EqualFold(ext, staticExt) {
			return true
		}
	}
	return false
}

// handleHealth handles health check requests
func (s *Server) handleHealth(c *gin.Context) {
	c.JSON(http.StatusOK, gin.H{
		"status":    "ok",
		"timestamp": time.Now().Unix(),
		"database":  s.config.DBType,
		"version":   "0.2.0",
	})
}

// handleRoot handles root endpoint requests
func (s *Server) handleRoot(c *gin.Context) {
	c.JSON(http.StatusOK, gin.H{
		"message": "ELEGANCE API",
		"version": "1.0.0",
		"endpoints": map[string]string{
			"health":          "GET /api/health",
			"categories":      "GET /api/categories",
			"products":        "GET /api/products",
			"orders":          "POST /api/orders, GET /api/orders/:id, DELETE /api/orders/:id, PUT /api/orders/:id, PATCH /api/orders/:id, GET /api/orders",
			"settings":        "GET /api/settings/:key",
			"auth":            "POST /api/auth/signup, POST /api/auth/signin",
			"website-builder": "GET /api/website-builder, GET /api/website-builder/:key",
		},
		"documentation": "https://github.com/imrany/elegance",
	})
}

// Start starts the HTTP server
func (s *Server) Start() error {
	addr := fmt.Sprintf("%s:%d", s.config.Server.Host, s.config.Server.Port)
	log.Printf("Server starting on %s", addr)
	log.Printf("Health check: http://%s/api/health", addr)
	log.Printf("API endpoint: http://%s/api", addr)
	return s.router.Run(addr)
}
