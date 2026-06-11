"""
Tests for Organization models.
"""
from django.db import IntegrityError
from django.test import TestCase

from organization.models import Organization, OrganizationEmail
from utils.create_test_model import TestDb


class OrganizationModelTest(TestCase):
    def setUp(self):
        self.db = TestDb()
        self.user = self.db.create_user(email="org_owner@example.com")

    def test_organization_creation(self):
        """Creating an organization saves all fields correctly."""
        org = self.db.create_organization(user=self.user)
        self.assertEqual(org.user, self.user)
        self.assertEqual(org.name, self.db.ORG_PAYLOAD["name"])
        self.assertEqual(org.address, self.db.ORG_PAYLOAD["address"])
        self.assertEqual(org.description, self.db.ORG_PAYLOAD["description"])

    def test_organization_str(self):
        """Organization __str__ includes name and user email."""
        org = self.db.create_organization(user=self.user)
        expected = f"{org.name} ({self.user.email})"
        self.assertEqual(str(org), expected)

    def test_organization_user_one_to_one(self):
        """Each user can only have one organization."""
        self.db.create_organization(user=self.user)
        with self.assertRaises(IntegrityError):
            self.db.create_organization(user=self.user)

    def test_organization_website_optional(self):
        """Organization can be created without a website."""
        org = self.db.create_organization(user=self.user, website=None)
        self.assertIsNone(org.website)

    def test_organization_logo_optional(self):
        """Organization can be created without a logo."""
        org = self.db.create_organization(user=self.user, logo=None)
        self.assertFalse(org.logo)

    def test_organization_logo_replacement_deletes_old_file(self):
        """Saving a new logo removes the old one from storage."""
        org = self.db.create_organization(user=self.user)
        self.assertFalse(org.logo)
        org.save()
        self.assertFalse(org.logo)

    def test_organization_size_minimum_one(self):
        """Organization size must be at least 1 (due to MinValueValidator)."""
        from django.core.exceptions import ValidationError
        org = Organization(
            user=self.user,
            name="Invalid Org",
            address="123 St",
            description="Test",
            size=0,
            revenue=1000,
        )
        with self.assertRaises(ValidationError):
            org.full_clean()

    def test_organization_revenue_non_negative(self):
        """Organization revenue must be non-negative."""
        from django.core.exceptions import ValidationError
        org = Organization(
            user=self.user,
            name="Invalid Org",
            address="123 St",
            description="Test",
            size=10,
            revenue=-100,
        )
        with self.assertRaises(ValidationError):
            org.full_clean()

    def test_organization_parent_organization_optional(self):
        """Organization can have an optional parent organization (subsidiary)."""
        parent = self.db.create_organization(user=self.user)
        child_user = self.db.create_user(email="child_org@example.com")
        child = self.db.create_organization(user=child_user, parent_organization=parent)
        self.assertEqual(child.parent_organization, parent)

    def test_organization_subsidiaries_cascade(self):
        """Deleting parent doesn't delete subsidiaries (SET_NULL)."""
        parent = self.db.create_organization(user=self.user)
        child_user = self.db.create_user(email="child_org@example.com")
        child = self.db.create_organization(user=child_user, parent_organization=parent)
        parent.delete()
        child.refresh_from_db()
        self.assertIsNone(child.parent_organization)

    def test_organization_social_media_links_json(self):
        """Social media links stored as JSON."""
        links = {"twitter": "https://twitter.com/org", "linkedin": "https://linkedin.com/org"}
        org = self.db.create_organization(user=self.user, social_media_links=links)
        org.refresh_from_db()
        self.assertEqual(org.social_media_links, links)

    def test_organization_established_date_optional(self):
        """Organization can be created without an established date."""
        org = self.db.create_organization(user=self.user, established_date=None)
        self.assertIsNone(org.established_date)


class OrganizationEmailModelTest(TestCase):
    def setUp(self):
        self.db = TestDb()
        self.user = self.db.create_user(email="org_owner@example.com")
        self.organization = self.db.create_organization(user=self.user)

    def test_organization_email_creation(self):
        """Creating an OrganizationEmail saves the email."""
        email_obj = OrganizationEmail.objects.create(
            organization=self.organization,
            email="contact@example.com",
        )
        self.assertEqual(email_obj.email, "contact@example.com")
        self.assertEqual(email_obj.organization, self.organization)

    def test_organization_email_str(self):
        """OrganizationEmail __str__ returns the email address."""
        email_obj = OrganizationEmail.objects.create(
            organization=self.organization,
            email="contact@example.com",
        )
        self.assertEqual(str(email_obj), "contact@example.com")

    def test_organization_email_unique_together(self):
        """Each organization can only have one of each email (unique_together)."""
        OrganizationEmail.objects.create(
            organization=self.organization,
            email="contact@example.com",
        )
        with self.assertRaises(IntegrityError):
            OrganizationEmail.objects.create(
                organization=self.organization,
                email="contact@example.com",
            )

    def test_organization_email_different_orgs_can_share_email(self):
        """Different organizations can have the same email address."""
        user2 = self.db.create_user(email="org2@example.com")
        org2 = self.db.create_organization(user=user2)

        email1 = OrganizationEmail.objects.create(
            organization=self.organization,
            email="shared@example.com",
        )
        email2 = OrganizationEmail.objects.create(
            organization=org2,
            email="shared@example.com",
        )

        self.assertEqual(email1.email, email2.email)
        self.assertNotEqual(email1.organization, email2.organization)

    def test_organization_email_cascade_delete(self):
        """Deleting an organization deletes its emails."""
        OrganizationEmail.objects.create(
            organization=self.organization,
            email="contact@example.com",
        )
        org_id = self.organization.id
        self.organization.delete()
        self.assertEqual(OrganizationEmail.objects.filter(organization_id=org_id).count(), 0)

    def test_organization_emails_related_manager(self):
        """Can access emails through organization.organization_emails."""
        OrganizationEmail.objects.create(
            organization=self.organization,
            email="email1@example.com",
        )
        OrganizationEmail.objects.create(
            organization=self.organization,
            email="email2@example.com",
        )
        self.assertEqual(self.organization.organization_emails.count(), 2)
