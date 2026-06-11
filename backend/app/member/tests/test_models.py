"""
Tests for Member models.
"""
from django.db import IntegrityError
from django.test import TestCase

from member.models import MemberInvitationToken
from utils.create_test_model import TestDb


class MemberModelTest(TestCase):
    def setUp(self):
        self.db = TestDb()
        self.user = self.db.create_user(email="member_owner@example.com")
        self.organization = self.db.create_organization(user=self.user)

    def test_member_creation(self):
        """Creating a member saves the fields and organization link."""
        member = self.db.create_member(organization=self.organization)
        self.assertEqual(member.organization, self.organization)
        self.assertEqual(member.email, self.db.MEMBER_PAYLOAD["email"])

    def test_member_str(self):
        """__str__ contains name, role and organization id."""
        member = self.db.create_member(organization=self.organization, name="Alice")
        s = str(member)
        self.assertIn("Alice", s)
        self.assertIn(member.get_role_display().split()[0].lower(), s.lower())

    def test_unique_email_per_organization(self):
        """Same email cannot be created twice in one org."""
        self.db.create_member(organization=self.organization, email="dup@example.com")
        with self.assertRaises(IntegrityError):
            # second creation with same email in same org should fail
            self.db.create_member(organization=self.organization, email="dup@example.com")

    def test_departments_many_to_many(self):
        """Members can be assigned to departments via M2M relationship."""
        dept = self.db.create_department(organization=self.organization, name="Eng")
        member = self.db.create_member(organization=self.organization)
        member.departments.add(dept)
        self.assertIn(dept, member.departments.all())

    def test_invitation_token_str(self):
        """Invitation token string representation includes email."""
        token = MemberInvitationToken.objects.create(
            organization=self.organization, email="invitee@example.com", token="tok123"
        )
        self.assertIn("invitee@example.com", str(token))
