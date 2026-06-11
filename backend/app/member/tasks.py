from celery import shared_task
from utils.email_templates import EMAIL_TEMPLATES
from utils.send_emails import send_email


@shared_task
def send_invitation_email_to_member_task(data):
    email_config = EMAIL_TEMPLATES["send_organization_member_invite_email"]
    subject = email_config["subject"]
    heading = email_config["heading"]
    message = email_config["message"]
    template_name = email_config["template_name"]

    context = {
        "first_name": data["first_name"],
        "heading": heading,
        "message": message.format(token=data["invitation_token"]),
    }

    send_email(
        subject=subject,
        recipient_list=[data["email"]],
        plain_text_body=subject,
        context=context,
        template_name=template_name
    )
