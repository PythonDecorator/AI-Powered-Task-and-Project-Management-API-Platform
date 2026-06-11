"""
Organization Models
"""

from django.conf import settings
from django.core.validators import MinValueValidator
from django.db import models

from core.models import BaseModel
from utils.helpers import generate_upload_path


def image_upload_file_path(instance, filename):  # noqa
    return generate_upload_path("organization", filename)


class Organization(BaseModel):
    user = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="organization")
    name = models.CharField(max_length=100)
    logo = models.ImageField(upload_to=image_upload_file_path, null=True, blank=True)
    address = models.TextField()
    description = models.TextField()
    website = models.URLField(null=True, blank=True)
    size = models.PositiveIntegerField(help_text="Number of members", validators=[MinValueValidator(1)])
    revenue = models.DecimalField(max_digits=15, decimal_places=2, validators=[MinValueValidator(0)])
    currency = models.CharField(max_length=3, default="USD", help_text="(e.g. USD, GBP, EUR)")
    parent_organization = models.ForeignKey("self", on_delete=models.SET_NULL, null=True, blank=True,
                                            related_name="subsidiaries")
    social_media_links = models.JSONField(null=True, blank=True)
    established_date = models.DateField(null=True, blank=True)

    def __str__(self):
        return f"{self.name} ({self.user.email})"

    # Logo lifecycle
    def save(self, *args, **kwargs):
        """Delete the old Logo file from storage when replaced."""
        if self.pk:
            try:
                old = Organization.objects.get(pk=self.pk)
                if old.logo and old.logo != self.logo:
                    old.logo.delete(save=False)
            except Organization.DoesNotExist:
                pass
        super().save(*args, **kwargs)


class OrganizationEmail(models.Model):
    organization = models.ForeignKey(Organization, on_delete=models.CASCADE, related_name="organization_emails")
    email = models.EmailField()

    class Meta:
        unique_together = ("organization", "email")

    def __str__(self):
        return self.email
