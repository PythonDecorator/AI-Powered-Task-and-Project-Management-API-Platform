"""
Tests for Project serializers.
"""
from django.test import TestCase
from rest_framework.test import APIRequestFactory

from project.serializers import ProjectSerializer
from utils.create_test_model import TestDb
from project.models import Project


class ProjectSerializerTest(TestCase):
    def setUp(self):
        self.db = TestDb()
        self.user = self.db.create_user(email="serializer_user@example.com")
        self.org = self.db.create_organization(user=self.user)
        self.dept = self.db.create_department(organization=self.org, name="R&D")
        self.member = self.db.create_member(organization=self.org)
        self.factory = APIRequestFactory()

    def test_create_project_with_departments_and_members(self):
        request = self.factory.post("/")
        request.user = self.user
        data = {
            "name": "New Project",
            "description": "A test project",
            "status": Project.Status.PLANNING,
            "priority": Project.Priority.HIGH,
            "start_date": "2024-09-01",
            "due_date": "2024-12-31",
            # ProjectSerializer expects PKs for departments and members
            "departments": [self.dept.id],
            "members": [self.member.id],
        }
        serializer = ProjectSerializer(data=data, context={"request": request})
        self.assertTrue(serializer.is_valid(), serializer.errors)
        project = serializer.save()
        self.assertEqual(project.name, "New Project")
        self.assertIn(self.dept, project.departments.all())
        self.assertIn(self.member, project.members.all())
