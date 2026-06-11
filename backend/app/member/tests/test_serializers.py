"""
Tests for Member serializers.
"""
from django.test import TestCase
from rest_framework.test import APIRequestFactory

from member.serializers import ManageMemberSerializer, MemberRoleSerializer
from utils.create_test_model import TestDb
from member.models import Member


class ManageMemberSerializerTest(TestCase):
    def setUp(self):
        self.db = TestDb()
        self.user = self.db.create_user(email="ser_user@example.com")
        self.org = self.db.create_organization(user=self.user)
        # Create departments and members to reference
        self.dept = self.db.create_department(organization=self.org, name="Support")
        self.manager = self.db.create_member(organization=self.org, email="mgr@example.com", role=Member.Role.MANAGER)
        self.report = self.db.create_member(organization=self.org, email="report@example.com")
        self.factory = APIRequestFactory()

    def test_create_with_departments_and_direct_reports(self):
        request = self.factory.post("/")
        request.user = self.user
        data = {
            "name": "New Hire",
            "email": "newhire@example.com",
            "salary": "30000.00",
            "working": Member.WorkingStatus.FULL_TIME,
            "role": Member.Role.STAFF,
            "address": "1 Test St",
            "hire_date": "2024-09-01",
            "departments": [{"name": "Support"}],
            "direct_reports": [{"email": "report@example.com"}],
        }
        serializer = ManageMemberSerializer(data=data, context={"request": request})
        self.assertTrue(serializer.is_valid(), serializer.errors)
        member = serializer.save()
        self.assertTrue(Member.objects.filter(email="newhire@example.com", organization=self.org).exists())
        self.assertIn(self.dept, member.departments.all())
        # direct_reports: report should now have manager set to the new member
        report = Member.objects.get(email="report@example.com", organization=self.org)
        self.assertEqual(report.manager, member)

    def test_validate_manager_not_in_org(self):
        # create manager in different org
        other_user = self.db.create_user(email="other@example.com")
        other_org = self.db.create_organization(user=other_user)
        other_mgr = self.db.create_member(organization=other_org, email="othermgr@example.com")

        request = self.factory.post("/")
        request.user = self.user
        data = {
            "name": "Bad Manager",
            "email": "bad@example.com",
            "salary": "20000.00",
            "working": Member.WorkingStatus.FULL_TIME,
            "role": Member.Role.STAFF,
            "address": "1 Test St",
            "hire_date": "2024-09-01",
            "manager": other_mgr.id,
        }
        serializer = ManageMemberSerializer(data=data, context={"request": request})
        # Should raise during validation because manager belongs to another org
        self.assertFalse(serializer.is_valid())
        self.assertIn("manager", serializer.errors)


class MemberRoleSerializerTest(TestCase):
    def setUp(self):
        self.db = TestDb()
        self.user = self.db.create_user(email="role_user@example.com")
        self.org = self.db.create_organization(user=self.user)
        self.owner_member = self.db.create_owner_member(organization=self.org, email="owner_member@example.com")

    def test_prevent_demoting_owner(self):
        serializer = MemberRoleSerializer(self.owner_member, data={"role": Member.Role.STAFF}, partial=True)
        self.assertFalse(serializer.is_valid())
        self.assertIn("role", serializer.errors)
