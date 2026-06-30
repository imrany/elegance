package router

import (
	"embed"
	"encoding/json"
	"fmt"
	"io/fs"
	"log"
	"net/http"
	"path/filepath"
	"strings"
	"text/template"
	"time"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	"github.com/imrany/elegance/internal/database"
	"github.com/imrany/elegance/internal/handlers"
	"github.com/imrany/elegance/internal/middleware"
	"github.com/imrany/elegance/internal/models"
	"github.com/spf13/viper"
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

// SEOMetadata holds the metadata for SEO
type SEOMetadata struct {
	Title       string
	Description string
	Keywords    string
	OGImage     string
	Favicon     string
	Author      string
	URL         string
	Type        string
	TwitterCard string
	TwitterSite string
}

// Server represents the HTTP server
type Server struct {
	config    *Config
	router    *gin.Engine
	handler   *handlers.Handler
	db        database.DB
	indexTmpl *template.Template
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

	handler := handlers.New(db, cfg.JWTSecret)

	// Load and parse index.html from embedded dist
	indexContent, err := dist.ReadFile("dist/index.html")
	if err != nil {
		log.Fatalf("Critical: Could not read dist/index.html: %v", err)
	}

	// Create template (use Delims if your React code uses {{}})
	tmpl, err := template.New("index").Parse(string(indexContent))
	if err != nil {
		log.Fatalf("Critical: Failed to parse index template: %v", err)
	}

	srv := &Server{
		config:    cfg,
		router:    router,
		handler:   handler,
		db:        db,
		indexTmpl: tmpl,
	}

	srv.setupRoutes()
	return srv
}

// setupRoutes configures all API routes
func (s *Server) setupRoutes() {
	// Static assets
	s.router.Static("/uploads", viper.GetString("upload-dir"))

	// SEO routes
	s.router.GET("/sitemap.xml", s.serveSitemap)
	s.router.GET("/robots.txt", s.serveRobotsTxt)
	s.router.GET("/manifest.json", s.serveManifestJSON)

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

		// Pages endpoints (public)
		pages := api.Group("/pages")
		{
			pages.GET("", s.handler.GetPages)
			pages.GET("/:id", s.handler.GetPage)
		}

		// Auth endpoints (public)
		auth := api.Group("/auth")
		{
			auth.POST("/signup", s.handler.SignUp)
			auth.POST("/signin", s.handler.SignIn)
		}

		// Setup endpoints (public)
		setup := api.Group("/setup")
		{
			setup.GET("/status", s.handler.GetSetupStatus)
			setup.POST("/admin", s.handler.CreateInitialAdmin)
		}

		// Categories (public)
		categories := api.Group("/categories")
		{
			categories.GET("", s.handler.GetCategories)
			categories.GET("/:slug", s.handler.GetCategoryBySlug)
		}

		//email subscription
		email := api.Group("/email")
		{
			email.POST("/subscribe", s.handler.SubscribeEmail)
			email.GET("/subscriptions", s.handler.GetEmailSubscriptions)
			email.GET("/subscriptions/:email", s.handler.GetEmailSubscription)
			email.DELETE("/unsubscribe/:email", s.handler.UnsubscribeEmail)
			email.GET("/unsubscribe/:email", s.handler.UnsubscribeEmail)
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
			authenticated.GET("/auth/me", s.handler.GetMe)
			authenticated.PUT("/auth/me", s.handler.UpdateUserAccount)
			authenticated.PUT("/auth/me/password", s.handler.ChangeUserPassword)

			// Orders
			authenticated.POST("/orders", s.handler.CreateOrder)
			authenticated.GET("/orders", s.handler.GetOrdersByOption)
			authenticated.DELETE("/orders/:id", s.handler.DeleteOrder)
			authenticated.PUT("/orders/:id", s.handler.UpdateOrder)
		}

		// Admin routes (require admin role)
		admin := api.Group("/admin")
		admin.Use(middleware.AuthMiddleware(s.config.JWTSecret), middleware.AdminOnly())
		{

			// User management
			admin.GET("/users", s.handler.GetAllUsers)
			admin.PUT("/users/:id/role", s.handler.UpdateUserRole)
			admin.DELETE("/users/:id", s.handler.DeleteUser)

			// Category management
			admin.POST("/categories", s.handler.CreateCategory)
			admin.PUT("/categories/:slug", s.handler.UpdateCategory)
			admin.DELETE("/categories/:unique_value", s.handler.DeleteCategory)

			// Orders management
			admin.GET("/orders", s.handler.GetAllOrders)
			admin.PUT("/orders/:id/status", s.handler.UpdateOrderStatus)

			// Products management
			admin.GET("/products", s.handler.GetAllProducts)
			admin.POST("/products", s.handler.CreateProduct)
			admin.PUT("/products/:id", s.handler.UpdateProduct)
			admin.DELETE("/products/:id", s.handler.DeleteProduct)
			admin.GET("/users/:userId/orders", s.handler.GetUserOrders)
			admin.PUT("/users/password", s.handler.UpdateUserPassword)
			admin.PUT("/users", s.handler.UpdateUser)

			// Website builder management
			admin.PUT("/website-builder/:key", s.handler.UpdateWebsiteSetting)

			// Images management
			admin.POST("/upload/image", s.handler.UploadImage)
			admin.DELETE("/images/:filename", s.handler.DeleteImage)

			// Pages management
			admin.POST("/pages", s.handler.CreatePage)
			admin.PUT("/pages/:id", s.handler.UpdatePage)
			admin.DELETE("/pages/:id", s.handler.DeletePage)
			admin.POST("/pages/:id/publish", s.handler.PublishPage)
			admin.POST("/pages/:id/unpublish", s.handler.UnpublishPage)
			admin.POST("/pages/:id/duplicate", s.handler.DuplicatePage)
			admin.POST("/pages/:id/reorder-sections", s.handler.ReorderPageSections)

			// SMTP management
			admin.POST("/smtp/compose", s.handler.ComposeEmail)
			admin.GET("/smtp/test", s.handler.TestSmtpConnection)
		}
	}

	// Frontend SPA Routing - Serve embedded dist folder
	s.setupSPARouting()
}

