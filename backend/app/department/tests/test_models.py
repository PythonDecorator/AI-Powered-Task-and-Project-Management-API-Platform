"""
Tests for Department models.
"""
from django.db import IntegrityError
from django.test import TestCase

from utils.create_test_model import TestDb


class DepartmentModelTest(TestCase):
    def setUp(self):
        self.db = TestDb()
        self.user = self.db.create_user(email="dept_owner@example.com")
        self.organization = self.db.create_organization(user=self.user)

    def test_department_creation(self):
        """Creating a department saves fields and relations correctly."""
        dept = self.db.create_department(organization=self.organization)
        self.assertEqual(dept.organization, self.organization)
        self.assertEqual(dept.name, self.db.DEPARTMENT_PAYLOAD["name"])
        self.assertIsNone(dept.head)

    def test_department_str(self):
        """Department __str__ includes name and organization name."""
        dept = self.db.create_department(organization=self.organization, name="R&D")
        expected = f"{dept.name} ({self.organization.name})"
        self.assertEqual(str(dept), expected)

    def test_department_unique_within_organization(self):
        """Department names must be unique within the same organization."""
        self.db.create_department(organization=self.organization)
        with self.assertRaises(IntegrityError):
            # Same name in same organization should raise
            self.db.create_department(organization=self.organization)

    def test_department_same_name_different_organization_allowed(self):
        """Different organizations can have departments with the same name."""
        other_user = self.db.create_user(email="other_owner@example.com")
        other_org = self.db.create_organization(user=other_user)

        d1 = self.db.create_department(organization=self.organization,
                                       name="Support")
        d2 = self.db.create_department(organization=other_org,
                                       name="Support")

        self.assertEqual(d1.name, d2.name)
        self.assertNotEqual(d1.organization, d2.organization)

    def test_head_set_null_on_member_delete(self):
        """If the head member is deleted, department.head
        becomes NULL (SET_NULL)."""
        member = self.db.create_member(organization=self.organization)
        dept = self.db.create_department(organization=self.organization, head=member)

        # Ensure head is set initially
        self.assertEqual(dept.head, member)

        # Delete the member and refresh department
        member.delete()
        dept.refresh_from_db()
        self.assertIsNone(dept.head)

    def test_projects_many_to_many(self):
        """Departments can be assigned to projects via ManyToMany relationship."""
        dept = self.db.create_department(organization=self.organization)
        project = self.db.create_project(organization=self.organization,
                                         departments=[dept])

        self.assertIn(dept, project.departments.all())
        self.assertIn(project, dept.projects.all())
