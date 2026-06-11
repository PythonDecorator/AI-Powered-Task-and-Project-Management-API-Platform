"""
Tests for Project permissions.
"""
from django.test import TestCase
from rest_framework.test import APIRequestFactory

from project.permissions import CanManageProject
from utils.create_test_model import TestDb


class ProjectPermissionsTest(TestCase):
    def setUp(self):
        self.db = TestDb()
        self.factory = APIRequestFactory()
        self.permission = CanManageProject()

        self.user = self.db.create_user(email="perm_user@example.com")
        self.org = self.db.create_organization(user=self.user)
        self.manager = self.db.create_manager(organization=self.org, user=self.user, is_active=True)
        self.staff_user = self.db.create_user(email="staff_user@example.com")
        self.staff = self.db.create_member(organization=self.org, user=self.staff_user, role="staff", is_active=True)

    def test_manager_has_permission(self):
        request = self.factory.get("/")
        request.user = self.user
        self.assertTrue(self.permission.has_permission(request, view=None))

    def test_staff_denied(self):
        request = self.factory.get("/")
        request.user = self.staff_user
        self.assertFalse(self.permission.has_permission(request, view=None))