// serveStaticIndex serves the static index.html with SEO
func (s *Server) serveStaticIndex(c *gin.Context) {
	// 1. Fetch Global Configs
	var seo models.SEOConfig
	var store models.StoreConfig

	if val, err := s.db.GetWebsiteSettingByKey("seo"); err == nil {
		json.Unmarshal([]byte(val.Value), &seo)
	}
	if val, err := s.db.GetWebsiteSettingByKey("store"); err == nil {
		json.Unmarshal([]byte(val.Value), &store)
	}

	// 2. Setup Default Metadata
	scheme := "https"
	if c.Request.TLS == nil {
		scheme = "http"
	}
	baseURL := scheme + "://" + c.Request.Host

	metadata := SEOMetadata{
		Title:       seo.Title,
		Description: seo.Description,
		Keywords:    seo.Keywords,
		OGImage:     baseURL + seo.OGImage,
		Favicon:     seo.Favicon,
		Author:      store.Name,
		URL:         baseURL + c.Request.URL.Path,
		Type:        "website",
	}

	// 3. Dynamic Product/Page Logic
	path := c.Request.URL.Path
	if strings.HasPrefix(path, "/products/") {
		slug := strings.TrimPrefix(path, "/products/")
		if product, err := s.db.GetProductBySlug(slug); err == nil {
			metadata.Title = product.Name + " | " + store.Name
			if product.Description != nil {
				metadata.Description = *product.Description
			}
			if len(product.Images) > 0 {
				metadata.OGImage = product.Images[0]
			}
		}
	} else if path != "/" && !strings.HasPrefix(path, "/admin") {
		// Handle custom CMS pages
		slug := strings.TrimPrefix(path, "/")
		if page, err := s.db.GetPage(slug); err == nil {
			metadata.Title = page.MetaTitle
			metadata.Description = page.MetaDescription
			if page.OGImage != "" {
				metadata.OGImage = page.OGImage
			}
		}
	}

	// 4. Set Headers and Execute Template
	c.Header("Content-Type", "text/html; charset=utf-8")
	err := s.indexTmpl.Execute(c.Writer, metadata)
	if err != nil {
		log.Printf("Template execution error: %v", err)
		c.Status(http.StatusInternalServerError)
	}
}

