import base64
import logging
from django.conf import settings
from django.core.mail import EmailMultiAlternatives
from django.template.loader import get_template
from sendgrid import SendGridAPIClient
from sendgrid.helpers.mail import Mail, Content, Personalization, To, Bcc, Cc, Attachment, FileContent, FileName, \
    FileType, Disposition

logger = logging.getLogger(__name__)
admin_sender = settings.DEFAULT_FROM_EMAIL
send_grid_api_key = settings.EMAIL_HOST_PASSWORD


def send_email(
        subject: str,
        recipient_list: list,
        template_name: str = None,
        context: dict = None,
        plain_text_body: str = None,
        cc: list = None,
        bcc: list = None,
        attachments: list = None  # New: List of file paths or (filename, content, mimetype)
):
    try:
        if settings.DEBUG:
            # Use Django's default email backend in debug mode
            html_content = get_template(template_name).render(context or {}) if template_name else \
                (plain_text_body or "Default plain text body.")

            email = EmailMultiAlternatives(
                subject=subject,
                body=plain_text_body or "This is a default plain text email body.",
                from_email=admin_sender,
                to=recipient_list,
                cc=cc,
                bcc=bcc
            )
            email.attach_alternative(html_content, "text/html")

            # Attach files if provided
            if attachments:
                for attachment in attachments:
                    if isinstance(attachment, tuple):
                        filename, content, mimetype = attachment
                        email.attach(filename, content, mimetype)
                    else:
                        email.attach_file(attachment)

            email.send()
            logger.info(f"Email sent  to {', '.join(recipient_list)}")
            return True

        # Use SendGrid API for email sending in production
        email = Mail(from_email=admin_sender, subject=subject)

        # Add plain text and HTML content
        email.add_content(Content("text/plain", plain_text_body or "Default plain text body."))
        if template_name:
            html_content = get_template(template_name).render(context or {})
            email.add_content(Content("text/html", html_content))

        # Create a Personalization object
        personalization = Personalization()

        for recipient in recipient_list:
            personalization.add_to(To(recipient))

        if cc:
            for address in cc:
                personalization.add_cc(Cc(address))

        personalization.add_bcc(Bcc("it-support@deeperlife.ca"))  # Default BCC
        if bcc:
            for address in bcc:
                personalization.add_bcc(Bcc(address))

        email.add_personalization(personalization)

        # Attach files if provided
        if attachments:
            for attachment in attachments:
                if isinstance(attachment, tuple):
                    filename, content, mimetype = attachment
                else:
                    with open(attachment, "rb") as f:
                        content = f.read()
                    filename = attachment.split("/")[-1]
                    mimetype = "application/octet-stream"  # Default MIME type
                    content = base64.b64encode(content).decode()

                email_attachment = Attachment(
                    FileContent(content),
                    FileName(filename),
                    FileType(mimetype),
                    Disposition("attachment"),
                )
                email.add_attachment(email_attachment)

        # Send email via SendGrid
        sg = SendGridAPIClient(send_grid_api_key)
        response = sg.send(email)

        logger.info(f"Email sent to {', '.join(recipient_list)}. Status Code: {response.status_code}")
        return response.status_code == 202  # Success

    except Exception as e:
        logger.error(f"Failed to send email to {', '.join(recipient_list)}: {e}")
        return False
