package templates

import (
	"bytes"
	"fmt"
	"html/template"
)

// EmailTemplateType defines custom structured layouts
type EmailTemplateType string

const (
	TemplateWelcome           EmailTemplateType = "welcome"
	TemplateOrderConfirmation EmailTemplateType = "order_confirmation"
	TemplateProductNewsletter EmailTemplateType = "product_newsletter"
	TemplateVerificationOTP   EmailTemplateType = "verification_otp"
	TemplateAccountUpdate     EmailTemplateType = "account_update"
	TemplateAccountDeletion   EmailTemplateType = "account_deletion"
	TemplateChangePassword    EmailTemplateType = "change_password"
	TemplateSupportHelp       EmailTemplateType = "support_help"
)

// TemplateData aggregates all variables needed across various email formats
type TemplateData struct {
	StoreName       string
	StoreLogo       string // Absolute HTTP URL string
	ClientName      string
	ActionURL       string
	OTPCode         string
	ProductName     string
	ProductDesc     string
	ProductImage    string
	ProductPrice    string
	OrderID         string
	OrderTotal      string
	OrderItems      []OrderItem
	ShippingAddress string

	// New fields for account changes and support channels
	SupportTicketID string
	SupportMessage  string
	SupportSubject  string
	SupportEmail    string
	BrowserInfo     string
	IPAddress       string
}

type OrderItem struct {
	Name     string
	Quantity int
	Price    string
}