// ServeSitemap generates and serves sitemap.xml
func (s *Server) serveSitemap(c *gin.Context) {
	scheme := "https"
	if c.Request.TLS == nil {
		scheme = "http"
	}
	baseURL := scheme + "://" + c.Request.Host

	// Start sitemap XML
	xml := `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
	<url>
		<loc>` + baseURL + `/</loc>
		<changefreq>daily</changefreq>
		<priority>1.0</priority>
	</url>`

	// Add product pages
	products, err := s.db.GetProducts(models.ProductFilters{})
	if err == nil {
		for _, product := range products {
			xml += `
	<url>
		<loc>` + baseURL + `/product/` + product.Slug + `</loc>
		<changefreq>weekly</changefreq>
		<priority>0.8</priority>
	</url>`
		}
	}

	// Add category pages
	categories, err := s.db.GetCategories()
	if err == nil {
		for _, category := range categories {
			xml += `
	<url>
		<loc>` + baseURL + `/category/` + category.Slug + `</loc>
		<changefreq>weekly</changefreq>
		<priority>0.7</priority>
	</url>`
		}
	}

	xml += `
</urlset>`

	c.Header("Content-Type", "application/xml; charset=utf-8")
	c.String(http.StatusOK, xml)
}

// serveRobotsTxt serves robots.txt
func (s *Server) serveRobotsTxt(c *gin.Context) {
	scheme := "https"
	if c.Request.TLS == nil {
		scheme = "http"
	}
	baseURL := scheme + "://" + c.Request.Host

	robots := `User-agent: *
Allow: /
Disallow: /admin/
Disallow: /api/
Disallow: /auth/

Sitemap: ` + baseURL + `/sitemap.xml`

	c.Header("Content-Type", "text/plain; charset=utf-8")
	c.String(http.StatusOK, robots)
}

// serveManifest serves manifest.json
func (s *Server) serveManifestJSON(c *gin.Context) {
	settings, err := s.db.GetWebsiteSettingByKey("store")
	if err != nil {
		log.Printf(err.Error())
		return
	}

	//parse settings.Value string into SmtpConfig
	store := models.StoreConfig{}
	if err := json.Unmarshal([]byte(settings.Value), &store); err != nil {
		log.Printf("Failed to parse store value %s", err.Error())
		return
	}

	manifest := `
{
  "short_name": ` + store.Name + `,
  "name": ` + store.Name + `,
  "description": ` + store.Description + `,
  "start_url": "/",
  "id": "/",
  "background_color": "#FFFF",
  "theme_color": "#FFFF",
  "orientation": "portrait-primary",
  "display": "standalone"
}`
	c.Header("Content-Type", "application/json")
	c.String(http.StatusOK, manifest)
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

		// For all other routes (SPA routes), serve index.html with dynamic SEO
		s.serveStaticIndex(c)
	})
}

// isStaticFile checks if the path looks like a static file
func isStaticFile(path string) bool {
	ext := filepath.Ext(path)
	staticExtensions := []string{
		".js", ".css", ".png", ".jpg", ".jpeg", ".gif", ".svg", ".ico",
		".woff", ".woff2", ".ttf", ".eot", ".json", ".xml", ".txt",
		".webp", ".mp4", ".webm", ".mp3", ".pdf", ".zip", ".map",
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
		"version":   "0.3.0",
	})
}

// handleRoot handles root endpoint requests
func (s *Server) handleRoot(c *gin.Context) {
	c.JSON(http.StatusOK, gin.H{
		"message": "ELEGANCE API",
		"version": "0.3.2",
		"endpoints": map[string]string{
			"health":          "GET /api/health",
			"categories":      "GET /api/categories",
			"products":        "GET /api/products",
			"orders":          "POST /api/orders, GET /api/orders/:id, DELETE /api/orders/:id, PUT /api/orders/:id, GET /api/orders",
			"settings":        "GET /api/settings/:key",
			"auth":            "POST /api/auth/signup, POST /api/auth/signin",
			"website-builder": "GET /api/website-builder, GET /api/website-builder/:key",
			"sitemap":         "GET /sitemap.xml",
			"robots":          "GET /robots.txt",
		},
		"documentation": "https://github.com/imrany/elegance",
	})
}

// Start starts the HTTP server
func (s *Server) Start() error {
	addr := fmt.Sprintf("%s:%d", s.config.Server.Host, s.config.Server.Port)
	log.Printf("🚀 Server starting on %s", addr)
	log.Printf("📊 Health check: http://%s/api/health", addr)
	log.Printf("🔌 API endpoint: http://%s/api", addr)
	log.Printf("🗺️  Sitemap: http://%s/sitemap.xml", addr)
	log.Printf("🤖 Robots: http://%s/robots.txt", addr)
	return s.router.Run(addr)
}
