"""
Project Models
"""
from django.db import models

from core.models import BaseModel


class Project(BaseModel):
    # ── Choices ────────────────────────────────────────────────────────────────

    class Status(models.TextChoices):
        PLANNING   = "planning",   "Planning"
        ACTIVE     = "active",     "Active"
        ON_HOLD    = "on_hold",    "On Hold"
        COMPLETED  = "completed",  "Completed"
        CANCELLED  = "cancelled",  "Cancelled"

    class Priority(models.TextChoices):
        LOW      = "low",      "Low"
        MEDIUM   = "medium",   "Medium"
        HIGH     = "high",     "High"
        CRITICAL = "critical", "Critical"

    # ── Fields ─────────────────────────────────────────────────────────────────

    name        = models.CharField(max_length=200, db_index=True)
    description = models.TextField(blank=True)
    status      = models.CharField(
        max_length=20,
        choices=Status.choices,
        default=Status.PLANNING,
        db_index=True,
    )
    priority = models.CharField(
        max_length=20,
        choices=Priority.choices,
        default=Priority.MEDIUM,
        db_index=True,
    )
    start_date   = models.DateField()
    due_date     = models.DateField(null=True, blank=True)
    completed_at = models.DateTimeField(null=True, blank=True)

    # ── Relationships ──────────────────────────────────────────────────────────

    organization = models.ForeignKey(
        "organization.Organization",
        on_delete=models.CASCADE,
        related_name="projects",
    )
    # The project manager / lead
    lead = models.ForeignKey(
        "member.Member",
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="led_projects",
    )
    departments = models.ManyToManyField(
        "department.Department",
        blank=True,
        related_name="assigned_projects",
    )
    members = models.ManyToManyField(
        "member.Member",
        blank=True,
        related_name="projects",
    )

    class Meta:
        # Project names must be unique within an organization.
        unique_together = ("organization", "name")
        ordering = ["-id"]

    def __str__(self):
        return f"{self.name} [{self.status}] — {self.organization.name}"
