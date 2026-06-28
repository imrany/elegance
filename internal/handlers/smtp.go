package handlers

import (
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"strings"

	"github.com/gin-gonic/gin"
	"github.com/imrany/elegance/internal/models"
	"github.com/imrany/elegance/internal/templates"
	"github.com/imrany/elegance/pkg/mailer"
	"github.com/imrany/elegance/pkg/utils"
)

// GetWebsiteSmtpConfig returns the SMTP configuration for the website
func (s *Handler) GetWebsiteSmtpConfig(c *gin.Context) (*mailer.SmtpConfig, error) {
	settings, err := s.db.GetWebsiteSettingByKey("smtp")
	if err != nil {
		return nil, err
	}

	//parse settings.Value string into SmtpConfig
	config := mailer.SmtpConfig{}
	if err := json.Unmarshal([]byte(settings.Value), &config); err != nil {
		return nil, err
	}
	return &config, nil
}

// TestSmtpConnection handles GET /api/admin/smtp/test
func (s *Handler) TestSmtpConnection(c *gin.Context) {
	config, err := s.GetWebsiteSmtpConfig(c)
	if err != nil {
		utils.SendResponse(c, utils.Response{
			Status:  http.StatusInternalServerError,
			Success: false,
			Message: "Failed to get SMTP configuration",
		})
		return
	}
	ok, err := mailer.TestConnection(config)
	if err != nil || !ok {
		utils.SendResponse(c, utils.Response{
			Status:  http.StatusInternalServerError,
			Success: false,
			Message: "Failed to establish server handshake: " + err.Error(),
		})
		return
	}

	utils.SendResponse(c, utils.Response{
		Status:  http.StatusOK,
		Success: true,
		Message: "SMTP Server Connection Successful!",
	})
}

// ComposeEmail handles POST /api/admin/smtp/compose
func (s *Handler) ComposeEmail(c *gin.Context) {
	var req mailer.EmailPayload

	if err := c.ShouldBindJSON(&req); err != nil {
		utils.SendResponse(c, utils.Response{
			Status:  http.StatusBadRequest,
			Success: false,
			Message: err.Error(),
		})
		return
	}

	config, err := s.GetWebsiteSmtpConfig(c)
	if err != nil {
		utils.SendResponse(c, utils.Response{
			Status:  http.StatusInternalServerError,
			Success: false,
			Message: "Failed to get SMTP configuration",
		})
		return
	}

	msg, err := mailer.ComposeEmail(&req, config)
	if err != nil {
		utils.SendResponse(c, utils.Response{
			Status:  http.StatusInternalServerError,
			Success: false,
			Message: "Failed to send email: " + err.Error(),
		})
		return
	}
	if err := mailer.Send(config, msg); err != nil {
		utils.SendResponse(c, utils.Response{
			Status:  http.StatusInternalServerError,
			Success: false,
			Message: "Failed to send email: " + err.Error(),
		})
		return
	}
	utils.SendResponse(c, utils.Response{
		Status:  http.StatusOK,
		Success: true,
		Message: "Email sent successfully",
	})
}

func (s *Handler) SendBulkNewsletter(subject *string, prod models.Product) error {
	config, err := s.GetWebsiteSmtpConfig(nil) // Fetch your DB SMTP configs
	if err != nil {
		return err
	}

	subscribers, err := s.db.GetEmailSubscriptions()
	if err != nil || len(subscribers) == 0 {
		return fmt.Errorf("no subscribers found")
	}

	var recipients []string
	for _, subscriber := range subscribers {
		recipients = append(recipients, subscriber.Email)
	}

	// RENDER BEAUTIFUL FASHION HTML THEME
	htmlBody, err := templates.ParseHTMLTemplate(templates.TemplateProductNewsletter, templates.TemplateData{
		StoreName:    "ELEGANCE",
		ProductName:  prod.Name,
		ProductDesc:  *prod.Description,
		ProductPrice: fmt.Sprintf("KSH %.2f", prod.Price), // format as currency
		ProductImage: prod.Images[0],                      // Ensure absolute URL (e.g., https://...)
		ActionURL:    "https://yourstore.com/products/" + prod.ID,
	})
	if err != nil {
		return fmt.Errorf("failed to render product template: %w", err)
	}

	payload := mailer.EmailPayload{
		To: recipients,
		Subject: func() string {
			if subject != nil && *subject != "" {
				return *subject
			}
			return fmt.Sprintf("New Arrival: %s is now available!", prod.Name)
		}(),
		BodyHtml: &htmlBody, // Swapped from BodyText to use the rendered HTML code structure
	}

	msg, err := mailer.ComposeEmail(&payload, config)
	if err != nil {
		return err
	}

	return mailer.Send(config, msg)
}

