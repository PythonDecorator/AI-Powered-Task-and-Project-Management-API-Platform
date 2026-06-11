from django.db import models
from company.models import Company
from company.permissions import assign_department_permissions_to_hod


class Department(models.Model):
    company = models.ForeignKey(Company, on_delete=models.CASCADE)
    name = models.CharField(max_length=100)

    # RELATIONSHIPS
    head = models.OneToOneField("employee.Employee", on_delete=models.SET_NULL, null=True, blank=True)
    projects = models.ManyToManyField('projects.Project', related_name="department_projects", blank=True)

    def __str__(self):
        return self.name

    def save(self, *args, **kwargs):
        super().save(*args, **kwargs)
        assign_department_permissions_to_hod(employee=self.head)
