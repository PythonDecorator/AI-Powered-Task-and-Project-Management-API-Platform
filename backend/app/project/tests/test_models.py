"""
Tests for Project models.
"""
from django.db import IntegrityError
from django.test import TestCase

from project.models import Project
from utils.create_test_model import TestDb


class ProjectModelTest(TestCase):
    def setUp(self):
        self.db = TestDb()
        self.user = self.db.create_user(email="proj_owner@example.com")
        self.org = self.db.create_organization(user=self.user)

    def test_project_creation_and_defaults(self):
        project = self.db.create_project(organization=self.org)
        self.assertEqual(project.organization, self.org)
        self.assertEqual(project.status, Project.Status.PLANNING)
        self.assertEqual(project.priority, Project.Priority.MEDIUM)

    def test_str_contains_name_status_and_org(self):
        project = self.db.create_project(organization=self.org, name="Test Project")
        s = str(project)
        self.assertIn("Test Project", s)
        self.assertIn(project.status, s)
        self.assertIn(self.org.name, s)

    def test_unique_name_within_org(self):
        self.db.create_project(organization=self.org, name="Unique")
        with self.assertRaises(IntegrityError):
            self.db.create_project(organization=self.org, name="Unique")

    def test_departments_and_members_many_to_many(self):
        dept = self.db.create_department(organization=self.org, name="Eng")
        member = self.db.create_member(organization=self.org)
        project = self.db.create_project(organization=self.org, members=[member], departments=[dept])

        self.assertIn(member, project.members.all())
        self.assertIn(dept, project.departments.all())

    def test_cascade_delete_organization_deletes_projects(self):
        self.db.create_project(organization=self.org)
        org_id = self.org.id
        self.org.delete()
        self.assertEqual(Project.objects.filter(organization_id=org_id).count(), 0)
