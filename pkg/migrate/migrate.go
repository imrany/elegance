package migrate

import (
	"database/sql"
	"embed"
	"fmt"
	"log"
	"sort"
	"strings"
	"time"
)

// Migration represents a database migration
type Migration struct {
	Version   int
	Name      string
	UpSQL     string
	DownSQL   string
	AppliedAt *time.Time
}

// Migrate handles database migrations
type Migrate struct {
	db           *sql.DB
	dbType       string
	migrationsFS embed.FS // Pass it dynamically here
	migrations   []Migration
}

// Accept the FS as a parameter in New
func New(db *sql.DB, dbType string, fs embed.FS) (*Migrate, error) {
	m := &Migrate{
		db:           db,
		dbType:       dbType,
		migrationsFS: fs,
	}

	if err := m.createMigrationsTable(); err != nil {
		return nil, err
	}

	if err := m.loadMigrations(); err != nil {
		return nil, err
	}

	return m, nil
}

// createMigrationsTable creates the schema_migrations table
func (m *Migrate) createMigrationsTable() error {
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

// loadMigrations loads migrations from embedded filesystem targeting the specific dbType directory
func (m *Migrate) loadMigrations() error {
	// Because the root embedded it, the path remains "migrations/postgres" or "migrations/sqlite"
	dirPath := fmt.Sprintf("migrations/%s", m.dbType)
	entries, err := m.migrationsFS.ReadDir(dirPath)
	if err != nil {
		return fmt.Errorf("failed to read migrations directory %s: %w", dirPath, err)
	}

	migrations := make(map[int]Migration)
	for _, entry := range entries {
		if entry.IsDir() {
			continue
		}

		filename := entry.Name()
		version, name, direction, err := parseMigrationFilename(filename)
		if err != nil {
			log.Printf("Skipping invalid migration file %s: %v", filename, err)
			continue
		}

		filePath := fmt.Sprintf("%s/%s", dirPath, filename)
		content, err := m.migrationsFS.ReadFile(filePath)
		if err != nil {
			return fmt.Errorf("failed to read migration file %s: %w", filePath, err)
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

	for _, migration := range migrations {
		m.migrations = append(m.migrations, migration)
	}

	sort.Slice(m.migrations, func(i, j int) bool {
		return m.migrations[i].Version < m.migrations[j].Version
	})

	return nil
}

// parseMigrationFilename parses migration filename
// Format: 001_create_tables.up.sql
func parseMigrationFilename(filename string) (version int, name, direction string, err error) {
	// Remove .sql extension
	if !strings.HasSuffix(filename, ".sql") {
		return 0, "", "", fmt.Errorf("not a SQL file")
	}
	filename = strings.TrimSuffix(filename, ".sql")

	// Split by dots to get direction (.up or .down)
	parts := strings.Split(filename, ".")
	if len(parts) != 2 {
		return 0, "", "", fmt.Errorf("invalid migration filename format (expected version_name.direction.sql)")
	}

	direction = parts[1] // up or down
	if direction != "up" && direction != "down" {
		return 0, "", "", fmt.Errorf("invalid direction: %s", direction)
	}

	// Split the first part by underscores
	nameParts := strings.Split(parts[0], "_")
	if len(nameParts) < 2 {
		return 0, "", "", fmt.Errorf("invalid migration prefix format (expected version_name)")
	}

	// Parse version
	_, err = fmt.Sscanf(nameParts[0], "%d", &version)
	if err != nil {
		return 0, "", "", fmt.Errorf("invalid version number: %w", err)
	}

	// Middle parts form the name (no longer ending with _postgres or _sqlite)
	name = strings.Join(nameParts[1:], "_")

	return version, name, direction, nil
}

// Up runs all pending migrations or a specific one
func (m *Migrate) Up(target *int) error {
	appliedVersions, err := m.getAppliedVersions()
	if err != nil {
		return fmt.Errorf("failed to get applied versions: %w", err)
	}

	if target != nil {
		var targetMigration *Migration
		for i := range m.migrations {
			if m.migrations[i].Version == *target {
				targetMigration = &m.migrations[i]
				break
			}
		}

		if targetMigration == nil {
			return fmt.Errorf("migration %d not found in available migrations", *target)
		}

		if _, isApplied := appliedVersions[*target]; isApplied {
			if targetMigration.DownSQL == "" {
				return fmt.Errorf("no DOWN migration found for version %d, cannot reapply", *target)
			}

			log.Printf("Reapplying migration %03d: %s (rolling back first)", targetMigration.Version, targetMigration.Name)

			if err := m.rollbackMigration(*targetMigration); err != nil {
				return fmt.Errorf("failed to rollback migration %d for reapplication: %w", targetMigration.Version, err)
			}

			if err := m.applyMigration(*targetMigration); err != nil {
				return fmt.Errorf("failed to apply migration %d after rollback: %w", targetMigration.Version, err)
			}

			log.Printf("Successfully reapplied migration %d", *target)
			return nil
		}
	}

	var migrationsToApply []Migration
	for _, migration := range m.migrations {
		if target != nil && migration.Version > *target {
			break
		}

		if _, applied := appliedVersions[migration.Version]; applied {
			continue
		}

		migrationsToApply = append(migrationsToApply, migration)
	}

	if len(migrationsToApply) == 0 {
		if target != nil {
			log.Printf("Migration %d was already applied, or no pending migrations before it.", *target)
		} else {
			log.Println("No pending migrations to apply")
		}
		return nil
	}

	count := 0
	for _, migration := range migrationsToApply {
		if migration.UpSQL == "" {
			log.Printf("Warning: No UP migration found for version %d, skipping", migration.Version)
			continue
		}

		log.Printf("Applying migration %03d: %s", migration.Version, migration.Name)

		if err := m.applyMigration(migration); err != nil {
			return fmt.Errorf("failed to apply migration %d: %w", migration.Version, err)
		}

		count++

		if target != nil && migration.Version == *target {
			break
		}
	}

	if count > 0 {
		log.Printf("Successfully applied %d migration(s)", count)
	}

	return nil
}

// Down rolls back the last migration
func (m *Migrate) Down() error {
	appliedVersions, err := m.getAppliedVersions()
	if err != nil {
		return fmt.Errorf("failed to get applied versions: %w", err)
	}

	if len(appliedVersions) == 0 {
		log.Println("No migrations to rollback")
		return nil
	}

	var lastVersion int
	for version := range appliedVersions {
		if version > lastVersion {
			lastVersion = version
		}
	}

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
func (m *Migrate) Status() error {
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
func (m *Migrate) getAppliedVersions() (map[int]*time.Time, error) {
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
func (m *Migrate) applyMigration(migration Migration) error {
	tx, err := m.db.Begin()
	if err != nil {
		return fmt.Errorf("failed to begin transaction: %w", err)
	}
	defer tx.Rollback()

	if _, err := tx.Exec(migration.UpSQL); err != nil {
		return fmt.Errorf("failed to execute migration: %w", err)
	}

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
func (m *Migrate) rollbackMigration(migration Migration) error {
	tx, err := m.db.Begin()
	if err != nil {
		return fmt.Errorf("failed to begin transaction: %w", err)
	}
	defer tx.Rollback()

	if _, err := tx.Exec(migration.DownSQL); err != nil {
		return fmt.Errorf("failed to execute rollback: %w", err)
	}

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
func (m *Migrate) Reset() error {
	appliedVersions, err := m.getAppliedVersions()
	if err != nil {
		return fmt.Errorf("failed to get applied versions: %w", err)
	}

	if len(appliedVersions) == 0 {
		log.Println("No migrations to reset")
		return nil
	}

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
