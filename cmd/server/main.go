package main

import (
	"database/sql"
	"fmt"
	"log"
	"os"
	"os/signal"
	"syscall"

	"github.com/imrany/ecommerce/internal/database"
	"github.com/imrany/ecommerce/internal/migrator"
	"github.com/imrany/ecommerce/internal/server"
	"github.com/joho/godotenv"
	"github.com/spf13/cobra"
	"github.com/spf13/viper"
)

// openDatabase opens a raw sql.DB connection for migrations
func openDatabase(dbType, dsn string) (*sql.DB, error) {
	db, err := sql.Open(dbType, dsn)
	if err != nil {
		return nil, fmt.Errorf("failed to open database: %w", err)
	}

	if err := db.Ping(); err != nil {
		return nil, fmt.Errorf("failed to ping database: %w", err)
	}

	return db, nil
}

func runServer() {
	cfg := &server.Config{
		Server: server.ServerConfig{
			Port: viper.GetInt("port"),
			Host: viper.GetString("host"),
		},
		JWTSecret: viper.GetString("jwt-secret"),
	}

	DBType := viper.GetString("db-type")
	DBDSN := viper.GetString("db-dsn")

	// Validate configuration
	if DBType == "" {
		log.Fatal("Database type (db-type) is required")
	}
	if DBDSN == "" {
		log.Fatal("Database DSN (db-dsn) is required")
	}

	log.Println("Connecting to database...")

	// Initialize database connection for migrations
	sqlDB, err := openDatabase(DBType, DBDSN)
	if err != nil {
		log.Fatalf("Failed to connect to database: %v", err)
	}

	// Run migrations automatically
	log.Println("Running database migrations...")
	m, err := migrator.New(sqlDB, DBType)
	if err != nil {
		sqlDB.Close()
		log.Fatalf("Failed to create migrator: %v", err)
	}

	if err := m.Up(nil); err != nil {
		sqlDB.Close()
		log.Fatalf("Failed to run migrations: %v", err)
	}
	log.Println("Migrations completed successfully")

	// Close the sql.DB connection used for migrations
	sqlDB.Close()

	// Now initialize the application database layer
	log.Println("Initializing application database layer...")
	db, err := database.New(DBType, DBDSN)
	if err != nil {
		log.Fatalf("Failed to initialize database: %v", err)
	}
	defer db.Close()

	log.Printf("Connected to %s database successfully", DBType)

	// Create and start server
	srv := server.New(cfg, db)

	// Graceful shutdown
	quit := make(chan os.Signal, 1)
	signal.Notify(quit, syscall.SIGINT, syscall.SIGTERM)

	go func() {
		<-quit
		log.Println("🛑 Shutting down server...")
		db.Close()
		os.Exit(0)
	}()

	// Start server
	log.Printf("🚀 Server starting on %s:%d", cfg.Server.Host, cfg.Server.Port)
	if err := srv.Start(); err != nil {
		log.Fatalf("Failed to start server: %v", err)
	}
}