func (s *Handler) SendVerificationOTP(email string, token string) error {
	config, err := s.GetWebsiteSmtpConfig(nil)
	if err != nil {
		return err
	}

	// Generate gold-bordered security verification block
	htmlBody, err := templates.ParseHTMLTemplate(templates.TemplateVerificationOTP, templates.TemplateData{
		StoreName: "ELEGANCE",
		OTPCode:   token,
	})
	if err != nil {
		return err
	}

	payload := mailer.EmailPayload{
		To:       []string{email},
		Subject:  "Secure Identity Verification Passkey",
		BodyHtml: &htmlBody,
	}

	msg, err := mailer.ComposeEmail(&payload, config)
	if err != nil {
		return err
	}
	return mailer.Send(config, msg)
}

func (s *Handler) WelcomeNewsletterSubscription(c *gin.Context, toEmails []string) error {
	config, err := s.GetWebsiteSmtpConfig(c) // Fetch SMTP settings
	if err != nil {
		return err
	}

	// Render the luxury Welcome layout
	htmlBody, err := templates.ParseHTMLTemplate(templates.TemplateWelcome, templates.TemplateData{
		StoreName:  "ELEGANCE",
		ClientName: strings.Split(toEmails[0], "@")[0], // Fallback greeting name
		ActionURL:  "https://elegance-store.com/new-arrivals",
	})
	if err != nil {
		log.Printf("Failed to render welcome email: %v", err)
		return err
	}

	payload := mailer.EmailPayload{
		To:       toEmails,
		Subject:  "Welcome to the Elegance Catalog",
		BodyHtml: &htmlBody,
	}

	msg, err := mailer.ComposeEmail(&payload, config)
	if err == nil {
		_ = mailer.Send(config, msg)
	}
	return err
}

func (s *Handler) ConfirmUserOrder(c *gin.Context, orderID string) error {
	// Fetch order metadata & shipping address from DB
	order, err := s.db.GetOrdersByOption("id", &orderID)
	if err != nil {
		return fmt.Errorf("failed fetching order logs: %w", err)
	}

	// Fetch customer records for their name
	user, err := s.db.GetUserByID(order[0].Customer.UserID)
	if err != nil {
		return fmt.Errorf("failed fetching checkout profile: %w", err)
	}

	// Map database items into the template structured OrderItem array
	var itemsForInvoice []templates.OrderItem
	for _, item := range order[0].Items {
		itemsForInvoice = append(itemsForInvoice, templates.OrderItem{
			Name:     item.Name,
			Quantity: item.Quantity,
			Price:    fmt.Sprintf("KSH %.2f", item.Price),
		})
	}

	// Generate the rich HTML markup payload
	htmlBody, err := templates.ParseHTMLTemplate(templates.TemplateOrderConfirmation, templates.TemplateData{
		StoreName:       "ELEGANCE",
		ClientName:      fmt.Sprintf("%s %s", user.FirstName, user.LastName),
		OrderID:         order[0].ID,
		OrderTotal:      fmt.Sprintf("KSH %.2f", order[0].Total),
		OrderItems:      itemsForInvoice,
		ShippingAddress: fmt.Sprintf("%s, %s, %s", order[0].Shipping.Address, order[0].Shipping.City, order[0].Shipping.PostalCode),
	})
	if err != nil {
		return fmt.Errorf("failed generating order invoice view: %w", err)
	}

	// Send out via SMTP mailer block
	config, err := s.GetWebsiteSmtpConfig(c)
	if err != nil {
		return err
	}

	payload := mailer.EmailPayload{
		To:       []string{user.Email},
		Subject:  fmt.Sprintf("Your Elegance Order Confirmation (#%s)", order[0].ID[:8]),
		BodyHtml: &htmlBody,
	}

	msg, err := mailer.ComposeEmail(&payload, config)
	if err != nil {
		return err
	}

	return mailer.Send(config, msg)
}

