package sqlite

import (
	"fmt"
	"strings"

	"github.com/imrany/elegance/internal/models"
)

func (sq *SQLiteDB) SetupAdmin(user *models.User) (*models.User, error) {
	query := `
			INSERT INTO users (id, email, password, role, created_at, updated_at, first_name, last_name, phone_number)
			VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
		`

	_, err := sq.db.Exec(
		query,
		user.ID, user.Email, user.Password, "admin", user.CreatedAt, user.UpdatedAt,
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

func (sq *SQLiteDB) GetSetupStatus() (*models.SetupStatus, error) {
	query := `
			SELECT COUNT(*) FROM users WHERE role = 'admin'
		`

	var count int
	err := sq.db.QueryRow(query).Scan(&count)

	if err != nil {
		return nil, fmt.Errorf("failed to get setup status: %w", err)
	}

	return &models.SetupStatus{HasAdmin: count > 0, SetupComplete: count > 0}, nil
}
