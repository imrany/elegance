package sqlite

import (
	"database/sql"
	"fmt"
	"strings"
	"time"

	"github.com/imrany/ecommerce/internal/models"
)

// CreateUser creates a new user
func (sq *SQLiteDB) CreateUser(user *models.User) (*models.User, error) {
	query := `
		INSERT INTO users (id, email, password, role, created_at, updated_at, first_name, last_name, phone_number)
		VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
	`

	_, err := sq.db.Exec(
		query,
		user.ID, user.Email, user.Password, user.Role, user.CreatedAt, user.UpdatedAt,
		user.FirstName, user.LastName, user.PhoneNumber,
	)

	if err != nil {
		if strings.Contains(err.Error(), "UNIQUE constraint failed") {
			return nil, fmt.Errorf("email already exists")
		}
		return nil, fmt.Errorf("failed to create user: %w", err)
	}

	return user, nil
}

// GetUserByEmail retrieves a user by email
func (sq *SQLiteDB) GetUserByEmail(email string) (*models.User, error) {
	query := `
		SELECT id, email, password, role, created_at, updated_at, first_name, last_name, phone_number
		FROM users
		WHERE email = ?
	`

	var user models.User
	err := sq.db.QueryRow(query, email).Scan(
		&user.ID, &user.Email, &user.Password, &user.Role, &user.CreatedAt, &user.UpdatedAt,
		&user.FirstName, &user.LastName, &user.PhoneNumber,
	)

	if err != nil {
		if err == sql.ErrNoRows {
			return nil, fmt.Errorf("user not found")
		}
		return nil, fmt.Errorf("failed to get user: %w", err)
	}

	return &user, nil
}

// GetUserByID retrieves a user by ID
func (sq *SQLiteDB) GetUserByID(id string) (*models.User, error) {
	query := `
		SELECT id, email, password, role, created_at, updated_at, first_name, last_name, phone_number
		FROM users
		WHERE id = ?
	`

	var user models.User
	err := sq.db.QueryRow(query, id).Scan(
		&user.ID, &user.Email, &user.Password, &user.Role, &user.CreatedAt, &user.UpdatedAt,
		&user.FirstName, &user.LastName, &user.PhoneNumber,
	)

	if err != nil {
		if err == sql.ErrNoRows {
			return nil, fmt.Errorf("user not found")
		}
		return nil, fmt.Errorf("failed to get user: %w", err)
	}

	return &user, nil
}

// UpdateUser updates a user
func (sq *SQLiteDB) UpdateUser(user *models.User) error {
	user.UpdatedAt = time.Now()

	query := `
		UPDATE users
		SET email = ?, password = ?, role = ?, updated_at = ?, first_name = ?, last_name = ?, phone_number = ?
		WHERE id = ?
	`

	_, err := sq.db.Exec(query, user.Email, user.Password, user.Role, user.UpdatedAt, user.FirstName, user.LastName, user.PhoneNumber, user.ID)
	if err != nil {
		return fmt.Errorf("failed to update user: %w", err)
	}

	return nil
}
