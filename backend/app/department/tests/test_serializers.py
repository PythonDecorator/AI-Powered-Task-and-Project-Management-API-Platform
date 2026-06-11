"""
Tests for Department serializers.
"""
from django.test import TestCase
from rest_framework.test import APIRequestFactory

from department.serializers import DepartmentSerializer, MemberRefSerializer
from utils.create_test_model import TestDb


class MemberRefSerializerTest(TestCase):
    def setUp(self):
        self.db = TestDb()
        self.user = self.db.create_user(email="serializer_user@example.com")
        self.org = self.db.create_organization(user=self.user)
        # Create an active member in the organization
        self.member = self.db.create_member(organization=self.org, user=self.user, email="mref@example.com",
                                            is_active=True)
        self.factory = APIRequestFactory()

    def test_validate_existing_email(self):
        request = self.factory.post("/")
        request.user = self.user
        serializer = MemberRefSerializer(data={"email": "mref@example.com"}, context={"request": request})
        self.assertTrue(serializer.is_valid(), serializer.errors)

    def test_validate_missing_email_fails(self):
        request = self.factory.post("/")
        request.user = self.user
        serializer = MemberRefSerializer(data={"email": "unknown@example.com"}, context={"request": request})
        self.assertFalse(serializer.is_valid())


class DepartmentSerializerTest(TestCase):
    def setUp(self):
        self.db = TestDb()
        self.user = self.db.create_user(email="dept_serializer@example.com")
        self.org = self.db.create_organization(user=self.user)
        # Member to be used as head and in members list
        self.member = self.db.create_member(organization=self.org, user=self.user, email="head@example.com",
                                            is_active=True)
        self.factory = APIRequestFactory()

    def test_create_department_with_head_and_members(self):
        request = self.factory.post("/")
        request.user = self.user
        data = {
            "name": "Research",
            "head": {"email": "head@example.com"},
            "members": [{"email": "head@example.com"}],
        }
        serializer = DepartmentSerializer(data=data, context={"request": request})
        self.assertTrue(serializer.is_valid(), serializer.errors)
        dept = serializer.save()
        self.assertEqual(dept.name, "Research")
        self.assertEqual(dept.head.email, "head@example.com")
        self.assertIn(self.member, dept.members.all())

    def test_update_clear_head_and_members(self):
        # Create existing department
        dept = self.db.create_department(organization=self.org, head=self.member, name="Eng")
        dept.members.add(self.member)

        request = self.factory.patch("/")
        request.user = self.user
        data = {"head": None, "members": []}
        serializer = DepartmentSerializer(dept, data=data, partial=True, context={"request": request})
        self.assertTrue(serializer.is_valid(), serializer.errors)
        updated = serializer.save()
        self.assertIsNone(updated.head)
        self.assertEqual(updated.members.count(), 0)
