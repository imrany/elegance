package mailer

import (
	"crypto/tls"
	"fmt"
	"io"
	"strings"

	"gopkg.in/gomail.v2"
)

// ---------------------------------------------------------------------------
// Configuration
// ---------------------------------------------------------------------------

// SmtpConfig holds all SMTP settings needed to build a mailer and send mail.
type SmtpConfig struct {
	Host         string `json:"host"`
	Port         int    `json:"port"`
	Username     string `json:"username"`
	Password     string `json:"password"`
	FromEmail    string `json:"from_email"`
	FromName     string `json:"from_name"`
	Encryption   string `json:"encryption"` // "tls" (STARTTLS) or "ssl" (implicit TLS)
	IsConfigured bool   `json:"is_configured"`
}

// ---------------------------------------------------------------------------
// Payload types
// ---------------------------------------------------------------------------

// EmailPayload matches the outbound schema for a standard email.
type EmailPayload struct {
	To       []string  `json:"to"`
	Cc       *[]string `json:"cc,omitempty"`
	Bcc      *[]string `json:"bcc,omitempty"`
	ReplyTo  *string   `json:"reply_to,omitempty"`
	Subject  string    `json:"subject"`
	BodyText *string   `json:"body_text,omitempty"`
	BodyHtml *string   `json:"body_html,omitempty"`
}

// ReplyPayload contains details required for a threaded reply.
type ReplyPayload struct {
	OriginalMessageID string    `json:"original_message_id"`
	OriginalSubject   string    `json:"original_subject"`
	To                string    `json:"to"`
	Cc                *[]string `json:"cc,omitempty"`
	Bcc               *[]string `json:"bcc,omitempty"`
	BodyText          string    `json:"body_text"`
	BodyHtml          *string   `json:"body_html,omitempty"`
}

// ForwardPayload maps data structure needed for forwarding emails.
type ForwardPayload struct {
	OriginalSubject string    `json:"original_subject"`
	OriginalBody    string    `json:"original_body"`
	OriginalSender  string    `json:"original_sender"`
	To              []string  `json:"to"`
	Cc              *[]string `json:"cc,omitempty"`
	Bcc             *[]string `json:"bcc,omitempty"`
	Note            *string   `json:"note,omitempty"`
}

// ---------------------------------------------------------------------------
// Transport helpers
// ---------------------------------------------------------------------------

// BuildDialer sets up a gomail Dialer using configuration rules matching the Rust logic:
// - Port 465 forces SSL/implicit TLS.
// - Any other port uses opportunistic/mandatory STARTTLS upgrades.
func BuildDialer(smtpConfig *SmtpConfig) *gomail.Dialer {
	d := gomail.NewDialer(smtpConfig.Host, smtpConfig.Port, smtpConfig.Username, smtpConfig.Password)

	if smtpConfig.Port == 465 || smtpConfig.Encryption == "ssl" {
		d.SSL = true
	} else {
		d.SSL = false
		d.TLSConfig = &tls.Config{
			ServerName: smtpConfig.Host,
		}
	}
	return d
}

// TestConnection opens a connection and checks that the server responds to EHLO.
func TestConnection(smtpConfig *SmtpConfig) (bool, error) {
	d := BuildDialer(smtpConfig)
	closer, err := d.Dial()
	if err != nil {
		return false, fmt.Errorf("connection test failed: %w", err)
	}
	_ = closer.Close()
	return true, nil
}

// Send dispatches a constructed gomail message using the configurations provided.
func Send(smtpConfig *SmtpConfig, msg *gomail.Message) error {
	d := BuildDialer(smtpConfig)
	if err := d.DialAndSend(msg); err != nil {
		return fmt.Errorf("failed to send message: %w", err)
	}
	return nil
}

// ---------------------------------------------------------------------------
// Email composers
// ---------------------------------------------------------------------------

