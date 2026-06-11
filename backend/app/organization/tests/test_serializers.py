"""
Tests for Organization serializers.
"""

from django.core.files.uploadedfile import SimpleUploadedFile
from django.test import TestCase

from organization.models import OrganizationEmail
from organization.serializers import (
    OrganizationDetailsSerializer,
    OrganizationEmailSerializer,
    OrganizationLogoSerializer,
    ALLOWED_LOGO_MIME_TYPES,
)
from utils.create_test_model import TestDb


class OrganizationEmailSerializerTest(TestCase):
    def setUp(self):
        self.db = TestDb()

    def test_serializer_fields(self):
        """Serializer includes id and email fields."""
        user = self.db.create_user()
        org = self.db.create_organization(user=user)
        email_obj = OrganizationEmail.objects.create(
            organization=org,
            email="contact@example.com",
        )
        serializer = OrganizationEmailSerializer(email_obj)
        self.assertIn("id", serializer.data)
        self.assertIn("email", serializer.data)
        self.assertEqual(serializer.data["email"], "contact@example.com")

    def test_id_read_only(self):
        """ID field is read-only and ignored in input."""
        data = {"id": 999, "email": "test@example.com"}
        serializer = OrganizationEmailSerializer(data=data)
        self.assertTrue(serializer.is_valid(), serializer.errors)
        self.assertNotIn("id", serializer.validated_data)

    def test_email_required(self):
        """Email field is required."""
        serializer = OrganizationEmailSerializer(data={})
        self.assertFalse(serializer.is_valid())
        self.assertIn("email", serializer.errors)

    def test_email_valid(self):
        """Valid email passes validation."""
        serializer = OrganizationEmailSerializer(data={"email": "test@example.com"})
        self.assertTrue(serializer.is_valid())


class OrganizationDetailsSerializerTest(TestCase):
    def setUp(self):
        self.db = TestDb()
        self.user = self.db.create_user()
        self.org = self.db.create_organization(user=self.user)

    def test_serializer_fields(self):
        """Serializer includes all expected fields."""
        serializer = OrganizationDetailsSerializer(self.org)
        expected_fields = [
            "id",
            "name",
            "description",
            "logo",
            "address",
            "website",
            "size",
            "revenue",
            "currency",
            "established_date",
            "social_media_links",
            "emails",
        ]
        for field in expected_fields:
            self.assertIn(field, serializer.data)

    def test_id_read_only(self):
        """ID field is read-only and ignored in input."""
        data = {**self.db.ORG_PAYLOAD, "id": 999}
        serializer = OrganizationDetailsSerializer(data=data)
        self.assertTrue(serializer.is_valid())
        self.assertNotIn("id", serializer.validated_data)

    def test_create_organization_success(self):
        """Creating an organization with valid data works."""
        data = {
            "name": "New Org",
            "address": "456 Oak St",
            "description": "A new org",
            "size": 25,
            "revenue": "250000.00",
            "currency": "USD",
        }
        serializer = OrganizationDetailsSerializer(data=data)
        self.assertTrue(serializer.is_valid(), serializer.errors)

    def test_create_with_emails(self):
        """Creating organization with nested emails works."""
        user = self.db.create_user(email="org_with_emails@example.com")
        data = {
            "name": "Org with Emails",
            "address": "789 Elm St",
            "description": "Test org",
            "size": 15,
            "revenue": "150000.00",
            "currency": "GBP",
            "emails": [
                {"email": "contact1@example.com"},
                {"email": "contact2@example.com"},
            ],
        }
        serializer = OrganizationDetailsSerializer(data=data)
        self.assertTrue(serializer.is_valid(), serializer.errors)
        org = serializer.save(user=user)
        self.assertEqual(org.organization_emails.count(), 2)

    def test_update_organization_partial(self):
        """Updating organization with partial data works."""
        data = {"name": "Updated Name"}
        serializer = OrganizationDetailsSerializer(self.org, data=data, partial=True)
        self.assertTrue(serializer.is_valid(), serializer.errors)
        updated_org = serializer.save()
        self.assertEqual(updated_org.name, "Updated Name")

    def test_update_emails_replaces_all(self):
        """Updating emails field replaces all existing emails."""
        OrganizationEmail.objects.create(
            organization=self.org,
            email="old@example.com",
        )
        data = {
            "emails": [
                {"email": "new1@example.com"},
                {"email": "new2@example.com"},
            ],
        }
        serializer = OrganizationDetailsSerializer(self.org, data=data, partial=True)
        self.assertTrue(serializer.is_valid(), serializer.errors)
        serializer.save()
        emails = self.org.organization_emails.all().values_list("email", flat=True)
        self.assertEqual(set(emails), {"new1@example.com", "new2@example.com"})

    def test_update_emails_without_key_preserves_existing(self):
        """Not including emails in update data preserves existing emails."""
        OrganizationEmail.objects.create(
            organization=self.org,
            email="existing@example.com",
        )
        data = {"name": "Updated Name"}
        serializer = OrganizationDetailsSerializer(self.org, data=data, partial=True)
        self.assertTrue(serializer.is_valid(), serializer.errors)
        serializer.save()
        self.assertEqual(self.org.organization_emails.count(), 1)
        self.assertTrue(
            self.org.organization_emails.filter(email="existing@example.com").exists()
        )

    def test_social_media_links_valid(self):
        """Valid social media links pass validation."""
        data = {
            **self.db.ORG_PAYLOAD,
            "social_media_links": {
                "twitter": "https://twitter.com/org",
                "linkedin": "https://linkedin.com/company/org",
            },
        }
        serializer = OrganizationDetailsSerializer(data=data)
        self.assertTrue(serializer.is_valid(), serializer.errors)

    def test_social_media_links_unknown_platform_fails(self):
        """Unknown social media platform names fail validation."""
        data = {
            **self.db.ORG_PAYLOAD,
            "social_media_links": {
                "tiktok": "https://tiktok.com/@org",
            },
        }
        serializer = OrganizationDetailsSerializer(data=data)
        self.assertFalse(serializer.is_valid())
        self.assertIn("social_media_links", serializer.errors)

    def test_social_media_links_invalid_url_fails(self):
        """Invalid URLs in social media links fail validation."""
        data = {
            **self.db.ORG_PAYLOAD,
            "social_media_links": {
                "twitter": "not a valid url",
            },
        }
        serializer = OrganizationDetailsSerializer(data=data)
        self.assertFalse(serializer.is_valid())
        self.assertIn("social_media_links", serializer.errors)

    def test_social_media_links_optional(self):
        """Social media links field is optional."""
        data = self.db.ORG_PAYLOAD
        serializer = OrganizationDetailsSerializer(data=data)
        self.assertTrue(serializer.is_valid())

    def test_website_optional(self):
        """Website field is optional."""
        data = {**self.db.ORG_PAYLOAD}
        if "website" in data:
            del data["website"]
        serializer = OrganizationDetailsSerializer(data=data)
        self.assertTrue(serializer.is_valid(), serializer.errors)

    def test_established_date_optional(self):
        """Established date field is optional."""
        data = self.db.ORG_PAYLOAD
        serializer = OrganizationDetailsSerializer(data=data)
        self.assertTrue(serializer.is_valid())

    def test_size_minimum_validation(self):
        """Size must be at least 1."""
        data = {**self.db.ORG_PAYLOAD, "size": 0}
        serializer = OrganizationDetailsSerializer(data=data)
        self.assertFalse(serializer.is_valid())

    def test_revenue_non_negative(self):
        """Revenue must be non-negative."""
        data = {**self.db.ORG_PAYLOAD, "revenue": "-1000.00"}
        serializer = OrganizationDetailsSerializer(data=data)
        self.assertFalse(serializer.is_valid())

    def test_nested_emails_in_response(self):
        """Response includes nested emails data."""
        OrganizationEmail.objects.create(
            organization=self.org,
            email="contact@example.com",
        )
        serializer = OrganizationDetailsSerializer(self.org)
        self.assertIn("emails", serializer.data)
        self.assertEqual(len(serializer.data["emails"]), 1)
        self.assertEqual(serializer.data["emails"][0]["email"], "contact@example.com")


