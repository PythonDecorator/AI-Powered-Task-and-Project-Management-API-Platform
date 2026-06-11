"""
Tests for Department API views.
"""
from django.urls import reverse
from django.test import TestCase
from rest_framework import status
from rest_framework.test import APIClient
from rest_framework_simplejwt.tokens import RefreshToken

from department.models import Department
from utils.create_test_model import TestDb


# ── URLs ───────────────────────────────────────────────────────────────────────

def dept_list_url():
    return reverse("department:department-list")


def dept_detail_url(pk):
    return reverse("department:department-detail", args=[pk])


# ── Helpers ────────────────────────────────────────────────────────────────────

def get_auth_headers(user):
    refresh = RefreshToken.for_user(user)
    return {"HTTP_AUTHORIZATION": f"Bearer {str(refresh.access_token)}"}


class DepartmentApiTestCase(TestCase):
    def setUp(self):
        self.db = TestDb()
        self.client = APIClient()

        # Create two users and orgs
        self.user1 = self.db.create_user(email="owner1@example.com")
        self.user2 = self.db.create_user(email="owner2@example.com")

        self.org1 = self.db.create_organization(user=self.user1)
        self.org2 = self.db.create_organization(user=self.user2)

        # Ensure each user has an active Member record in their org
        self.member1 = self.db.create_member(organization=self.org1, user=self.user1,
                                             email="m1@example.com", role="manager", is_active=True)
        self.member2 = self.db.create_member(organization=self.org2, user=self.user2,
                                             email="m2@example.com", role="manager", is_active=True)

    def _authorize(self, user):
        self.client.credentials(**get_auth_headers(user))

    def _reset_auth(self):
        self.client.credentials()


class PublicDepartmentApiTests(DepartmentApiTestCase):
    def test_create_requires_auth(self):
        res = self.client.post(dept_list_url(), {"name": "Engineering"})
        self.assertEqual(res.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_retrieve_requires_auth(self):
        dept = self.db.create_department(organization=self.org1)
        res = self.client.get(dept_detail_url(dept.id))
        self.assertEqual(res.status_code, status.HTTP_401_UNAUTHORIZED)


class CreateDepartmentTests(DepartmentApiTestCase):
    def test_create_success(self):
        self._authorize(self.user1)
        data = {"name": "R&D"}
        res = self.client.post(dept_list_url(), data)

        self.assertEqual(res.status_code, status.HTTP_201_CREATED)
        self.assertTrue(res.data["ok"])
        self.assertEqual(res.data["results"]["name"], "R&D")

    def test_create_duplicate_name_fails(self):
        self._authorize(self.user1)
        # Existing department with same name
        self.db.create_department(organization=self.org1, name="Support")
        res = self.client.post(dept_list_url(), {"name": "Support"})
        self.assertEqual(res.status_code, status.HTTP_400_BAD_REQUEST)


class RetrieveUpdateDeleteDepartmentTests(DepartmentApiTestCase):
    def test_retrieve_own_dept_success(self):
        dept = self.db.create_department(organization=self.org1, name="Infra")
        self._authorize(self.user1)
        res = self.client.get(dept_detail_url(dept.id))

        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertTrue(res.data["ok"])
        self.assertEqual(res.data["results"]["id"], dept.id)

    def test_retrieve_other_org_forbidden(self):
        dept = self.db.create_department(organization=self.org2, name="Ops")
        self._authorize(self.user1)
        res = self.client.get(dept_detail_url(dept.id))
        self.assertEqual(res.status_code, status.HTTP_404_NOT_FOUND)

    def test_update_dept_success(self):
        dept = self.db.create_department(organization=self.org1, name="QA")
        self._authorize(self.user1)
        res = self.client.patch(dept_detail_url(dept.id), {"name": "Quality Assurance"})
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        dept.refresh_from_db()
        self.assertEqual(dept.name, "Quality Assurance")

    def test_delete_dept_success(self):
        dept = self.db.create_department(organization=self.org1, name="Temp")
        self._authorize(self.user1)
        res = self.client.delete(dept_detail_url(dept.id))
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertFalse(Department.objects.filter(id=dept.id).exists())

    def test_list_depts_scoped_to_org(self):
        # Create departments in both orgs
        d1 = self.db.create_department(organization=self.org1, name="A")
        d2 = self.db.create_department(organization=self.org2, name="B")
        self._authorize(self.user1)
        res = self.client.get(dept_list_url())
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertTrue(res.data["ok"])
        names = {item["name"] for item in res.data["results"]}
        self.assertIn(d1.name, names)
        self.assertNotIn(d2.name, names)
