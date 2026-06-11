from django.db.models.signals import post_save
from django.dispatch import receiver

from .models import Employee, EmployeePermission


@receiver(post_save, sender=Employee)
def create_employee_permissions(sender, instance, created, **kwargs):
    if created:
        EmployeePermission.objects.create(employee=instance)