// ComposeEmail builds a standard email from an EmailPayload.
func ComposeEmail(payload *EmailPayload, smtpConfig *SmtpConfig) (*gomail.Message, error) {
	m := gomail.NewMessage()
	m.SetHeader("From", m.FormatAddress(smtpConfig.FromEmail, smtpConfig.FromName))
	m.SetHeader("To", payload.To...)
	m.SetHeader("Subject", payload.Subject)

	if payload.Cc != nil && len(*payload.Cc) > 0 {
		m.SetHeader("Cc", *payload.Cc...)
	}
	if payload.Bcc != nil && len(*payload.Bcc) > 0 {
		m.SetHeader("Bcc", *payload.Bcc...)
	}
	if payload.ReplyTo != nil && *payload.ReplyTo != "" {
		m.SetHeader("Reply-To", *payload.ReplyTo)
	}

	// Structural body evaluations matching Rust match patterns
	hasText := payload.BodyText != nil && *payload.BodyText != ""
	hasHtml := payload.BodyHtml != nil && *payload.BodyHtml != ""

	switch {
	case hasText && hasHtml:
		m.SetBody("text/plain", *payload.BodyText)
		m.AddAlternative("text/html", *payload.BodyHtml)
	case !hasText && hasHtml:
		m.SetBody("text/html", *payload.BodyHtml)
	case hasText && !hasHtml:
		m.SetBody("text/plain", *payload.BodyText)
	default:
		return nil, fmt.Errorf("at least one of body_text or body_html is required")
	}

	return m, nil
}

// ComposeReplyFull builds a threaded reply email adding matching tracking headers.
func ComposeReplyFull(payload *ReplyPayload, smtpConfig *SmtpConfig) (*gomail.Message, error) {
	subject := payload.OriginalSubject
	if !strings.HasPrefix(strings.ToLower(subject), "re:") {
		subject = "Re: " + subject
	}

	m := gomail.NewMessage()
	m.SetHeader("From", m.FormatAddress(smtpConfig.FromEmail, smtpConfig.FromName))
	m.SetHeader("To", payload.To)
	m.SetHeader("Subject", subject)

	// Add context headers for threaded rendering
	m.SetHeader("In-Reply-To", payload.OriginalMessageID)
	m.SetHeader("References", payload.OriginalMessageID)

	if payload.Cc != nil && len(*payload.Cc) > 0 {
		m.SetHeader("Cc", *payload.Cc...)
	}
	if payload.Bcc != nil && len(*payload.Bcc) > 0 {
		m.SetHeader("Bcc", *payload.Bcc...)
	}

	m.SetBody("text/plain", payload.BodyText)
	if payload.BodyHtml != nil && *payload.BodyHtml != "" {
		m.AddAlternative("text/html", *payload.BodyHtml)
	}

	return m, nil
}

// ComposeForwardFull builds a forwarded email body format layout.
func ComposeForwardFull(payload *ForwardPayload, smtpConfig *SmtpConfig) (*gomail.Message, error) {
	lowerSubject := strings.ToLower(payload.OriginalSubject)
	subject := payload.OriginalSubject
	if !strings.HasPrefix(lowerSubject, "fwd:") && !strings.HasPrefix(lowerSubject, "fw:") {
		subject = "Fwd: " + subject
	}

	note := ""
	if payload.Note != nil {
		note = *payload.Note
	}

	fwdBody := fmt.Sprintf(
		"%s\n\n---------- Forwarded message ----------\nFrom: %s\n\n%s",
		note, payload.OriginalSender, payload.OriginalBody,
	)

	m := gomail.NewMessage()
	m.SetHeader("From", m.FormatAddress(smtpConfig.FromEmail, smtpConfig.FromName))
	m.SetHeader("To", payload.To...)
	m.SetHeader("Subject", subject)

	if payload.Cc != nil && len(*payload.Cc) > 0 {
		m.SetHeader("Cc", *payload.Cc...)
	}
	if payload.Bcc != nil && len(*payload.Bcc) > 0 {
		m.SetHeader("Bcc", *payload.Bcc...)
	}

	m.SetBody("text/plain", fwdBody)
	return m, nil
}

// ComposeEmailWithAttachment builds a message containing a raw content memory stream attachment.
func ComposeEmailWithAttachment(
	to string,
	subject string,
	bodyText string,
	fileContent []byte,
	filename string,
	contentType string,
	smtpConfig *SmtpConfig,
) (*gomail.Message, error) {
	m := gomail.NewMessage()
	m.SetHeader("From", m.FormatAddress(smtpConfig.FromEmail, smtpConfig.FromName))
	m.SetHeader("To", to)
	m.SetHeader("Subject", subject)

	m.SetBody("text/plain", bodyText)

	// Gomail handles the multipart/mixed division automatically
	m.Attach(filename, gomail.SetCopyFunc(func(w io.Writer) error {
		_, err := w.Write(fileContent)
		return err
	}), gomail.SetHeader(map[string][]string{
		"Content-Type": {contentType + "; name=\"" + filename + "\""},
	}))

	return m, nil
}
