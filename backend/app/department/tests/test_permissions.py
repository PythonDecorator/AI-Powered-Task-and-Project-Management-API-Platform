"""
Tests for Department permissions.
"""
from django.test import TestCase
from rest_framework.test import APIRequestFactory

from department.permissions import CanManageDepartment
from utils.create_test_model import TestDb


class CanManageDepartmentTest(TestCase):
    def setUp(self):
        self.db = TestDb()
        self.factory = APIRequestFactory()
        self.permission = CanManageDepartment()

        self.user = self.db.create_user(email="perm_user@example.com")
        self.other_user = self.db.create_user(email="other_user@example.com")

        self.org = self.db.create_organization(user=self.user)
        self.other_org = self.db.create_organization(user=self.other_user)

        # Active manager in org
        self.manager = self.db.create_member(organization=self.org, user=self.user, email="man@example.com",
                                             role="manager", is_active=True)
        # Inactive member
        self.inactive = self.db.create_member(organization=self.org, email="inactive@example.com", is_active=False)
        # Staff (no manage permission)
        self.staff_user = self.db.create_user(email="staff_user@example.com")
        self.staff = self.db.create_member(organization=self.org, user=self.staff_user, email="staff@example.com",
                                           role="staff", is_active=True)

    def test_has_permission_authenticated_active_member(self):
        request = self.factory.get("/")
        request.user = self.user
        self.assertTrue(self.permission.has_permission(request, view=None))

    def test_has_permission_unauthenticated(self):
        request = self.factory.get("/")
        request.user = None
        self.assertFalse(self.permission.has_permission(request, view=None))

    def test_has_permission_inactive_member(self):
        request = self.factory.get("/")
        request.user = self.inactive.user if hasattr(self.inactive, 'user') else None
        # Ensure inactive user cannot pass the base is_active gate
        self.assertFalse(self.permission.has_permission(request, view=None))

    def test_role_check_allows_manager(self):
        request = self.factory.get("/")
        request.user = self.user
        # has_permission already checks active + role
        self.assertTrue(self.permission.has_permission(request, view=None))

    def test_role_check_denies_staff(self):
        request = self.factory.get("/")
        request.user = self.staff_user
        self.assertFalse(self.permission.has_permission(request, view=None))
