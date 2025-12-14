package main

import (
	"database/sql"
	"fmt"
	"log"
	"os"

	"github.com/imrany/ecommerce/internal/migrator"
	"github.com/joho/godotenv"
	_ "github.com/lib/pq"
	"github.com/spf13/pflag"
	"github.com/spf13/viper"
	_ "modernc.org/sqlite"
)

func main() {
	// Load .env if present
	if err := godotenv.Load(); err != nil {
		log.Println("No .env file found, using environment variables")
	}

	// Command-line flags
	pflag.String("cmd", "status", "Migration command: up, down, status, reset")
	pflag.Int("target", 0, "Migration target version: 1, 2, 3, etc.")
	pflag.String("db-type", "", "Database type (postgres or sqlite)")
	pflag.String("db-dsn", "", "Database connection string")

	pflag.Parse()

	// Set up viper to read from environment
	viper.AutomaticEnv()

	// Set up viper to read from flags
	viper.BindPFlag("cmd", pflag.Lookup("cmd"))
	viper.BindPFlag("target", pflag.Lookup("target"))
	viper.BindPFlag("db-type", pflag.Lookup("db-type"))
	viper.BindPFlag("db-dsn", pflag.Lookup("db-dsn"))

	// Set environment variable mapping explicitly for better control
	viper.BindEnv("db-type", "DB_TYPE")
	viper.BindEnv("db-dsn", "DATABASE_URL")

	// Viper now manages the values, prioritize (flags > env > defaults)
	command := viper.GetString("cmd")
	target := viper.GetInt("target")
	dbType := viper.GetString("db-type")
	connStr := viper.GetString("db-dsn")

	// Validate database type
	if dbType != "postgres" && dbType != "sqlite" && dbType != "sqlite3" {
		log.Fatalf("Invalid database type: %s (must be 'postgres', 'sqlite', or 'sqlite3')", dbType)
	}

	// Validate connection string
	if connStr == "" {
		log.Fatal("Connection string is required")
	}

	// Connect to database
	db, err := sql.Open(dbType, connStr)
	if err != nil {
		log.Fatalf("Failed to connect to database: %v", err)
	}
	defer db.Close()

	if err := db.Ping(); err != nil {
		log.Fatalf("Failed to ping database: %v", err)
	}

	log.Printf("Connected to %s database", dbType)

	// Create migrator
	m, err := migrator.New(db, dbType)
	if err != nil {
		log.Fatalf("Failed to create migrator: %v", err)
	}

	// Execute command
	switch command {
	case "up":
		if target != 0 {
			if err := m.Up(&target); err != nil {
				log.Fatalf("Migration failed: %v", err)
			}
		} else {
			if err := m.Up(nil); err != nil {
				log.Fatalf("Migration failed: %v", err)
			}
		}
	case "down":
		if err := m.Down(); err != nil {
			log.Fatalf("Rollback failed: %v", err)
		}
	case "status":
		if err := m.Status(); err != nil {
			log.Fatalf("Failed to get status: %v", err)
		}
	case "reset":
		fmt.Print("Are you sure you want to reset all migrations? (yes/no): ")
		var confirm string
		fmt.Scanln(&confirm)
		if confirm != "yes" && confirm != "y" {
			log.Println("Reset cancelled")
			os.Exit(0)
		}
		if err := m.Reset(); err != nil {
			log.Fatalf("Reset failed: %v", err)
		}
	default:
		log.Fatalf("Unknown command: %s (use: up, down, status, reset)", command)
	}
}
