from celery import shared_task
from utils.send_emails import send_invitation_email_to_employee
from celery.utils.log import get_task_logger

logger = get_task_logger(__name__)


@shared_task
def send_invitation_email_to_employee_task(data):
    send_invitation_email_to_employee(data)
    logger.info("Sent invitation email")
    return "Sent invitation email"
