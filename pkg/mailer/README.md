# mailer Package

The `mailer` package provides functionality for sending emails,
including OTP (One-Time Password) emails, powered by `gopkg.in/gomail.v2`.

## Setup Configuration
The module automatically parses port profiles to align network encryptions safely:

- Port 465 or setting Encryption: "ssl" initializes implicit TLS.
- Any other port defaults to explicit TLS protocol validation (STARTTLS).

The package uses the `SMTPConfig` struct to store SMTP server configuration details.

```go
config := &mailer.SmtpConfig{
    Host:         "smtp.mailtrap.io",
    Port:         587,
    Username:     "your_username",
    Password:     "your_password",
    FromEmail:    "no-reply@yourdomain.com",
    FromName:     "Automated System",
    Encryption:   "tls",
    IsConfigured: true,
}
```

- `Host`: The SMTP server hostname.
- `Port`: The SMTP server port.
- `Username`: The SMTP username for authentication.
- `Password`: The SMTP password for authentication.
- `FromEmail`: The email address used as the sender.
- `FromName`: The name of the sender.
- `Encryption`: The encryption protocol to use ("tls" or "ssl").
- `IsConfigured`: A flag indicating whether the configuration is valid.

## Usage

### Quick Start Examples

1.  **Test Mail Server Connection**
    Verify server authorization handshake metrics without sending an active message:

    ```go
    ok, err := mailer.TestConnection(config)
    if err != nil || !ok {
        log.Fatalf("Failed to establish server handshake: %v", err)
    }
    fmt.Println("SMTP Server Connection Successful!")
    ```

2.  **Standard Outbound Email (Multipart HTML/Text Alternative)**
    Compose an outbound communication parsing automatic multipart layouts:

    ```go
    textBody := "Hello world plain text!"
    htmlBody := "<h1>Hello world HTML!</h1>"

    payload := &mailer.EmailPayload{
        To:       []string{"recipient@example.com"},
        Cc:       &[]string{"manager@example.com"},
        Subject:  "Welcome onboard!",
        BodyText: &textBody,
        BodyHtml: &htmlBody,
    }

    msg, err := mailer.ComposeEmail(payload, config)
    if err == nil {
        err = mailer.Send(config, msg)
    }
    ```

3.  **Threaded Reply Email**
    Reply directly to existing conversational threads using context keys (In-Reply-To and References headers):

    ```go
    replyPayload := &mailer.ReplyPayload{
        OriginalMessageID: "<unique-message-id-from-header@server.com>",
        OriginalSubject:   "Project Status Update",
        To:                "client@example.com",
        BodyText:          "Thank you for the update. We are moving forward as planned.",
    }

    msg, err := mailer.ComposeReplyFull(replyPayload, config)
    if err == nil {
        err = mailer.Send(config, msg)
    }
    ```

4.  **Send Email with Raw Byte Attachment**
    Attach data streams generated purely in-memory (e.g., dynamically rendered PDFs or reports) without writing to the disk:

    ```go
    pdfBytes := []byte("%PDF-1.4 ... raw content bytes ...")

    msg, err := mailer.ComposeEmailWithAttachment(
        "finance@example.com",
        "Monthly Export Statement",
        "Please find attached your monthly performance report.",
        pdfBytes,
        "invoice_june.pdf",
        "application/pdf",
        config,
    )
    if err == nil {
        err = mailer.Send(config, msg)
    }
    ```
