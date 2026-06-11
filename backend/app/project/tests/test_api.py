"""
Tests for Project API views.
"""
from django.urls import reverse
from django.test import TestCase
from rest_framework import status
from rest_framework.test import APIClient
from rest_framework_simplejwt.tokens import RefreshToken

from utils.create_test_model import TestDb


def project_list_url():
    return reverse("project:project-list")


def project_detail_url(pk):
    return reverse("project:project-detail", args=[pk])


def project_assign_members_url(pk):
    return project_detail_url(pk).rstrip("/") + "/assign-members/"


def project_assign_departments_url(pk):
    return project_detail_url(pk).rstrip("/") + "/assign-departments/"


def get_auth_headers(user):
    refresh = RefreshToken.for_user(user)
    return {"HTTP_AUTHORIZATION": f"Bearer {str(refresh.access_token)}"}


class ProjectApiTestCase(TestCase):
    def setUp(self):
        self.db = TestDb()
        self.client = APIClient()

        self.user1 = self.db.create_user(email="owner1@example.com")
        self.user2 = self.db.create_user(email="owner2@example.com")

        self.org1 = self.db.create_organization(user=self.user1)
        self.org2 = self.db.create_organization(user=self.user2)

        self.user1_member = self.db.create_owner_member(organization=self.org1, user=self.user1)
        self.user2_member = self.db.create_member(organization=self.org2, user=self.user2, is_active=True)

    def _authorize(self, user):
        self.client.credentials(**get_auth_headers(user))

    def _reset_auth(self):
        self.client.credentials()


class PublicProjectApiTests(ProjectApiTestCase):
    def test_list_requires_auth(self):
        res = self.client.get(project_list_url())
        self.assertEqual(res.status_code, status.HTTP_401_UNAUTHORIZED)


class CreateProjectTests(ProjectApiTestCase):
    def test_create_project_success(self):
        self._authorize(self.user1)
        payload = {
            "name": "Awesome",
            "description": "Test",
            "status": "planning",
            "priority": "medium",
            "start_date": "2024-09-01",
        }
        res = self.client.post(project_list_url(), payload)
        self.assertIn(res.status_code, (status.HTTP_201_CREATED, status.HTTP_200_OK))

    def test_assign_members_and_departments(self):
        self._authorize(self.user1)
        project = self.db.create_project(organization=self.org1)
        member = self.db.create_member(organization=self.org1)
        dept = self.db.create_department(organization=self.org1)

        # Use PATCH per view action expectations and send PK lists
        res1 = self.client.patch(project_assign_members_url(project.id), {"members": [member.id]})
        res2 = self.client.patch(project_assign_departments_url(project.id), {"departments": [dept.id]})

        self.assertIn(res1.status_code, (status.HTTP_200_OK, status.HTTP_201_CREATED))
        self.assertIn(res2.status_code, (status.HTTP_200_OK, status.HTTP_201_CREATED))
