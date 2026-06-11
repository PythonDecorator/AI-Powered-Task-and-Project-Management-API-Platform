"""
Employee Model
"""
import os
import uuid

from django.conf import settings
from django.db import models

from company.permissions import assign_ceo_permissions


def contract_upload_file_path(instance, filename):  # noqa
    """Generate file path for employee contract."""
    ext = os.path.splitext(filename)[1]
    filename = f'{uuid.uuid4()}{ext}'

    return os.path.join('uploads', 'contract', filename)


def resume_upload_file_path(instance, filename):  # noqa
    """Generate file path for employee contract."""
    ext = os.path.splitext(filename)[1]
    filename = f'{uuid.uuid4()}{ext}'

    return os.path.join('uploads', 'resume', filename)


class Employee(models.Model):
    EMPLOYEE_STATUS_CHOICES = (
        ('Full-time', 'Full-time'),
        ('Part-time', 'Part-time'),
        ('Contract', 'Contract'),
        ('Intern', 'Intern'),
    )
    name = models.CharField(max_length=100, db_index=True)
    email = models.EmailField()
    status = models.CharField(max_length=20, choices=EMPLOYEE_STATUS_CHOICES, default="Full-time")
    salary = models.DecimalField(max_digits=10, decimal_places=2, db_index=True)
    role = models.CharField(max_length=50)
    skills = models.TextField(null=True, blank=True)
    phone = models.CharField(max_length=15, null=True, blank=True)
    address = models.TextField()
    emergency_contact_name = models.CharField(max_length=100)
    emergency_contact_relationship = models.CharField(max_length=50)
    emergency_contact_phone = models.CharField(max_length=15)
    emergency_contact_email = models.EmailField()
    resume = models.FileField(upload_to=resume_upload_file_path, null=True, blank=True)
    contract = models.FileField(upload_to=contract_upload_file_path, null=True, blank=True)
    bank_name = models.CharField(max_length=100)
    bank_account_number = models.CharField(max_length=30)
    social_security_number = models.CharField(max_length=20)
    passport_number = models.CharField(max_length=20, null=True, blank=True)
    hire_date = models.DateField()
    termination_date = models.DateField(null=True, blank=True)
    is_active = models.BooleanField(default=False)

    # RELATIONSHIPS
    departments = models.ManyToManyField("department.Department", blank=True, related_name='employees')
    manager = models.ForeignKey('self', on_delete=models.SET_NULL, null=True, blank=True,
                                related_name='direct_reports')
    subordinates = models.ManyToManyField('self', symmetrical=False, blank=True, related_name='managers',
                                          help_text="The employees that are directly under this employee")
    user = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, related_name="employee",
                                blank=True, null=True)
    company = models.ForeignKey("company.Company", on_delete=models.CASCADE)

    def save(self, *args, **kwargs):
        super().save(*args, **kwargs)
        assign_ceo_permissions(self)

    def __str__(self):
        return self.name


class EmployeePermission(models.Model):
    fire_employees = models.BooleanField(default=False)
    hire_employees = models.BooleanField(default=False)
    manage_employees = models.BooleanField(default=False)
    give_employees_permissions = models.BooleanField(default=False)
    manage_department = models.BooleanField(default=False)
    employee = models.OneToOneField(Employee, on_delete=models.CASCADE, related_name="permissions")

    def __str__(self):
        return self.employee.name


class EmployeeInvitationToken(models.Model):
    company = models.ForeignKey("company.Company", on_delete=models.CASCADE)
    token = models.CharField(max_length=255)
    created_at = models.DateTimeField(auto_now_add=True)
