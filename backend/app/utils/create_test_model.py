"""
Test database helpers — factories and reusable payloads.
"""

import datetime

from django.contrib.auth import get_user_model

from department.models import Department
from member.models import Member
from organization.models import Organization
from project.models import Project


class TestDb:
    password = "testpass123"
    email = "test@example.com"
    USER_PAYLOAD = {
        "email": "test@example.com",
        "password": "testpass123",
        "first_name": "Test",
        "last_name": "User",
    }

    ORG_PAYLOAD = {
        "name": "Test Organization",
        "address": "123 Business Ave, London",
        "description": "A test organization",
        "website": "https://testorg.example.com",
        "size": 50,
        "revenue": "500000.00",
        "currency": "GBP",
    }

    MEMBER_PAYLOAD = {
        "name": "Test Member",
        "email": "member@example.com",
        "working": Member.WorkingStatus.FULL_TIME,
        "salary": "50000.00",
        "role": Member.Role.STAFF,
        "skills": "Python, Django, React",
        "phone": "+44 345 773 377",
        "address": "234 New Street, London",
        "emergency_contact_name": "Jane Member",
        "emergency_contact_phone": "+443453636123",
        "emergency_contact_email": "emergency@example.com",
        "bank_name": "Test Bank",
        "bank_account_number": "46467373780",
        "social_security_number": "863 2627 33",
        "nin": "AZWEE323",
        "passport_number": "12333636",
        "hire_date": "2024-09-02",
        "termination_date": None,
        "is_active": True,
    }

    DEPARTMENT_PAYLOAD = {
        "name": "Engineering",
    }

    PROJECT_PAYLOAD = {
        "name": "Test Project",
        "description": "A test project description",
        "status": Project.Status.PLANNING,
        "priority": Project.Priority.MEDIUM,
        "start_date": "2024-09-01",
        "due_date": "2024-12-31",
    }

    PROJECT_PAYLOAD_ACTIVE = {
        **PROJECT_PAYLOAD,
        "name": "Active Project",
        "status": Project.Status.ACTIVE,
        "priority": Project.Priority.HIGH,
    }

    PROJECT_PAYLOAD_COMPLETED = {
        **PROJECT_PAYLOAD,
        "name": "Completed Project",
        "status": Project.Status.COMPLETED,
    }

    def create_user(self, email: str = "test@example.com",
                    **kwargs) -> get_user_model():
        """Create and return a new user."""
        defaults = {
            "password": self.password,
            "first_name": "Test",
            "last_name": "User",
        }
        defaults.update(kwargs)
        return get_user_model().objects.create_user(email=email, **defaults)

    # ── Organization factory ───────────────────────────────────────────────────

    def create_organization(self, user=None, **kwargs) -> Organization:
        """
        Create and return an Organization.
        Creates a fresh user if none is supplied.
        """
        if user is None:
            user = self.create_user(email="org_owner@example.com")

        defaults = {**self.ORG_PAYLOAD}
        defaults.update(kwargs)
        return Organization.objects.create(user=user, **defaults)

    # ── Member factory ─────────────────────────────────────────────────────────

    def create_member(
            self,
            organization: Organization,
            user=None,
            role: str = Member.Role.STAFF,
            email: str = "member@example.com",
            **kwargs,
    ) -> Member:
        """
        Create and return a Member linked to *organization*.
        Optionally link to an existing *user* account.
        """
        defaults = {
            **self.MEMBER_PAYLOAD,
            "email": email,
            "role": role,
            "is_active": True,
        }
        defaults.update(kwargs)

        member = Member.objects.create(organization=organization, **defaults)

        if user is not None:
            member.user = user
            member.save(update_fields=["user"])

        return member

    def create_manager(self, organization: Organization,
                       email: str = "manager@example.com", **kwargs) -> Member:
        return self.create_member(organization, role=Member.Role.MANAGER, email=email, **kwargs)

    def create_admin(self, organization: Organization,
                     email: str = "admin@example.com", **kwargs) -> Member:
        return self.create_member(organization, role=Member.Role.ADMIN, email=email, **kwargs)

    def create_owner_member(self, organization: Organization, user=None,
                            email: str = "owner_member@example.com",
                            **kwargs) -> Member:
        """Create a Member with OWNER role (distinct from the org's user/owner)."""
        return self.create_member(organization, user=user, role=Member.Role.OWNER,
                                  email=email, **kwargs)

    # ── Department factory ─────────────────────────────────────────────────────

    def create_department(
            self,
            organization: Organization,
            head: Member = None,
            name: str = "Engineering",
            **kwargs,
    ) -> Department:
        """Create and return a Department. Optionally assign a *head* member."""
        return Department.objects.create(
            organization=organization,
            name=name,
            head=head,
            **kwargs,
        )

    # ── Project factory ────────────────────────────────────────────────────────

    def create_project(
            self,
            organization: Organization,
            lead: Member = None,
            members: list = None,
            departments: list = None,
            **kwargs,
    ) -> Project:
        """
        Create and return a Project.

        Args:
            organization: The owning org.
            lead:         Optional lead Member.
            members:      Optional list of Member instances to assign.
            departments:  Optional list of Department instances to assign.
            **kwargs:     Override any PROJECT_PAYLOAD field.
        """
        defaults = {
            **self.PROJECT_PAYLOAD,
            "start_date": datetime.date(2024, 9, 1),
            "due_date": datetime.date(2024, 12, 31),
        }
        defaults.update(kwargs)

        project = Project.objects.create(
            organization=organization,
            lead=lead,
            **defaults,
        )

        if members:
            project.members.set(members)
        if departments:
            project.departments.set(departments)
            # Keep the symmetric Department.projects relationship in sync
            for dept in departments:
                try:
                    dept.projects.add(project)
                except Exception:
                    # If Department model doesn't have a 'projects' m2m (schema mismatch), ignore
                    pass

        return project

    # ── URL helpers ────────────────────────────────────────────────────────────
    # Centralise URL patterns so a route change only needs fixing in one place.

    @staticmethod
    def project_list_url() -> str:
        from django.urls import reverse
        return reverse("project:project-list")

    @staticmethod
    def project_detail_url(pk: int) -> str:
        from django.urls import reverse
        return reverse("project:project-detail", args=[pk])

    @staticmethod
    def project_assign_members_url(pk: int) -> str:
        from django.urls import reverse
        return reverse("project:project-assign-members", args=[pk])

    @staticmethod
    def project_assign_departments_url(pk: int) -> str:
        from django.urls import reverse
        return reverse("project:project-assign-departments", args=[pk])

    @staticmethod
    def project_change_lead_url(pk: int) -> str:
        from django.urls import reverse
        return reverse("project:project-change-lead", args=[pk])
