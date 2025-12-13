package postgres

import (
	"database/sql"
	"fmt"
	"time"

	"github.com/imrany/ecommerce/internal/models"
)

// CreateUser creates a new user account
func (pg *PostgresDB) CreateUser(user *models.User) (*models.User, error) {
	query := `
		INSERT INTO users (id, email, password, role, created_at, updated_at, first_name, last_name, phone_number)
		VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
		RETURNING id, email, role, created_at, updated_at, first_name, last_name, phone_number
	`

	err := pg.db.QueryRow(
		query,
		user.ID, user.Email, user.Password, user.Role, user.CreatedAt, user.UpdatedAt, user.FirstName, user.LastName, user.PhoneNumber,
	).Scan(&user.ID, &user.Email, &user.Role, &user.CreatedAt, &user.UpdatedAt, &user.FirstName, &user.LastName, &user.PhoneNumber)

	if err != nil {
		if err.Error() == "pq: duplicate key value violates unique constraint \"users_email_key\"" {
			return nil, fmt.Errorf("email already exists")
		}
		return nil, fmt.Errorf("failed to create user: %w", err)
	}

	return user, nil
}

// GetUserByEmail retrieves a user by email
func (pg *PostgresDB) GetUserByEmail(email string) (*models.User, error) {
	query := `
		SELECT id, email, password, role, created_at, updated_at, first_name, last_name, phone_number
		FROM users
		WHERE email = $1
	`

	var user models.User
	err := pg.db.QueryRow(query, email).Scan(
		&user.ID, &user.Email, &user.Password, &user.Role, &user.CreatedAt, &user.UpdatedAt, &user.FirstName, &user.LastName, &user.PhoneNumber)

	if err != nil {
		if err == sql.ErrNoRows {
			return nil, fmt.Errorf("user not found")
		}
		return nil, fmt.Errorf("failed to get user: %w", err)
	}

	return &user, nil
}

// GetUserByID retrieves a user by ID
func (pg *PostgresDB) GetUserByID(id string) (*models.User, error) {
	query := `
		SELECT id, email, password, role, created_at, updated_at, first_name, last_name, phone_number
		FROM users
		WHERE id = $1
	`

	var user models.User
	err := pg.db.QueryRow(query, id).Scan(
		&user.ID, &user.Email, &user.Password, &user.Role, &user.CreatedAt, &user.UpdatedAt, &user.FirstName, &user.LastName, &user.PhoneNumber)

	if err != nil {
		if err == sql.ErrNoRows {
			return nil, fmt.Errorf("user not found")
		}
		return nil, fmt.Errorf("failed to get user: %w", err)
	}

	return &user, nil
}

// UpdateUser updates a user
func (pg *PostgresDB) UpdateUser(user *models.User) error {
	user.UpdatedAt = time.Now()

	query := `
		UPDATE users
		SET email = $1, password = $2, role = $3, updated_at = $4, first_name = $5, last_name = $6, phone_number = $7
		WHERE id = $8
	`

	_, err := pg.db.Exec(query, user.Email, user.Password, user.Role, user.UpdatedAt, user.FirstName, user.LastName, user.PhoneNumber, user.ID)
	if err != nil {
		return fmt.Errorf("failed to update user: %w", err)
	}

	return nil
}