class OrganizationLogoSerializerTest(TestCase):
    def setUp(self):
        self.db = TestDb()
        self.user = self.db.create_user()
        self.org = self.db.create_organization(user=self.user)

    def test_serializer_fields(self):
        """Serializer includes id and logo fields."""
        serializer = OrganizationLogoSerializer(self.org)
        self.assertIn("id", serializer.data)
        self.assertIn("logo", serializer.data)

    def test_serializer_has_required_fields(self):
        """Serializer includes id and logo fields."""
        serializer = OrganizationLogoSerializer()
        self.assertIn("id", serializer.fields)
        self.assertIn("logo", serializer.fields)

    def test_logo_required(self):
        """Logo field is required."""
        serializer = OrganizationLogoSerializer(data={})
        self.assertFalse(serializer.is_valid())
        self.assertIn("logo", serializer.errors)

    def test_allowed_mime_types(self):
        """Allowed MIME types are defined correctly."""
        self.assertIn("image/png", ALLOWED_LOGO_MIME_TYPES)
        self.assertIn("image/jpeg", ALLOWED_LOGO_MIME_TYPES)
        self.assertIn("image/webp", ALLOWED_LOGO_MIME_TYPES)
        self.assertIn("image/gif", ALLOWED_LOGO_MIME_TYPES)

    def test_invalid_file_type_rejected(self):
        """Non-image files are rejected."""
        txt_file = SimpleUploadedFile(
            "test.txt",
            b"This is a text file",
            content_type="text/plain",
        )
        serializer = OrganizationLogoSerializer(data={"logo": txt_file})
        self.assertFalse(serializer.is_valid())
        self.assertIn("logo", serializer.errors)

    def test_file_too_large_rejected(self):
        """Files larger than 5MB are rejected."""
        large_file = SimpleUploadedFile(
            "large.png",
            b"x" * (6 * 1024 * 1024),
            content_type="image/png",
        )
        serializer = OrganizationLogoSerializer(data={"logo": large_file})
        self.assertFalse(serializer.is_valid())
        self.assertIn("logo", serializer.errors)

    @staticmethod
    def _create_png_file():
        png_magic = bytes.fromhex("89504e470d0a1a0a")
        return SimpleUploadedFile(
            "logo.png",
            png_magic + b"fake_png_data",
            content_type="image/png",
        )

    @staticmethod
    def _create_jpeg_file():
        jpeg_magic = bytes.fromhex("ffd8ffe0")
        return SimpleUploadedFile(
            "logo.jpg",
            jpeg_magic + b"fake_jpeg_data",
            content_type="image/jpeg",
        )

    @staticmethod
    def _create_webp_file():
        webp_magic = b"RIFF" + b"\x00\x00\x00\x00" + b"WEBP"
        return SimpleUploadedFile(
            "logo.webp",
            webp_magic + b"fake_webp_data",
            content_type="image/webp",
        )

    @staticmethod
    def _create_gif_file():
        gif_magic = b"GIF89a"
        return SimpleUploadedFile(
            "logo.gif",
            gif_magic + b"fake_gif_data",
            content_type="image/gif",
        )
