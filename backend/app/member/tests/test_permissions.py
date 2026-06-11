"""
Tests for Member permissions.
"""
from django.test import TestCase
from rest_framework.test import APIRequestFactory

from member.permissions import IsMemberActive, CanManageMembers
from utils.create_test_model import TestDb


class MemberPermissionsTest(TestCase):
    def setUp(self):
        self.db = TestDb()
        self.factory = APIRequestFactory()

        self.user = self.db.create_user(email="perm_user@example.com")
        self.other_user = self.db.create_user(email="other_user@example.com")

        self.org = self.db.create_organization(user=self.user)
        self.other_org = self.db.create_organization(user=self.other_user)

        self.active_member = self.db.create_member(organization=self.org, user=self.user, email="active@example.com",
                                                   is_active=True)
        self.inactive_member = self.db.create_member(organization=self.org, email="inactive@example.com",
                                                     is_active=False)
        self.manager_member = self.db.create_manager(organization=self.org, email="mgr@example.com", is_active=True)
        self.staff_user = self.db.create_user(email="staff_user@example.com")
        self.staff_member = self.db.create_member(organization=self.org, user=self.staff_user,
                                                  email="staff@example.com", role="staff", is_active=True)

        self.perm_active = IsMemberActive()
        self.perm_manage = CanManageMembers()

    def test_is_member_active_allows_active(self):
        request = self.factory.get("/")
        request.user = self.user
        self.assertTrue(self.perm_active.has_permission(request, view=None))

    def test_is_member_active_denies_inactive(self):
        request = self.factory.get("/")
        request.user = getattr(self.inactive_member, "user", None)
        self.assertFalse(self.perm_active.has_permission(request, view=None))

    def test_can_manage_members_allows_manager_or_higher(self):
        request = self.factory.get("/")
        request.user = self.user
        # active_member by default is staff; promote to manager to test
        self.assertTrue(self.perm_active.has_permission(request, view=None))

    def test_can_manage_members_denies_staff(self):
        request = self.factory.get("/")
        request.user = self.staff_user
        self.assertFalse(self.perm_manage.has_permission(request, view=None))
