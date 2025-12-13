package migrator

import (
	"database/sql"
	"embed"
	"fmt"
	"log"
	"sort"
	"strings"
	"time"
)

//go:embed migrations
var migrationsFS embed.FS

// Migration represents a database migration
type Migration struct {
	Version   int
	Name      string
	UpSQL     string
	DownSQL   string
	AppliedAt *time.Time
}

// Migrator handles database migrations
type Migrator struct {
	db         *sql.DB
	dbType     string
	migrations []Migration
}

// New creates a new migrator instance
func New(db *sql.DB, dbType string) (*Migrator, error) {
	m := &Migrator{
		db:     db,
		dbType: dbType,
	}

	// Create migrations table
	if err := m.createMigrationsTable(); err != nil {
		return nil, fmt.Errorf("failed to create migrations table: %w", err)
	}

	// Load migrations from embedded files
	if err := m.loadMigrations(); err != nil {
		return nil, fmt.Errorf("failed to load migrations: %w", err)
	}

	return m, nil
}

// createMigrationsTable creates the schema_migrations table
func (m *Migrator) createMigrationsTable() error {
	var query string

	if m.dbType == "postgres" {
		query = `
			CREATE TABLE IF NOT EXISTS schema_migrations (
				version INTEGER PRIMARY KEY,
				name TEXT NOT NULL,
				applied_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
			)
		`
	} else {
		query = `
			CREATE TABLE IF NOT EXISTS schema_migrations (
				version INTEGER PRIMARY KEY,
				name TEXT NOT NULL,
				applied_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
			)
		`
	}

	_, err := m.db.Exec(query)
	return err
}

// loadMigrations loads migrations from embedded filesystem
func (m *Migrator) loadMigrations() error {
	entries, err := migrationsFS.ReadDir("migrations")
	if err != nil {
		return fmt.Errorf("failed to read migrations directory: %w", err)
	}

	migrations := make(map[int]Migration)

	for _, entry := range entries {
		if entry.IsDir() {
			continue
		}

		filename := entry.Name()

		// Parse migration files (format: 001_create_tables_postgres.up.sql)
		version, name, direction, dbType, err := parseMigrationFilename(filename)
		if err != nil {
			log.Printf("Skipping invalid migration file: %s", filename)
			continue
		}

		// Only load migrations for current database type
		if dbType != m.dbType {
			continue
		}

		content, err := migrationsFS.ReadFile("migrations/" + filename)
		if err != nil {
			return fmt.Errorf("failed to read migration file %s: %w", filename, err)
		}

		migration := migrations[version]
		migration.Version = version
		migration.Name = name

		if direction == "up" {
			migration.UpSQL = string(content)
		} else {
			migration.DownSQL = string(content)
		}

		migrations[version] = migration
	}

	// Convert map to sorted slice
	for _, migration := range migrations {
		m.migrations = append(m.migrations, migration)
	}

	sort.Slice(m.migrations, func(i, j int) bool {
		return m.migrations[i].Version < m.migrations[j].Version
	})

	return nil
}

// parseMigrationFilename parses migration filename
// Format: 001_create_tables_postgres.up.sql
func parseMigrationFilename(filename string) (version int, name, direction, dbType string, err error) {
	// Remove .sql extension
	filename = strings.TrimSuffix(filename, ".sql")

	// Split by dots to get direction
	parts := strings.Split(filename, ".")
	if len(parts) != 2 {
		return 0, "", "", "", fmt.Errorf("invalid migration filename format")
	}

	direction = parts[1] // up or down

	// Split the first part by underscores
	nameParts := strings.Split(parts[0], "_")
	if len(nameParts) < 3 {
		return 0, "", "", "", fmt.Errorf("invalid migration filename format")
	}

	// Parse version
	_, err = fmt.Sscanf(nameParts[0], "%d", &version)
	if err != nil {
		return 0, "", "", "", fmt.Errorf("invalid version number: %w", err)
	}

	// Last part is database type
	dbType = nameParts[len(nameParts)-1]
	if dbType != "postgres" && dbType != "sqlite" {
		return 0, "", "", "", fmt.Errorf("invalid database type: %s", dbType)
	}

	// Middle parts form the name
	name = strings.Join(nameParts[1:len(nameParts)-1], "_")

	return version, name, direction, dbType, nil
}

// Up runs all pending migrations
func (m *Migrator) Up() error {
	appliedVersions, err := m.getAppliedVersions()
	if err != nil {
		return fmt.Errorf("failed to get applied versions: %w", err)
	}

	count := 0
	for _, migration := range m.migrations {
		if _, applied := appliedVersions[migration.Version]; applied {
			continue
		}

		if migration.UpSQL == "" {
			log.Printf("Warning: No UP migration found for version %d", migration.Version)
			continue
		}

		log.Printf("Applying migration %d: %s", migration.Version, migration.Name)

		if err := m.applyMigration(migration); err != nil {
			return fmt.Errorf("failed to apply migration %d: %w", migration.Version, err)
		}

		count++
	}

	if count == 0 {
		log.Println("No pending migrations")
	} else {
		log.Printf("Successfully applied %d migration(s)", count)
	}

	return nil
}

