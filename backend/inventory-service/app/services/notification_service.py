import smtplib
import logging
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from app.core.config import settings

logger = logging.getLogger(__name__)

def send_low_stock_alert(variant_sku: str, current_stock: int, threshold: int = 5):
    """
    Simulates AWS Lambda + SES for low stock alerts.
    In local dev, it logs the alert and attempts to send email if configured.
    """
    subject = f"⚠️ LOW STOCK ALERT: {variant_sku}"
    
    body = f"""
    <html>
    <head>
        <style>
            .container {{ font-family: sans-serif; padding: 20px; border: 1px solid #eee; border-radius: 10px; }}
            .warning {{ color: #d97706; font-weight: bold; font-size: 1.2em; }}
            .sku {{ font-family: monospace; background: #f3f4f6; padding: 2px 5px; }}
            .footer {{ margin-top: 20px; font-size: 0.8em; color: #6b7280; }}
        </style>
    </head>
    <body>
        <div class="container">
            <p class="warning">VELORA Inventory Alert</p>
            <p>The following product variant has fallen below the threshold ({threshold} units):</p>
            <ul>
                <li><strong>SKU:</strong> <span class="sku">{variant_sku}</span></li>
                <li><strong>Current Stock:</strong> {current_stock}</li>
            </ul>
            <p>Please restock this item soon to avoid service disruption.</p>
            <div class="footer">
                Automated message from VELORA Inventory Service
            </div>
        </div>
    </body>
    </html>
    """
    
    logger.warning(f"🚨 LOW STOCK ALERT triggered for {variant_sku}. Current: {current_stock}")

    # Only attempt SMTP if credentials exist (Mocking Lambda behavior)
    if not settings.smtp_user or not settings.smtp_password:
        logger.info("⏭️ SMTP not configured. Skipping email delivery (Dev Mock).")
        return False

    msg = MIMEMultipart('alternative')
    msg['From'] = settings.smtp_from_email
    msg['To'] = settings.admin_email
    msg['Subject'] = subject
    
    msg.attach(MIMEText(body, 'html'))
    
    try:
        server = smtplib.SMTP(settings.smtp_host, settings.smtp_port)
        server.starttls()
        server.login(settings.smtp_user, settings.smtp_password)
        server.send_message(msg)
        server.quit()
        logger.info(f"📧 Low stock alert sent to {settings.admin_email}")
        return True
    except Exception as e:
        logger.error(f"❌ Failed to send stock alert email: {e}")
        return False