func main() {
	// Load .env if present
	if err := godotenv.Load(); err != nil {
		log.Println("⚠️  No .env file found, using environment variables and flags")
	} else {
		log.Println(".env file loaded successfully")
	}

	// Root command with Cobra
	rootCmd := &cobra.Command{
		Use:   "ecommerce",
		Short: "E-commerce backend server with automatic migrations",
		Long: `E-commerce backend API server with automatic database migrations.
Supports PostgreSQL and SQLite databases.`,
		Run: func(cmd *cobra.Command, args []string) {
			runServer()
		},
	}

	// Environment variable to flag bindings
	envBindings := map[string]string{
		"DB_TYPE":      "db-type",
		"DATABASE_URL": "db-dsn",
		"PORT":         "port",
		"HOST":         "host",
		"JWT_SECRET":   "jwt-secret",
		"UPLOAD_DIR":   "upload-dir",
	}

	// Define flags
	rootCmd.PersistentFlags().Int("port", 8000, "Port to listen on (e.g., 8000)")
	rootCmd.PersistentFlags().String("host", "localhost", "Host to listen on (e.g., localhost, 0.0.0.0)")
	rootCmd.PersistentFlags().String("jwt-secret", "secret", "JWT secret key for authentication")
	rootCmd.PersistentFlags().String("db-type", "sqlite3", "Database type (sqlite3 or postgres)")
	rootCmd.PersistentFlags().String("db-dsn", "./ecommerce.db", "Database DSN/connection string")
	rootCmd.PersistentFlags().String("upload-dir", "./uploads", "Upload directory")

	// Bind flags to viper and environment variables
	for envKey, flagKey := range envBindings {
		// Bind the flag to Viper
		if err := viper.BindPFlag(flagKey, rootCmd.PersistentFlags().Lookup(flagKey)); err != nil {
			log.Fatalf("Failed to bind flag '%s': %v", flagKey, err)
		}
		// Bind environment variable to Viper
		if err := viper.BindEnv(flagKey, envKey); err != nil {
			log.Fatalf("Failed to bind env '%s': %v", envKey, err)
		}
	}

	// Enable automatic environment variable reading
	viper.AutomaticEnv()

	// Add migration status command
	statusCmd := &cobra.Command{
		Use:   "migrate-status",
		Short: "Show migration status",
		Run: func(cmd *cobra.Command, args []string) {
			dbType := viper.GetString("db-type")
			dbDSN := viper.GetString("db-dsn")

			if dbType == "" || dbDSN == "" {
				log.Fatal("Database type and DSN are required")
			}

			sqlDB, err := openDatabase(dbType, dbDSN)
			if err != nil {
				log.Fatalf("Failed to connect to database: %v", err)
			}
			defer sqlDB.Close()

			m, err := migrator.New(sqlDB, dbType)
			if err != nil {
				log.Fatalf("Failed to create migrator: %v", err)
			}

			if err := m.Status(); err != nil {
				log.Fatalf("Failed to get migration status: %v", err)
			}
		},
	}

	// Add migration rollback command
	rollbackCmd := &cobra.Command{
		Use:   "migrate-down",
		Short: "Rollback last migration",
		Run: func(cmd *cobra.Command, args []string) {
			dbType := viper.GetString("db-type")
			dbDSN := viper.GetString("db-dsn")

			if dbType == "" || dbDSN == "" {
				log.Fatal("Database type and DSN are required")
			}

			sqlDB, err := openDatabase(dbType, dbDSN)
			if err != nil {
				log.Fatalf("Failed to connect to database: %v", err)
			}
			defer sqlDB.Close()

			m, err := migrator.New(sqlDB, dbType)
			if err != nil {
				log.Fatalf("Failed to create migrator: %v", err)
			}

			log.Println("Rolling back last migration...")
			if err := m.Down(); err != nil {
				log.Fatalf("Failed to rollback migration: %v", err)
			}
			log.Println("✅ Rollback completed successfully")
		},
	}

	// Add migration reset command
	resetCmd := &cobra.Command{
		Use:   "migrate-reset",
		Short: "Reset all migrations (WARNING: destructive)",
		Run: func(cmd *cobra.Command, args []string) {
			dbType := viper.GetString("db-type")
			dbDSN := viper.GetString("db-dsn")

			if dbType == "" || dbDSN == "" {
				log.Fatal("Database type and DSN are required")
			}

			fmt.Print("⚠️  Are you sure you want to reset all migrations? This will delete all data! (yes/no): ")
			var confirm string
			fmt.Scanln(&confirm)
			if confirm != "yes" {
				log.Println("Reset cancelled")
				return
			}

			sqlDB, err := openDatabase(dbType, dbDSN)
			if err != nil {
				log.Fatalf("Failed to connect to database: %v", err)
			}
			defer sqlDB.Close()

			m, err := migrator.New(sqlDB, dbType)
			if err != nil {
				log.Fatalf("Failed to create migrator: %v", err)
			}

			log.Println("Resetting all migrations...")
			if err := m.Reset(); err != nil {
				log.Fatalf("Failed to reset migrations: %v", err)
			}
			log.Println("✅ Reset completed successfully")
		},
	}

	// Add subcommands
	rootCmd.AddCommand(statusCmd)
	rootCmd.AddCommand(rollbackCmd)
	rootCmd.AddCommand(resetCmd)

	// Execute command
	if err := rootCmd.Execute(); err != nil {
		log.Fatalf("Failed to execute command: %v", err)
	}
}
