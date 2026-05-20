package templates

func Verification(name, username, verifyURL string) string {
	return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Verify Your Email - ` + name + `</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            margin: 0;
            padding: 0;
            background-color: #f4f4f4;
        }
        .container {
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
            background-color: #ffffff;
        }
        .header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 30px;
            text-align: center;
            border-radius: 10px 10px 0 0;
        }
        .header h1 {
            margin: 0;
            font-size: 24px;
        }
        .content {
            background: #ffffff;
            padding: 30px;
            border: 1px solid #e0e0e0;
            border-top: none;
        }
        .verify-button {
            display: inline-block;
            background: #667eea;
            color: white !important;
            padding: 15px 30px;
            text-decoration: none;
            border-radius: 5px;
            margin: 20px 0;
            font-weight: bold;
            text-align: center;
        }
        .verify-button:hover {
            background: #5568d3;
        }
        .footer {
            text-align: center;
            padding: 20px;
            color: #666;
            font-size: 12px;
            background-color: #f8f9fa;
            border-radius: 0 0 10px 10px;
        }
        .link-text {
            word-break: break-all;
            color: #666;
            font-size: 12px;
            margin-top: 20px;
            padding: 15px;
            background-color: #f8f9fa;
            border-radius: 5px;
        }
        .warning {
            color: #999;
            font-size: 14px;
            margin-top: 30px;
            padding: 15px;
            background-color: #fff3cd;
            border-left: 4px solid #ffc107;
            border-radius: 4px;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🎉 Welcome to ` + name + `,` + username + `!</h1>
            <p style="margin: 10px 0 0 0;">Just one more step to get started</p>
        </div>

        <div class="content">
            <h2 style="color: #333; margin-top: 0;">Verify Your Email Address</h2>
            <p>Thanks for signing up! Please verify your email address to activate your account and access all features.</p>

            <center>
                <a href="` + verifyURL + `" class="verify-button">Verify Email Address →</a>
            </center>

            <p style="margin-top: 30px; text-align: center;">
                <strong>⏱️ This verification link will expire in 24 hours.</strong>
            </p>

            <div class="link-text">
                <strong>Button not working?</strong><br>
                Copy and paste this link into your browser:<br>
                <span style="color: #667eea;">` + verifyURL + `</span>
            </div>

            <div class="warning">
                <strong>⚠️ Didn't create a ` + name + ` account?</strong><br>
                If you didn't sign up for ` + name + `, you can safely ignore this email.
            </div>
        </div>

        <div class="footer">
            <p style="margin: 5px 0;"><strong>Thanks for joining Gemmie!</strong></p>
            <p style="margin: 5px 0;">Questions? Reply to this email or visit our support center.</p>
            <p style="margin: 15px 0 5px 0; font-size: 11px; color: #999;">
                © 2026 ` + name + `. All rights reserved.
            </p>
        </div>
    </div>
</body>
</html>
`
}

func GetResubscribeSuccessHTML(originURL string, name string) string {
	return `
<!DOCTYPE html>
<html>
<head>
    <title>Resubscribed</title>
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <style>
        body { font-family: Arial, sans-serif; max-width: 600px; margin: 50px auto; padding: 20px; text-align: center; background-color: #f4f4f4; }
        .container { background: white; padding: 40px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
        .success { color: #5cb85c; font-size: 48px; }
        h1 { color: #333; margin: 20px 0; }
        p { color: #666; line-height: 1.6; margin: 15px 0; }
        .button { display: inline-block; background: #667eea; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; margin-top: 20px; transition: background 0.3s; }
        .button:hover { background: #5568d3; }
    </style>
</head>
<body>
    <div class="container">
        <div class="success">✓</div>
        <h1>Successfully Resubscribed</h1>
        <p>You have been resubscribed to ` + name + ` promotional emails.</p>
        <p>You will now receive upgrade notifications and marketing emails.</p>
        <a href="` + originURL + `" class="button">Return to ` + name + `</a>
    </div>
</body>
</html>
	`
}

func GetAlreadySubscribedHTML(originURL string, name string) string {
	return `
<!DOCTYPE html>
<html>
<head>
    <title>Already Subscribed</title>
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <style>
        body { font-family: Arial, sans-serif; max-width: 600px; margin: 50px auto; padding: 20px; text-align: center; background-color: #f4f4f4; }
        .container { background: white; padding: 40px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
        .info { color: #0275d8; font-size: 48px; }
        h1 { color: #333; margin: 20px 0; }
        p { color: #666; line-height: 1.6; margin: 15px 0; }
        .button { display: inline-block; background: #667eea; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; margin-top: 20px; transition: background 0.3s; }
        .button:hover { background: #5568d3; }
    </style>
</head>
<body>
    <div class="container">
        <div class="info">ℹ</div>
        <h1>Already Subscribed</h1>
        <p>You are already subscribed to promotional emails.</p>
        <p>You'll continue receiving updates from ` + name + `.</p>
        <a href="` + originURL + `" class="button">Return to ` + name + `</a>
    </div>
</body>
</html>
	`
}

func GetVerifySuccessHTML(originURL string, name string) string {
	return `
<!DOCTYPE html>
<html>
<head>
    <title>Email Verified</title>
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <style>
        body { font-family: Arial, sans-serif; max-width: 600px; margin: 50px auto; padding: 20px; text-align: center; background-color: #f4f4f4; }
        .container { background: white; padding: 40px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
        .success { color: #5cb85c; font-size: 48px; }
        h1 { color: #333; margin: 20px 0; }
        p { color: #666; line-height: 1.6; margin: 15px 0; }
        .button { display: inline-block; background: #667eea; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; margin-top: 20px; transition: background 0.3s; }
        .button:hover { background: #5568d3; }
    </style>
</head>
<body>
    <div class="container">
        <div class="success">✓</div>
        <h1>Email Verified Successfully!</h1>
        <p>Your email has been verified. You can now enjoy all features of ` + name + `.</p>
        <a href="` + originURL + `" class="button">Go to ` + name + `</a>
    </div>
</body>
</html>
	`
}

func GetAlreadyVerifiedHTML(originURL string, name string) string {
	return `
<!DOCTYPE html>
<html>
<head>
    <title>Already Verified</title>
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <style>
        body { font-family: Arial, sans-serif; max-width: 600px; margin: 50px auto; padding: 20px; text-align: center; background-color: #f4f4f4; }
        .container { background: white; padding: 40px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
        .info { color: #0275d8; font-size: 48px; }
        h1 { color: #333; margin: 20px 0; }
        p { color: #666; line-height: 1.6; margin: 15px 0; }
        .button { display: inline-block; background: #667eea; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; margin-top: 20px; transition: background 0.3s; }
        .button:hover { background: #5568d3; }
    </style>
</head>
<body>
    <div class="container">
        <div class="info">ℹ</div>
        <h1>Email Already Verified</h1>
        <p>Your email address is already verified.</p>
        <p>You're all set to use ` + name + `!</p>
        <a href="` + originURL + `" class="button">Go to ` + name + `</a>
    </div>
</body>
</html>
	`
}

func GetUnsubscribeSuccessHTML(name, email, token string) string {
	return `
<!DOCTYPE html>
<html>
<head>
	<title>Unsubscribed</title>
	<meta name="viewport" content="width=device-width, initial-scale=1.0">
	<style>
		body { font-family: Arial, sans-serif; max-width: 600px; margin: 50px auto; padding: 20px; text-align: center; background-color: #f4f4f4; }
		.container { background: white; padding: 40px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
		.success { color: #5cb85c; font-size: 48px; }
		h1 { color: #333; margin: 20px 0; }
		p { color: #666; line-height: 1.6; margin: 15px 0; }
		.resubscribe { margin-top: 30px; padding: 20px; background-color: #f8f9fa; border-radius: 5px; }
		.button { display: inline-block; background: #667eea; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; margin-top: 10px; transition: background 0.3s; }
		.button:hover { background: #5568d3; }
	</style>
</head>
<body>
	<div class="container">
		<div class="success">✓</div>
		<h1>Successfully Unsubscribed</h1>
		<p>You have been unsubscribed from ` + name + ` promotional emails.</p>
		<p>You will no longer receive upgrade notifications and marketing emails.</p>
		<div class="resubscribe">
			<p><strong>Changed your mind?</strong></p>
			<a href="https://gemmie.villebiz.com/resubscribe?email=` + email + `&token=` + token + `" class="button">Click here to resubscribe</a>
		</div>
	</div>
</body>
</html>
	`
}

func GetAlreadyUnsubscribedHTML(originURL, email, token string) string {
	return `
<!DOCTYPE html>
<html>
<head>
	<title>Already Unsubscribed</title>
	<meta name="viewport" content="width=device-width, initial-scale=1.0">
	<style>
		body { font-family: Arial, sans-serif; max-width: 600px; margin: 50px auto; padding: 20px; text-align: center; background-color: #f4f4f4; }
		.container { background: white; padding: 40px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
		.info { color: #0275d8; font-size: 48px; }
		h1 { color: #333; margin: 20px 0; }
		p { color: #666; line-height: 1.6; margin: 15px 0; }
		.button { display: inline-block; background: #667eea; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; margin-top: 20px; transition: background 0.3s; }
		.button:hover { background: #5568d3; }
	</style>
</head>
<body>
	<div class="container">
		<div class="info">ℹ</div>
		<h1>Already Unsubscribed</h1>
		<p>You are already unsubscribed from promotional emails.</p>
		<p>Want to receive updates again?</p>
		<a href="` + originURL + `/resubscribe?email=` + email + `&token=` + token + `" class="button">Resubscribe</a>
	</div>
</body>
</html>
	`
}

func GetErrorHTML(originURL, name, title, message string) string {
	return `
<!DOCTYPE html>
<html>
<head>
	<title>` + title + `</title>
	<meta name="viewport" content="width=device-width, initial-scale=1.0">
	<style>
		body { font-family: Arial, sans-serif; max-width: 600px; margin: 50px auto; padding: 20px; text-align: center; background-color: #f4f4f4; }
		.container { background: white; padding: 40px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
		.error { color: #d9534f; font-size: 48px; }
		h1 { color: #333; margin: 20px 0; }
		p { color: #666; line-height: 1.6; margin: 15px 0; }
		.button { display: inline-block; background: #667eea; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; margin-top: 20px; transition: background 0.3s; }
		.button:hover { background: #5568d3; }
	</style>
</head>
<body>
	<div class="container">
		<div class="error">✗</div>
		<h1>` + title + `</h1>
		<p>` + message + `</p>
		<a href="` + originURL + `" class="button">Go to ` + name + `</a>
	</div>
</body>
</html>
	`
}
