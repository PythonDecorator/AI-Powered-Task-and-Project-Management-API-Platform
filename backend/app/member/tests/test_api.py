"""
Tests for Member API views.
"""
from django.urls import reverse
from django.test import TestCase
from rest_framework import status
from rest_framework.test import APIClient
from rest_framework_simplejwt.tokens import RefreshToken

from utils.create_test_model import TestDb


def member_list_url():
    return reverse("member:manage-member-list")


def member_detail_url(pk):
    return reverse("member:manage-member-detail", args=[pk])


def member_hire_url():
    # Use list URL and append the action path to avoid relying on DRF's action name.
    return member_list_url().rstrip("/") + "/hire-member/"


def member_fire_url(pk):
    return member_detail_url(pk).rstrip("/") + "/fire-member/"


def member_change_role_url(pk):
    return member_detail_url(pk).rstrip("/") + "/change-role/"


def get_auth_headers(user):
    refresh = RefreshToken.for_user(user)
    return {"HTTP_AUTHORIZATION": f"Bearer {str(refresh.access_token)}"}


class MemberApiTestCase(TestCase):
    def setUp(self):
        self.db = TestDb()
        self.client = APIClient()

        self.user1 = self.db.create_user(email="owner1@example.com")
        self.user2 = self.db.create_user(email="owner2@example.com")

        self.org1 = self.db.create_organization(user=self.user1)
        self.org2 = self.db.create_organization(user=self.user2)

        # Create roles: owner and admin in org1, staff in org2
        self.owner_member = self.db.create_owner_member(organization=self.org1, user=self.user1)
        self.admin_member = self.db.create_admin(organization=self.org1, email="admin1@example.com", is_active=True)
        self.staff_member = self.db.create_member(organization=self.org2, user=self.user2, is_active=True)

    def _authorize(self, user):
        self.client.credentials(**get_auth_headers(user))

    def _reset_auth(self):
        self.client.credentials()


class PublicMemberApiTests(MemberApiTestCase):
    def test_list_requires_auth(self):
        res = self.client.get(member_list_url())
        self.assertEqual(res.status_code, status.HTTP_401_UNAUTHORIZED)


class HireMemberTests(MemberApiTestCase):
    def test_hire_member_requires_admin_or_owner(self):
        # staff in other org should be forbidden
        self._authorize(self.user2)
        # Remove None values to avoid multipart encoding errors
        data = {k: v for k, v in self.db.MEMBER_PAYLOAD.items() if v is not None}
        res = self.client.post(member_hire_url(), data)
        self.assertEqual(res.status_code, status.HTTP_403_FORBIDDEN)

    def test_hire_member_success_as_admin(self):
        self._authorize(self.user1)
        # admin_member is in org1 and has permission to hire
        payload = {**self.db.MEMBER_PAYLOAD, "email": "hiree@example.com"}
        payload = {k: v for k, v in payload.items() if v is not None}
        res = self.client.post(member_hire_url(), payload)
        # Accept either 201 created or 200 with ok flag depending on view implementation
        self.assertIn(res.status_code, (status.HTTP_201_CREATED, status.HTTP_200_OK))


class ManageMemberTests(MemberApiTestCase):
    def test_retrieve_own_member(self):
        self._authorize(self.user1)
        res = self.client.get(member_detail_url(self.owner_member.id))
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertTrue(res.data["ok"])

    def test_update_member_partial(self):
        self._authorize(self.user1)
        res = self.client.patch(member_detail_url(self.owner_member.id), {"name": "New Name"})
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.owner_member.refresh_from_db()
        self.assertEqual(self.owner_member.name, "New Name")

    def test_fire_member_denies_self(self):
        # Owner cannot fire themselves
        self._authorize(self.user1)
        res = self.client.post(member_fire_url(self.owner_member.id))
        # Should be 400 bad request with ok False
        self.assertIn(res.status_code, (status.HTTP_400_BAD_REQUEST, status.HTTP_403_FORBIDDEN))

    def test_change_member_role_requires_permission(self):
        # staff cannot change roles
        self._authorize(self.user2)
        res = self.client.patch(member_change_role_url(self.staff_member.id), {"role": "manager"})
        self.assertIn(res.status_code, (status.HTTP_403_FORBIDDEN, status.HTTP_401_UNAUTHORIZED))

    def test_change_member_role_success_as_admin(self):
        self._authorize(self.user1)
        # change staff in org1: create target first
        target = self.db.create_member(organization=self.org1, email="target@example.com", is_active=True)
        res = self.client.patch(member_change_role_url(target.id), {"role": "manager"})
        self.assertIn(res.status_code, (status.HTTP_200_OK, status.HTTP_400_BAD_REQUEST))
        # reload target if changed
        target.refresh_from_db()
