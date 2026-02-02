import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from app.core.config import settings

def send_verification_email(email: str, token: str, full_name: str):
    """
    Send a verification email to the user with a verification link.
    """
    # Verification link (Frontend URL)
    verification_link = f"http://localhost:3000/verify-email?token={token}"
    
    subject = "Verify Your VELORA Admin Account"
    
    body = f"""
    Hi {full_name},

    Your VELORA administrator account has been created. Please verify your email address by clicking the link below:

    {verification_link}

    This link will expire in {settings.verification_token_expire_hours} hours.

    If you didn't request this account, please ignore this email.

    Best regards,
    VELORA Team
    """
    
    msg = MIMEMultipart()
    msg['From'] = settings.smtp_from_email
    msg['To'] = email
    msg['Subject'] = subject
    
    msg.attach(MIMEText(body, 'plain'))
    
    try:
        # Connect to the SMTP server
        server = smtplib.SMTP(settings.smtp_host, settings.smtp_port)
        server.starttls()  # Upgrade the connection to a secure one
        
        # Login if user and password are provided
        if settings.smtp_user and settings.smtp_password:
            server.login(settings.smtp_user, settings.smtp_password)
        
        # Send the email
        server.send_message(msg)
        server.quit()
        return True
    except Exception as e:
        print(f"Error sending email: {e}")
        return False

def send_password_reset_email(email: str, token: str, full_name: str):
    """
    Send a password reset email with a nice HTML design.
    """
    reset_link = f"http://localhost:3000/reset-password?token={token}"
    subject = "Reset Your VELORA Password"
    
    html_content = f"""
    <!DOCTYPE html>
    <html>
    <head>
        <style>
            .container {{
                font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                max-width: 600px;
                margin: 0 auto;
                padding: 40px;
                background-color: #f8f9fa;
                border-radius: 24px;
            }}
            .header {{
                text-align: center;
                margin-bottom: 30px;
            }}
            .logo {{
                display: inline-block;
                width: 50px;
                height: 50px;
                background-color: #7C4DFF;
                color: white;
                text-align: center;
                line-height: 50px;
                font-size: 24px;
                font-weight: bold;
                border-radius: 12px;
                margin-bottom: 15px;
            }}
            .brand {{
                color: #7C4DFF;
                font-weight: bold;
                letter-spacing: 2px;
                font-size: 14px;
            }}
            .content {{
                background-color: white;
                padding: 40px;
                border-radius: 20px;
                box-shadow: 0 4px 15px rgba(0,0,0,0.05);
            }}
            .title {{
                font-size: 22px;
                font-weight: bold;
                color: #2D3139;
                margin-bottom: 20px;
            }}
            .text {{
                color: #61656C;
                line-height: 1.6;
                font-size: 15px;
                margin-bottom: 30px;
            }}
            .button {{
                display: block;
                width: 200px;
                margin: 0 auto;
                background-color: #7C4DFF;
                color: white !important;
                text-decoration: none;
                padding: 15px 30px;
                border-radius: 12px;
                font-weight: bold;
                font-size: 14px;
                text-align: center;
                box-shadow: 0 8px 20px rgba(124, 77, 255, 0.2);
            }}
            .footer {{
                text-align: center;
                margin-top: 30px;
                font-size: 11px;
                color: #90949F;
                font-weight: bold;
                letter-spacing: 1px;
            }}
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <div class="logo">V</div>
                <div class="brand">VELORA SECURE</div>
            </div>
            <div class="content">
                <div class="title">Password Reset Request</div>
                <p class="text">
                    Hi {full_name},<br><br>
                    A password reset was requested for your VELORA account. Click the button below to set a new password:
                </p>
                <a href="{reset_link}" class="button">RESET PASSWORD</a>
                <p class="text" style="margin-top: 30px;">
                    This link will expire in 1 hour. If you didn't request a password reset, you can safely ignore this email.
                </p>
            </div>
            <div class="footer">
                © 2026 VELORA SYSTEMS • SECURED ACCESS
            </div>
        </div>
    </body>
    </html>
    """
    
    msg = MIMEMultipart('alternative')
    msg['From'] = settings.smtp_from_email
    msg['To'] = email
    msg['Subject'] = subject
    
    # Attach plain text version
    plain_text = f"Hi {full_name},\n\nPlease reset your password using this link: {reset_link}\n\nThis link will expire in 1 hour."
    msg.attach(MIMEText(plain_text, 'plain'))
    
    # Attach HTML version
    msg.attach(MIMEText(html_content, 'html'))
    
    try:
        server = smtplib.SMTP(settings.smtp_host, settings.smtp_port)
        server.starttls()
        if settings.smtp_user and settings.smtp_password:
            server.login(settings.smtp_user, settings.smtp_password)
        server.send_message(msg)
        server.quit()
        return True
    except Exception as e:
        print(f"Error sending password reset email: {e}")
        return False
