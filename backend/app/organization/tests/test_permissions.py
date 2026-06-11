"""
Tests for Organization permissions.
"""
from django.test import TestCase
from rest_framework.test import APIRequestFactory

from organization.models import Organization
from organization.permissions import IsOrgOwner
from utils.create_test_model import TestDb


class IsOrgOwnerTest(TestCase):
    def setUp(self):
        self.db = TestDb()
        self.factory = APIRequestFactory()
        self.permission = IsOrgOwner()

        self.owner_user = self.db.create_user(email="owner@example.com")
        self.other_user = self.db.create_user(email="other@example.com")

        self.organization = self.db.create_organization(user=self.owner_user)

    def test_has_permission_authenticated_user(self):
        """Authenticated users have permission at the list level."""
        request = self.factory.get("/")
        request.user = self.owner_user
        self.assertTrue(self.permission.has_permission(request, view=None))

    def test_has_permission_unauthenticated_user(self):
        """Unauthenticated users do not have permission."""
        request = self.factory.get("/")
        request.user = None
        self.assertFalse(self.permission.has_permission(request, view=None))

    def test_has_object_permission_owner(self):
        """Organization owner has object permission."""
        request = self.factory.get("/")
        request.user = self.owner_user
        self.assertTrue(
            self.permission.has_object_permission(request, view=None, obj=self.organization)
        )

    def test_has_object_permission_non_owner(self):
        """Non-owner user does not have object permission."""
        request = self.factory.get("/")
        request.user = self.other_user
        self.assertFalse(
            self.permission.has_object_permission(request, view=None, obj=self.organization)
        )

    def test_has_object_permission_unauthenticated(self):
        """Unauthenticated user does not have object permission."""
        request = self.factory.get("/")
        request.user = None
        self.assertFalse(
            self.permission.has_object_permission(request, view=None, obj=self.organization)
        )
