from celery import shared_task

from utils.email_templates import EMAIL_TEMPLATES
from utils.send_emails import send_email


@shared_task
def send_confirmation_email_task(data):
    email_config = EMAIL_TEMPLATES["email_confirmation_token"]
    subject = email_config["subject"]
    heading = email_config["heading"]
    message = email_config["message"]
    template_name = email_config["template_name"]

    context = {
        "first_name": data["first_name"],
        "heading": heading,
        "message": message.format(token=data["token"]),
    }

    send_email(
        subject=subject,
        recipient_list=[data["email"]],
        plain_text_body=subject,
        context=context,
        template_name=template_name
    )


@shared_task
def send_password_reset_code_task(data):
    email_config = EMAIL_TEMPLATES["password_reset_code"]
    subject = email_config["subject"]
    heading = email_config["heading"]
    message = email_config["message"]
    template_name = email_config["template_name"]

    context = {
        "first_name": data["first_name"],
        "heading": heading,
        "message": message.format(token=data["token"]),
    }

    send_email(
        subject=subject,
        recipient_list=[data["email"]],
        plain_text_body=subject,
        context=context,
        template_name=template_name
    )
