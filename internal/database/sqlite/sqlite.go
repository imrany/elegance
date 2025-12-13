package sqlite

import (
	"database/sql"
	"fmt"

	_ "modernc.org/sqlite"
)

type SQLiteDB struct {
	db *sql.DB
}

// NewSQLiteDB creates a new SQLite database connection
func NewSQLiteDB(dsn string) (*SQLiteDB, error) {
	db, err := sql.Open("sqlite", dsn)
	if err != nil {
		return nil, fmt.Errorf("failed to open database: %w", err)
	}

	if err := db.Ping(); err != nil {
		return nil, fmt.Errorf("failed to ping database: %w", err)
	}

	// Enable foreign keys for SQLite
	if _, err := db.Exec("PRAGMA foreign_keys = ON"); err != nil {
		return nil, fmt.Errorf("failed to enable foreign keys: %w", err)
	}

	// Configure connection pool (SQLite works best with single connection)
	db.SetMaxOpenConns(1)
	db.SetMaxIdleConns(1)

	return &SQLiteDB{db: db}, nil
}

func (sq *SQLiteDB) Close() error {
	return sq.db.Close()
}