// Base HTML Boilerplate matching the luxury cream/black/gold UI design system
const baseLayout = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{{ .StoreName }}</title>
    <style>
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,600;1,400&family=Plus+Jakarta+Sans:wght@300;400;500&display=swap');
        body { margin: 0; padding: 0; width: 100% !important; background-color: #fcfbfa; font-family: 'Plus Jakarta Sans', sans-serif; color: #1a1a1a; }
        .wrapper { width: 100%; table-layout: fixed; background-color: #fcfbfa; padding-bottom: 60px; }
        .main { background-color: #ffffff; margin: 0 auto; width: 100%; max-width: 600px; border-spacing: 0; font-family: 'Plus Jakarta Sans', sans-serif; color: #1a1a1a; border: 1px solid #f0edf7; }
        .header { background-color: #111111; padding: 40px; text-align: center; }
        .logo { font-family: 'Playfair Display', serif; font-size: 28px; color: #dfb76c; letter-spacing: 0.25em; text-transform: uppercase; text-decoration: none; font-weight: 400; }
        .content { padding: 48px 40px; background-color: #ffffff; }
        .title { font-family: 'Playfair Display', serif; font-size: 24px; font-weight: 400; line-height: 1.4; color: #111111; margin-top: 0; margin-bottom: 24px; text-align: center; }
        .text { font-size: 15px; line-height: 1.7; color: #4a4a4a; margin-top: 0; margin-bottom: 24px; }
        .button-container { text-align: center; margin: 32px 0; }
        .button { background-color: #111111; color: #ffffff !important; display: inline-block; padding: 14px 36px; font-size: 13px; font-weight: 500; letter-spacing: 0.15em; text-transform: uppercase; text-decoration: none; border: 1px solid #111111; transition: all 0.3s ease; }
        .meta-box { background-color: #faf8f5; border: 1px dashed #dfb76c; padding: 20px; margin: 24px 0; border-radius: 4px; }
        .meta-title { font-size: 13px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em; color: #111111; margin: 0 0 8px 0; }
        .meta-text { font-size: 13px; color: #666666; margin: 0; line-height: 1.5; }
        .footer { background-color: #faf8f5; padding: 40px; text-align: center; border-top: 1px solid #f0edf7; }
        .footer-text { font-size: 12px; color: #8a847e; line-height: 1.8; margin: 0; }
    </style>
</head>
<body>
    <center class="wrapper">
        <table class="main" width="100%">
            <tr>
                <td class="header">
                    <a href="#" class="logo">{{ .StoreName }}</a>
                </td>
            </tr>
            <tr>
                <td class="content">
                    {{ template "body" . }}
                </td>
            </tr>
            <tr>
                <td class="footer">
                    <p class="footer-text">&copy; {{ .StoreName }} Registry. All Rights Reserved.</p>
                    <p class="footer-text" style="margin-top: 8px;">You are receiving this secure message following an account operation update.</p>
                </td>
            </tr>
        </table>
    </center>
</body>
</html>
`

const accountUpdateTemplate = `
{{ define "body" }}
    <h1 class="title">Profile Changes Saved</h1>
    <p class="text">Dear {{ .ClientName }},</p>
    <p class="text">This email confirms that details associated with your premium customer profile registry were successfully modified and logged on our secure servers.</p>

    <div class="meta-box">
        <p class="meta-title">Security Log Details</p>
        <p class="meta-text"><strong>IP Address:</strong> {{ .IPAddress }}</p>
        <p class="meta-text"><strong>Device/Browser:</strong> {{ .BrowserInfo }}</p>
    </div>

    <p class="text">If you performed these profile adjustments, no further actions are necessary. If you did not authorize this operational profile change, please secure your account immediately.</p>
    <div class="button-container">
        <a href="{{ .ActionURL }}" class="button">Review Account Settings</a>
    </div>
{{ end }}
`

const accountDeletionTemplate = `
{{ define "body" }}
    <h1 class="title">Account Terminated</h1>
    <p class="text">Dear {{ .ClientName }},</p>
    <p class="text">As requested, your primary customer registration, digital catalog profile access tokens, and preference tracking archives have been permanently deactivated and pruned from the {{ .StoreName }} data matrix.</p>

    <p class="text">We are deeply saddened to see you depart the collection registry. Please note that it can take up to 48 hours for our internal background queues to drop communication dispatches completely.</p>

    <div class="meta-box" style="border-color: #d9534f; background-color: #fff9f9;">
        <p class="meta-title" style="color: #d9534f;">Notice of Action</p>
        <p class="meta-text">Your billing histories and core legal purchase receipts will remain encrypted in cold compliance archives matching your local territorial retention frameworks.</p>
    </div>

    <p class="text">Should you choose to return to the catalog layout at any point in the future, you will need to establish a fresh registration node via our main frontend application page.</p>
{{ end }}
`

const changePasswordTemplate = `
{{ define "body" }}
    <h1 class="title">Security Credentials Modified</h1>
    <p class="text">Dear {{ .ClientName }},</p>
    <p class="text">The master credential password code associated with your private access profile was updated within the last few minutes.</p>

    <div class="meta-box">
        <p class="meta-title">Security Session Audit</p>
        <p class="meta-text"><strong>Status:</strong> Password Changed Successfully</p>
        <p class="meta-text"><strong>IP Location Indicator:</strong> {{ .IPAddress }}</p>
    </div>

    <p class="text" style="color: #c9302c; font-weight: 500;">CRITICAL AUDIT NOTICE:</p>
    <p class="text">If you did NOT execute this master credential key rotation, your profile account safety integrity is highly compromised. Please use the immediate automated suspension token below to lock down your system vault node.</p>

    <div class="button-container">
        <a href="{{ .ActionURL }}" class="button" style="background-color: #111; color: #fff;">Freeze Profile Vault</a>
    </div>
{{ end }}
`

const supportHelpTemplate = `
{{ define "body" }}
    <h1 class="title">Support Case Registered</h1>
    <p class="text">Hello {{ .ClientName }},</p>
    <p class="text">We have logged your inquiries into our premium care concierge queue. A brand ambassador specialist will audit the technical transaction logs and follow up with a resolution vector.</p>

    <div class="meta-box">
        <p class="meta-title">Ticket Reference Node: #{{ .SupportTicketID }}</p>
        <p class="meta-text"><strong>Topic Area:</strong> {{ .SupportSubject }}</p>
        <p class="meta-text"><strong>Your Message Core:</strong> "{{ .SupportMessage }}"</p>
    </div>

    <p class="text">You don't need to respond to this diagnostic notice. If you have additional matching attachment data matrices to relay, please click the secure dialogue bridge below.</p>
    <div class="button-container">
        <a href="{{ .ActionURL }}" class="button">View Support Conversation</a>
    </div>
{{ end }}
`

// ParseHTMLTemplate resolves layouts dynamically out to a string injection payload
func ParseHTMLTemplate(tmplType EmailTemplateType, data TemplateData) (string, error) {
	if data.StoreName == "" {
		data.StoreName = "ELEGANCE"
	}

	var chosenTemplate string
	switch tmplType {
	case TemplateWelcome:
		chosenTemplate = welcomeTemplate
	case TemplateVerificationOTP:
		chosenTemplate = otpTemplate
	case TemplateProductNewsletter:
		chosenTemplate = productNewsletterTemplate
	case TemplateOrderConfirmation:
		chosenTemplate = orderConfirmationTemplate
	case TemplateAccountUpdate:
		chosenTemplate = accountUpdateTemplate
	case TemplateAccountDeletion:
		chosenTemplate = accountDeletionTemplate
	case TemplateChangePassword:
		chosenTemplate = changePasswordTemplate
	case TemplateSupportHelp:
		chosenTemplate = supportHelpTemplate
	default:
		return "", fmt.Errorf("unsupported target html email layout variant string requested")
	}

	tmpl, err := template.New("base").Parse(baseLayout)
	if err != nil {
		return "", fmt.Errorf("failed to process base html system skeleton layout: %w", err)
	}

	tmpl, err = tmpl.Parse(chosenTemplate)
	if err != nil {
		return "", fmt.Errorf("failed to stitch structural content definitions inside target layout: %w", err)
	}

	var tpl bytes.Buffer
	if err := tmpl.Execute(&tpl, data); err != nil {
		return "", fmt.Errorf("failed rendering layout structure contents: %w", err)
	}

	return tpl.String(), nil
}

// Keep placeholders for your existing template vars so the code remains valid
const welcomeTemplate = `{{ define "body" }}<h1 class="title">Welcome</h1><p class="text">Welcome to {{ .StoreName }}, {{ .ClientName }}.</p>{{ end }}`
const otpTemplate = `{{ define "body" }}<h1 class="title">Verification</h1><p class="text">Your code is {{ .OTPCode }}.</p>{{ end }}`
const productNewsletterTemplate = `{{ define "body" }}<h1 class="title">{{ .ProductName }}</h1><p class="text">{{ .ProductDesc }}</p>{{ end }}`
const orderConfirmationTemplate = `{{ define "body" }}<h1 class="title">Order Confirmed</h1><p class="text">Order {{ .OrderID }} status verified.</p>{{ end }}`
