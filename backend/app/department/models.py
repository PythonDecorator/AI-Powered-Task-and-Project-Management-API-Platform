"""
Department Models
"""
from django.db import models

from core.models import BaseModel


class Department(BaseModel):
    organization = models.ForeignKey("organization.Organization", on_delete=models.CASCADE,
                                     related_name="departments")
    name = models.CharField(max_length=100)
    # The head is a Member; set to NULL if that member is removed.
    head = models.OneToOneField("member.Member", on_delete=models.SET_NULL, null=True, blank=True,
                                related_name="headed_department")
    projects = models.ManyToManyField("project.Project", related_name="department_projects", blank=True)

    class Meta:
        # Department names must be unique within an organization.
        unique_together = ("organization", "name")

    def __str__(self):
        return f"{self.name} ({self.organization.name})"
