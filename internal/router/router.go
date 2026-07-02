package router

import (
	"encoding/json"
	"fmt"
	"io/fs"
	"log"
	"net/http"
	"path/filepath"
	"runtime/debug"
	"strings"
	"text/template"
	"time"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	"github.com/imrany/elegance"
	"github.com/imrany/elegance/internal/database"
	"github.com/imrany/elegance/internal/handlers"
	"github.com/imrany/elegance/internal/middleware"
	"github.com/imrany/elegance/internal/models"
	"github.com/spf13/viper"
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

type Server struct {
	config    *Config
	router    *gin.Engine
	handler   *handlers.Handler
	db        database.DB
	indexTmpl *template.Template
}

func New(cfg *Config, db database.DB) *Server {
	if cfg.Server.Host == "0.0.0.0" {
		gin.SetMode(gin.ReleaseMode)
	} else {
		gin.SetMode(gin.DebugMode)
	}

	router := gin.New()

	router.Use(gin.Logger())
	router.Use(gin.Recovery())

	router.Use(cors.New(cors.Config{
		AllowOrigins:     []string{"*"},
		AllowMethods:     []string{"GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"},
		AllowHeaders:     []string{"Origin", "Content-Type", "Authorization", "Accept"},
		ExposeHeaders:    []string{"Content-Length"},
		AllowCredentials: true,
		MaxAge:           12 * time.Hour,
	}))

	handler := handlers.New(db, cfg.JWTSecret)

	indexContent, err := elegance.DistFS.ReadFile("dist/index.html")
	if err != nil {
		log.Fatalf("Critical: Could not read dist/index.html: %v", err)
	}

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

func (s *Server) setupRoutes() {
	s.router.Static("/uploads", viper.GetString("upload-dir"))

	s.router.GET("/sitemap.xml", s.serveSitemap)
	s.router.GET("/robots.txt", s.serveRobotsTxt)
	s.router.GET("/manifest.json", s.serveManifestJSON)

	api := s.router.Group("/api")
	{
		api.GET("", s.handleRoot)
		api.GET("/health", s.handleHealth)

		websiteBuilder := api.Group("/website-builder")
		{
			websiteBuilder.GET("", s.handler.GetAllWebsiteConfig)
			websiteBuilder.GET("/:key", s.handler.GetWebsiteConfig)
		}

		pages := api.Group("/pages")
		{
			pages.GET("", s.handler.GetPages)
			pages.GET("/:id", s.handler.GetPage)
		}

		auth := api.Group("/auth")
		{
			auth.POST("/signup", s.handler.SignUp)
			auth.POST("/signin", s.handler.SignIn)
		}

		setup := api.Group("/setup")
		{
			setup.GET("/status", s.handler.GetSetupStatus)
			setup.POST("/admin", s.handler.CreateInitialAdmin)
		}

		categories := api.Group("/categories")
		{
			categories.GET("", s.handler.GetCategories)
			categories.GET("/:slug", s.handler.GetCategoryBySlug)
		}

		email := api.Group("/email")
		{
			email.POST("/subscribe", s.handler.SubscribeEmail)
			email.GET("/subscriptions/:email", s.handler.GetEmailSubscription)
			email.DELETE("/unsubscribe/:email", s.handler.UnsubscribeEmail)
			email.GET("/unsubscribe/:email", s.handler.UnsubscribeEmail)
		}

		products := api.Group("/products")
		{
			products.GET("", s.handler.GetProducts)
			products.GET("/featured", s.handler.GetFeaturedProducts)
			products.GET("/new", s.handler.GetNewProducts)
			products.GET("/:slug", s.handler.GetProductBySlug)
		}

		// Webpush configuration
		webpush := api.Group("/webpush")
		{
			webpush.POST("/subscribe", s.handler.SubscribeToPushNotification)
			// FIXED: Changed from :endpoint to *endpoint to support encoded slashes
			webpush.GET("/unsubscribe/*endpoint", s.handler.UnsubscribeToPushNotification)
			webpush.GET("/verify/*endpoint", s.handler.VerifySubscription)
		}

		authenticated := api.Group("")
		authenticated.Use(middleware.AuthMiddleware(s.config.JWTSecret))
		{
			authenticated.GET("/auth/me", s.handler.GetMe)
			authenticated.PUT("/auth/me", s.handler.UpdateUserAccount)
			authenticated.PUT("/auth/me/password", s.handler.ChangeUserPassword)

			authenticated.POST("/orders", s.handler.CreateOrder)
			authenticated.GET("/orders", s.handler.GetOrdersByOption)
			authenticated.DELETE("/orders/:id", s.handler.DeleteOrder)
			authenticated.PUT("/orders/:id", s.handler.UpdateOrder)
		}

		admin := api.Group("/admin")
		admin.Use(middleware.AuthMiddleware(s.config.JWTSecret), middleware.AdminOnly())
		{
			emailAdmin := admin.Group("/email")
			{
				emailAdmin.GET("/subscriptions", s.handler.GetEmailSubscriptions)
			}

			smtp := admin.Group("/smtp")
			{
				smtp.GET("/test", s.handler.TestSmtpConnection)
				smtp.POST("/compose", s.handler.ComposeEmail)
			}

			webpushAdmin := admin.Group("/webpush")
			{
				webpushAdmin.POST("/send", s.handler.SendPushNotification)
				// FIXED: Changed from :endpoint to *endpoint to support encoded slashes
				webpushAdmin.GET("/subscriptions/*endpoint", s.handler.GetSubscription)
			}

			admin.GET("/users", s.handler.GetAllUsers)
			admin.PUT("/users/:id/role", s.handler.UpdateUserRole)
			admin.DELETE("/users/:id", s.handler.DeleteUser)

			admin.POST("/categories", s.handler.CreateCategory)
			admin.PUT("/categories/:slug", s.handler.UpdateCategory)
			admin.DELETE("/categories/:unique_value", s.handler.DeleteCategory)

			admin.GET("/orders", s.handler.GetAllOrders)
			admin.PUT("/orders/:id/status", s.handler.UpdateOrderStatus)

			admin.GET("/products", s.handler.GetAllProducts)
			admin.POST("/products", s.handler.CreateProduct)
			admin.PUT("/products/:id", s.handler.UpdateProduct)
			admin.DELETE("/products/:id", s.handler.DeleteProduct)
			admin.GET("/users/:userId/orders", s.handler.GetUserOrders)
			admin.PUT("/users/password", s.handler.UpdateUserPassword)
			admin.PUT("/users", s.handler.UpdateUser)

			admin.PUT("/website-builder/:key", s.handler.UpdateWebsiteSetting)

			admin.POST("/upload/image", s.handler.UploadImage)
			admin.DELETE("/images/:filename", s.handler.DeleteImage)

			admin.POST("/pages", s.handler.CreatePage)
			admin.PUT("/pages/:id", s.handler.UpdatePage)
			admin.DELETE("/pages/:id", s.handler.DeletePage)
			admin.POST("/pages/:id/publish", s.handler.PublishPage)
			admin.POST("/pages/:id/unpublish", s.handler.UnpublishPage)
			admin.POST("/pages/:id/duplicate", s.handler.DuplicatePage)
			admin.POST("/pages/:id/reorder-sections", s.handler.ReorderPageSections)
		}
	}

	s.setupSPARouting()
}

func (s *Server) serveStaticIndex(c *gin.Context) {
	var seo models.SEOConfig
	var store models.StoreConfig

	if val, err := s.db.GetWebsiteSettingByKey("seo"); err == nil {
		json.Unmarshal([]byte(val.Value), &seo)
	}
	if val, err := s.db.GetWebsiteSettingByKey("store"); err == nil {
		json.Unmarshal([]byte(val.Value), &store)
	}

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
		slug := strings.TrimPrefix(path, "/")
		if page, err := s.db.GetPage(slug); err == nil {
			metadata.Title = page.MetaTitle
			metadata.Description = page.MetaDescription
			if page.OGImage != "" {
				metadata.OGImage = page.OGImage
			}
		}
	}

	c.Header("Content-Type", "text/html; charset=utf-8")
	err := s.indexTmpl.Execute(c.Writer, metadata)
	if err != nil {
		log.Printf("Template execution error: %v", err)
		c.Status(http.StatusInternalServerError)
	}
}

func (s *Server) serveSitemap(c *gin.Context) {
	scheme := "https"
	if c.Request.TLS == nil {
		scheme = "http"
	}
	baseURL := scheme + "://" + c.Request.Host

	xml := `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
	<url>
		<loc>` + baseURL + `/</loc>
		<changefreq>daily</changefreq>
		<priority>1.0</priority>
	</url>`

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

func (s *Server) serveManifestJSON(c *gin.Context) {
	settings, err := s.db.GetWebsiteSettingByKey("store")
	if err != nil {
		log.Printf(err.Error())
		return
	}

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

func (s *Server) setupSPARouting() {
	distFS, err := fs.Sub(elegance.DistFS, "dist")
	if err != nil {
		log.Fatal("Failed to load embedded dist folder: ", err)
	}

	fileServer := http.FileServer(http.FS(distFS))

	s.router.NoRoute(func(c *gin.Context) {
		path := c.Request.URL.Path

		if isStaticFile(path) {
			_, err := distFS.Open(strings.TrimPrefix(path, "/"))
			if err == nil {
				c.Request.URL.Path = path
				fileServer.ServeHTTP(c.Writer, c.Request)
				return
			}
			c.Status(http.StatusNotFound)
			return
		}

		s.serveStaticIndex(c)
	})
}

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

func getVersion() string {
	info, ok := debug.ReadBuildInfo()
	if !ok {
		return "unknown"
	}

	if info.Main.Version != "(devel)" {
		return info.Main.Version
	}

	for _, setting := range info.Settings {
		if setting.Key == "vcs.revision" {
			return setting.Value
		}
	}

	return "dev"
}

func (s *Server) handleHealth(c *gin.Context) {
	c.JSON(http.StatusOK, gin.H{
		"status":    "ok",
		"timestamp": time.Now().Unix(),
		"database":  s.config.DBType,
		"version":   getVersion(),
	})
}

func (s *Server) handleRoot(c *gin.Context) {
	c.JSON(http.StatusOK, gin.H{
		"message": "ELEGANCE API",
		"version": getVersion(),
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

func (s *Server) Start() error {
	addr := fmt.Sprintf("%s:%d", s.config.Server.Host, s.config.Server.Port)
	log.Printf("🚀 Server starting on %s", addr)
	log.Printf(" Version: %s", getVersion())
	log.Printf(" Health check: http://%s/api/health", addr)
	log.Printf(" API endpoint: http://%s/api", addr)
	log.Printf(" Sitemap: http://%s/sitemap.xml", addr)
	log.Printf(" Robots: http://%s/robots.txt", addr)
	log.Printf(" Manifest: http://%s/manifest.json", addr)
	return s.router.Run(addr)
}