// SendAccountUpdateNotice dispatches profile alteration notifications asynchronously
func (s *Handler) SendAccountUpdateNotice(email string, clientName string, ipAddress *string, userAgent *string) {
	go func() {
		config, err := s.GetWebsiteSmtpConfig(nil)
		if err != nil {
			log.Printf("SendAccountUpdateNotice error retrieving smtp parameters: %v", err)
			return
		}

		htmlBody, err := templates.ParseHTMLTemplate(templates.TemplateAccountUpdate, templates.TemplateData{
			StoreName:   "ELEGANCE",
			ClientName:  clientName,
			IPAddress:   *ipAddress,
			BrowserInfo: *userAgent,
			ActionURL:   "https://elegance-store.com/account/settings",
		})
		if err != nil {
			log.Printf("Failed to render account update template: %v", err)
			return
		}

		payload := mailer.EmailPayload{
			To:       []string{email},
			Subject:  "Elegance Account Settings - Profile Changes Saved",
			BodyHtml: &htmlBody,
		}

		msg, err := mailer.ComposeEmail(&payload, config)
		if err == nil {
			_ = mailer.Send(config, msg)
		}
	}()
}

// SendAccountDeletionNotice dispatches deactivation alerts asynchronously
func (s *Handler) SendAccountDeletionNotice(email, clientName string) {
	go func() {
		config, err := s.GetWebsiteSmtpConfig(nil)
		if err != nil {
			log.Printf("SendAccountDeletionNotice error retrieving smtp parameters: %v", err)
			return
		}

		htmlBody, err := templates.ParseHTMLTemplate(templates.TemplateAccountDeletion, templates.TemplateData{
			StoreName:  "ELEGANCE",
			ClientName: clientName,
		})
		if err != nil {
			log.Printf("Failed to render account deletion template: %v", err)
			return
		}

		payload := mailer.EmailPayload{
			To:       []string{email},
			Subject:  "Account Termination Confirmation - Elegance Private Registry",
			BodyHtml: &htmlBody,
		}

		msg, err := mailer.ComposeEmail(&payload, config)
		if err == nil {
			_ = mailer.Send(config, msg)
		}
	}()
}

// SendChangePasswordNotice dispatches credential safety receipts asynchronously
func (s *Handler) SendChangePasswordNotice(email, clientName, ipAddress string) {
	go func() {
		config, err := s.GetWebsiteSmtpConfig(nil)
		if err != nil {
			log.Printf("SendChangePasswordNotice error retrieving smtp parameters: %v", err)
			return
		}

		htmlBody, err := templates.ParseHTMLTemplate(templates.TemplateChangePassword, templates.TemplateData{
			StoreName:  "ELEGANCE",
			ClientName: clientName,
			IPAddress:  ipAddress,
			ActionURL:  "https://elegance-store.com/account/security-freeze",
		})
		if err != nil {
			log.Printf("Failed to render change password template: %v", err)
			return
		}

		payload := mailer.EmailPayload{
			To:       []string{email},
			Subject:  "SECURITY ALERT: Elegance Profile Password Modified",
			BodyHtml: &htmlBody,
		}

		msg, err := mailer.ComposeEmail(&payload, config)
		if err == nil {
			_ = mailer.Send(config, msg)
		}
	}()
}

// SendSupportHelpConfirmation dispatches conversational queues confirmations asynchronously
func (s *Handler) SendSupportHelpConfirmation(email, clientName, ticketID, subject, customMessage string) {
	go func() {
		config, err := s.GetWebsiteSmtpConfig(nil)
		if err != nil {
			log.Printf("SendSupportHelpConfirmation error retrieving smtp parameters: %v", err)
			return
		}

		htmlBody, err := templates.ParseHTMLTemplate(templates.TemplateSupportHelp, templates.TemplateData{
			StoreName:       "ELEGANCE",
			ClientName:      clientName,
			SupportTicketID: ticketID,
			SupportSubject:  subject,
			SupportMessage:  customMessage,
			ActionURL:       "https://elegance-store.com/support/tickets/" + ticketID,
		})
		if err != nil {
			log.Printf("Failed to render support confirmation template: %v", err)
			return
		}

		payload := mailer.EmailPayload{
			To:       []string{email},
			Subject:  fmt.Sprintf("Concierge Support Request Logged [#%s]", ticketID),
			BodyHtml: &htmlBody,
		}

		msg, err := mailer.ComposeEmail(&payload, config)
		if err == nil {
			_ = mailer.Send(config, msg)
		}
	}()
}