// Down rolls back the last migration
func (m *Migrator) Down() error {
	appliedVersions, err := m.getAppliedVersions()
	if err != nil {
		return fmt.Errorf("failed to get applied versions: %w", err)
	}

	if len(appliedVersions) == 0 {
		log.Println("No migrations to rollback")
		return nil
	}

	// Find highest applied version
	var lastVersion int
	for version := range appliedVersions {
		if version > lastVersion {
			lastVersion = version
		}
	}

	// Find the migration
	var migration *Migration
	for i := range m.migrations {
		if m.migrations[i].Version == lastVersion {
			migration = &m.migrations[i]
			break
		}
	}

	if migration == nil {
		return fmt.Errorf("migration %d not found", lastVersion)
	}

	if migration.DownSQL == "" {
		return fmt.Errorf("no DOWN migration found for version %d", lastVersion)
	}

	log.Printf("Rolling back migration %d: %s", migration.Version, migration.Name)

	if err := m.rollbackMigration(*migration); err != nil {
		return fmt.Errorf("failed to rollback migration %d: %w", migration.Version, err)
	}

	log.Printf("Successfully rolled back migration %d", migration.Version)
	return nil
}

// Status shows migration status
func (m *Migrator) Status() error {
	appliedVersions, err := m.getAppliedVersions()
	if err != nil {
		return fmt.Errorf("failed to get applied versions: %w", err)
	}

	fmt.Println("\nMigration Status:")
	fmt.Println("=================")
	fmt.Printf("Database: %s\n\n", m.dbType)

	if len(m.migrations) == 0 {
		fmt.Println("No migrations found")
		return nil
	}

	for _, migration := range m.migrations {
		status := "pending"
		appliedAt := ""

		if applied, ok := appliedVersions[migration.Version]; ok {
			status = "applied"
			if applied != nil {
				appliedAt = applied.Format("2006-01-02 15:04:05")
			}
		}

		fmt.Printf("[%s] %03d: %s", status, migration.Version, migration.Name)
		if appliedAt != "" {
			fmt.Printf(" (applied at: %s)", appliedAt)
		}
		fmt.Println()
	}

	pending := len(m.migrations) - len(appliedVersions)
	fmt.Printf("\nTotal: %d | Applied: %d | Pending: %d\n",
		len(m.migrations), len(appliedVersions), pending)

	return nil
}

// getAppliedVersions returns map of applied migration versions
func (m *Migrator) getAppliedVersions() (map[int]*time.Time, error) {
	rows, err := m.db.Query("SELECT version, applied_at FROM schema_migrations ORDER BY version")
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	versions := make(map[int]*time.Time)
	for rows.Next() {
		var version int
		var appliedAt time.Time
		if err := rows.Scan(&version, &appliedAt); err != nil {
			return nil, err
		}
		versions[version] = &appliedAt
	}

	return versions, rows.Err()
}

// applyMigration applies a single migration
func (m *Migrator) applyMigration(migration Migration) error {
	tx, err := m.db.Begin()
	if err != nil {
		return fmt.Errorf("failed to begin transaction: %w", err)
	}
	defer tx.Rollback()

	// Execute migration SQL
	if _, err := tx.Exec(migration.UpSQL); err != nil {
		return fmt.Errorf("failed to execute migration: %w", err)
	}

	// Record migration
	var query string
	if m.dbType == "postgres" {
		query = "INSERT INTO schema_migrations (version, name, applied_at) VALUES ($1, $2, NOW())"
	} else {
		query = "INSERT INTO schema_migrations (version, name, applied_at) VALUES (?, ?, datetime('now'))"
	}

	if _, err := tx.Exec(query, migration.Version, migration.Name); err != nil {
		return fmt.Errorf("failed to record migration: %w", err)
	}

	if err := tx.Commit(); err != nil {
		return fmt.Errorf("failed to commit transaction: %w", err)
	}

	return nil
}

// rollbackMigration rolls back a single migration
func (m *Migrator) rollbackMigration(migration Migration) error {
	tx, err := m.db.Begin()
	if err != nil {
		return fmt.Errorf("failed to begin transaction: %w", err)
	}
	defer tx.Rollback()

	// Execute rollback SQL
	if _, err := tx.Exec(migration.DownSQL); err != nil {
		return fmt.Errorf("failed to execute rollback: %w", err)
	}

	// Remove migration record
	var query string
	if m.dbType == "postgres" {
		query = "DELETE FROM schema_migrations WHERE version = $1"
	} else {
		query = "DELETE FROM schema_migrations WHERE version = ?"
	}

	if _, err := tx.Exec(query, migration.Version); err != nil {
		return fmt.Errorf("failed to remove migration record: %w", err)
	}

	if err := tx.Commit(); err != nil {
		return fmt.Errorf("failed to commit transaction: %w", err)
	}

	return nil
}

// Reset rolls back all migrations
func (m *Migrator) Reset() error {
	appliedVersions, err := m.getAppliedVersions()
	if err != nil {
		return fmt.Errorf("failed to get applied versions: %w", err)
	}

	if len(appliedVersions) == 0 {
		log.Println("No migrations to reset")
		return nil
	}

	// Rollback in reverse order
	for i := len(m.migrations) - 1; i >= 0; i-- {
		migration := m.migrations[i]

		if _, applied := appliedVersions[migration.Version]; !applied {
			continue
		}

		if migration.DownSQL == "" {
			log.Printf("Warning: No DOWN migration found for version %d, skipping", migration.Version)
			continue
		}

		log.Printf("Rolling back migration %d: %s", migration.Version, migration.Name)

		if err := m.rollbackMigration(migration); err != nil {
			return fmt.Errorf("failed to rollback migration %d: %w", migration.Version, err)
		}
	}

	log.Println("Successfully reset all migrations")
	return nil
}
