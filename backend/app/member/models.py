"""
Member Model
"""

from django.conf import settings
from django.db import models

from core.models import BaseModel
from utils.helpers import generate_upload_path


def image_upload_file_path(instance, filename):  # noqa
    return generate_upload_path("resume", filename)


class Member(BaseModel):
    class WorkingStatus(models.TextChoices):
        FULL_TIME = "Full-time", "Full-time"
        PART_TIME = "Part-time", "Part-time"
        CONTRACT = "Contract", "Contract"
        INTERN = "Intern", "Intern"

    class Role(models.TextChoices):
        """
        Must stay in sync with ROLE_PERMISSIONS in organization/permissions.py.
        TextChoices enforces valid values at the DB + form layer.
        """
        STAFF = "staff", "Staff"
        MANAGER = "manager", "Manager"
        ADMIN = "admin", "Admin"
        OWNER = "owner", "Owner"

    name = models.CharField(max_length=100, db_index=True)
    email = models.EmailField()
    working = models.CharField(
        max_length=20, choices=WorkingStatus.choices, default=WorkingStatus.FULL_TIME
    )
    salary = models.DecimalField(max_digits=10, decimal_places=2, db_index=True)
    role = models.CharField(
        max_length=20,
        choices=Role.choices,
        default=Role.STAFF,
        db_index=True,
        help_text="Controls what actions this member may perform (see ROLE_PERMISSIONS).",
    )

    # Sensitive / HR fields
    nin = models.CharField(max_length=50, blank=True)
    skills = models.TextField(null=True, blank=True)
    phone = models.CharField(max_length=16, null=True, blank=True)
    address = models.TextField()
    emergency_contact_name = models.CharField(max_length=100, blank=True)
    emergency_contact_phone = models.CharField(max_length=15, blank=True)
    emergency_contact_email = models.EmailField(blank=True)
    resume = models.FileField(upload_to=image_upload_file_path, null=True, blank=True)
    bank_name = models.CharField(max_length=100, blank=True)
    bank_account_number = models.CharField(max_length=30, blank=True)
    social_security_number = models.CharField(max_length=20, blank=True)
    passport_number = models.CharField(max_length=20, null=True, blank=True)
    hire_date = models.DateField()
    termination_date = models.DateField(null=True, blank=True)
    is_active = models.BooleanField(default=False)

    # ── Relationships
    user = models.OneToOneField(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        related_name="member",
        blank=True,
        null=True,
    )
    # Traverse upward via member.manager,
    # downward via member.direct_reports.all()
    manager = models.ForeignKey(
        "self",
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="direct_reports",
    )
    departments = models.ManyToManyField(
        "department.Department", blank=True, related_name="members"
    )
    organization = models.ForeignKey(
        "organization.Organization",
        on_delete=models.CASCADE,
        related_name="members",
    )

    class Meta:
        # One email per org — prevents duplicate hires of the same address.
        unique_together = ("organization", "email")

    def __str__(self):
        return f"{self.name} ({self.get_role_display()}) — {self.organization_id}"

    def save(self, *args, **kwargs):
        """Delete old resume file from storage when replaced."""
        if self.pk:
            try:
                old = Member.objects.get(pk=self.pk)
                if old.resume and old.resume != self.resume:
                    old.resume.delete(save=False)
            except Member.DoesNotExist:
                pass
        super().save(*args, **kwargs)


class MemberInvitationToken(BaseModel):
    """
    Short-lived token emailed to a new hire so they can confirm and activate
    their Member record. Deleted on successful confirmation.
    """
    organization = models.ForeignKey(
        "organization.Organization", on_delete=models.CASCADE
    )
    # email is stored alongside the token so confirmation can look up the
    # right Member row without decoding the JWT in the lookup itself.
    email = models.EmailField()
    token = models.CharField(max_length=255, unique=True)

    class Meta:
        unique_together = ("organization", "email")

    def __str__(self):
        return f"Invite {self.email} → org {self.organization_id}"
