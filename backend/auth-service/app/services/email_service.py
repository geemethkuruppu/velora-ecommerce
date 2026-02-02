import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from app.core.config import settings

def send_verification_email(email: str, token: str, full_name: str):
    """
    Send a verification email to the user with a verification link.
    """
    # Verification link (Frontend URL from environment)
    verification_link = f"{settings.frontend_url}/verify-email?token={token}"
    
    subject = "Verify Your VELORA Account"
    
    html_content = f"""
    <!DOCTYPE html>
    <html>
    <head>
        <style>
            body {{
                margin: 0;
                padding: 0;
                font-family: 'Georgia', serif;
                background-color: #f5f5f0;
            }}
            .container {{
                max-width: 600px;
                margin: 40px auto;
                background: linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%);
                border-radius: 0;
                overflow: hidden;
            }}
            .header {{
                background: #000;
                padding: 40px;
                text-align: center;
                border-bottom: 2px solid #d4af37;
            }}
            .logo {{
                font-size: 48px;
                font-weight: bold;
                color: #d4af37;
                letter-spacing: 8px;
                margin-bottom: 10px;
            }}
            .tagline {{
                color: #fff;
                font-size: 11px;
                letter-spacing: 3px;
                text-transform: uppercase;
            }}
            .content {{
                background-color: #fff;
                padding: 50px 40px;
                color: #333;
            }}
            .greeting {{
                font-size: 16px;
                color: #666;
                margin-bottom: 30px;
            }}
            .message {{
                font-size: 15px;
                line-height: 1.8;
                color: #444;
                margin-bottom: 35px;
            }}
            .button-container {{
                text-align: center;
                margin: 40px 0;
            }}
            .button {{
                display: inline-block;
                background-color: #000;
                color: #d4af37 !important;
                text-decoration: none;
                padding: 18px 50px;
                font-size: 13px;
                font-weight: bold;
                letter-spacing: 2px;
                text-transform: uppercase;
                border: 2px solid #d4af37;
                transition: all 0.3s;
            }}
            .note {{
                font-size: 13px;
                color: #888;
                margin-top: 30px;
                padding-top: 30px;
                border-top: 1px solid #eee;
            }}
            .footer {{
                background-color: #000;
                padding: 30px;
                text-align: center;
                color: #d4af37;
                font-size: 11px;
                letter-spacing: 2px;
            }}
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <div class="logo">VELORA</div>
                <div class="tagline">Luxury Redefined</div>
            </div>
            <div class="content">
                <div class="greeting">Dear {full_name},</div>
                <div class="message">
                    Welcome to VELORA. Your administrator account has been created.<br><br>
                    To complete your registration and access the dashboard, please verify your email address by clicking the button below.
                </div>
                <div class="button-container">
                    <a href="{verification_link}" class="button">Verify Email Address</a>
                </div>
                <div class="note">
                    This verification link will expire in {settings.verification_token_expire_hours} hours.<br><br>
                    If you did not request this account, please disregard this email.
                </div>
            </div>
            <div class="footer">
                © 2026 VELORA • LUXURY E-COMMERCE PLATFORM
            </div>
        </div>
    </body>
    </html>
    """
    
    # Plain text fallback
    plain_text = f"""
    Dear {full_name},

    Welcome to VELORA. Your administrator account has been created.

    Please verify your email address by visiting this link:
    {verification_link}

    This link will expire in {settings.verification_token_expire_hours} hours.

    If you did not request this account, please disregard this email.

    Best regards,
    VELORA Team
    """
    
    msg = MIMEMultipart('alternative')
    msg['From'] = settings.smtp_from_email
    msg['To'] = email
    msg['Subject'] = subject
    
    msg.attach(MIMEText(plain_text, 'plain'))
    msg.attach(MIMEText(html_content, 'html'))
    
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
    reset_link = f"{settings.frontend_url}/reset-password?token={token}"
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
