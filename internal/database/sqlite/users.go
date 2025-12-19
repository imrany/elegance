package sqlite

import (
	"database/sql"
	"fmt"
	"strings"
	"time"

	"github.com/imrany/elegance/internal/models"
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
		SELECT id, email, role, created_at, updated_at, first_name, last_name, phone_number, password
		FROM users
		WHERE email = ?
	`

	var user models.User
	err := sq.db.QueryRow(query, email).Scan(
		&user.ID, &user.Email, &user.Role, &user.CreatedAt, &user.UpdatedAt,
		&user.FirstName, &user.LastName, &user.PhoneNumber, &user.Password,
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
		SELECT id, email, role, created_at, updated_at, first_name, last_name, phone_number, password
		FROM users
		WHERE id = ?
	`

	var user models.User
	err := sq.db.QueryRow(query, id).Scan(
		&user.ID, &user.Email, &user.Role, &user.CreatedAt, &user.UpdatedAt,
		&user.FirstName, &user.LastName, &user.PhoneNumber, &user.Password,
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

// GetAllUsers retrieves all users (admin)
func (sq *SQLiteDB) GetAllUsers() ([]models.User, error) {
	query := `
		SELECT id, email, role, created_at, updated_at, first_name, last_name, phone_number
		FROM users
		ORDER BY created_at DESC
	`

	rows, err := sq.db.Query(query)
	if err != nil {
		return nil, fmt.Errorf("failed to query users: %w", err)
	}
	defer rows.Close()

	var users []models.User
	for rows.Next() {
		var u models.User
		if err := rows.Scan(&u.ID, &u.Email, &u.Role, &u.CreatedAt, &u.UpdatedAt, &u.FirstName, &u.LastName, &u.PhoneNumber); err != nil {
			return nil, fmt.Errorf("failed to scan user: %w", err)
		}
		users = append(users, u)
	}

	return users, nil
}

// UpdateUserRole updates a user's role
func (sq *SQLiteDB) UpdateUserRole(id, role string) error {
	query := `
		UPDATE users
		SET role = ?, updated_at = datetime('now')
		WHERE id = ?
	`

	result, err := sq.db.Exec(query, role, id)
	if err != nil {
		return fmt.Errorf("failed to update user role: %w", err)
	}

	rows, err := result.RowsAffected()
	if err != nil {
		return fmt.Errorf("failed to get affected rows: %w", err)
	}

	if rows == 0 {
		return fmt.Errorf("user not found")
	}

	return nil
}

// DeleteUser deletes a user account
func (sq *SQLiteDB) DeleteUser(id string) error {
	query := `DELETE FROM users WHERE id = ?`

	result, err := sq.db.Exec(query, id)
	if err != nil {
		return fmt.Errorf("failed to delete user: %w", err)
	}

	rows, err := result.RowsAffected()
	if err != nil {
		return fmt.Errorf("failed to get affected rows: %w", err)
	}

	if rows == 0 {
		return fmt.Errorf("user not found")
	}

	return nil
}
