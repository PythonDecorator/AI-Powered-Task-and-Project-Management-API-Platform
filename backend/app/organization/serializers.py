"""
Serializers for the Organization API.
"""
import mimetypes

try:
    import magic
except ImportError:
    magic = None

from django.core.validators import URLValidator
from django.core.exceptions import ValidationError as DjangoValidationError
from rest_framework import serializers

from organization import models

# Max logo upload size: 5 MB
MAX_LOGO_SIZE_BYTES = 5 * 1024 * 1024
ALLOWED_LOGO_MIME_TYPES = {"image/jpeg", "image/png", "image/webp", "image/gif"}

# Recognised social media keys. Values must be valid URLs.
SOCIAL_MEDIA_KEYS = {"twitter", "linkedin", "facebook", "instagram", "youtube", "github"}


class OrganizationEmailSerializer(serializers.ModelSerializer):
    """Serializer for OrganizationEmail — used for nested reads and the emails action."""

    class Meta:
        model = models.OrganizationEmail
        fields = ["id", "email"]
        read_only_fields = ["id"]
        extra_kwargs = {"email": {"required": True}}


class OrganizationDetailsSerializer(serializers.ModelSerializer):
    """Full read/write serializer for Organization."""
    emails = OrganizationEmailSerializer(many=True, required=False, source="organization_emails")

    class Meta:
        model = models.Organization
        fields = ["id", "name", "description", "logo", "address", "website", "size", "revenue",
                  "currency", "established_date", "social_media_links", "emails"]
        read_only_fields = ["id"]

    def validate_social_media_links(self, value):
        """Reject unknown keys and non-URL values."""
        if value is None:
            return value

        if not isinstance(value, dict):
            raise serializers.ValidationError(
                "social_media_links must be a JSON object mapping platform names to URLs."
            )

        url_validator = URLValidator()
        errors = {}

        for key, url in value.items():
            if key not in SOCIAL_MEDIA_KEYS:
                errors[key] = (
                    f"Unknown platform '{key}'. "
                    f"Accepted keys: {', '.join(sorted(SOCIAL_MEDIA_KEYS))}."
                )
                continue
            try:
                url_validator(url)
            except DjangoValidationError:
                errors[key] = f"'{url}' is not a valid URL."

        if errors:
            raise serializers.ValidationError(errors)

        return value

    @staticmethod
    def _sync_emails(emails_data, organization):
        for item in emails_data:
            models.OrganizationEmail.objects.get_or_create(
                organization=organization,
                email=item["email"],
            )

    def create(self, validated_data):
        emails_data = validated_data.pop("organization_emails", [])
        organization = models.Organization.objects.create(**validated_data)
        self._sync_emails(emails_data, organization)
        return organization

    def update(self, instance, validated_data):
        """Emails are replaced only when the key is explicitly present."""
        emails_data = validated_data.pop("organization_emails", None)

        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()

        if emails_data is not None:
            instance.organization_emails.all().delete()
            self._sync_emails(emails_data, instance)

        return instance


class OrganizationLogoSerializer(serializers.ModelSerializer):
    """Serializer for the change-logo action — validates file size and type."""

    class Meta:
        model = models.Organization
        fields = ["id", "logo"]
        read_only_fields = ["id"]
        extra_kwargs = {"logo": {"required": True}}

    def validate_logo(self, value):
        if value.size > MAX_LOGO_SIZE_BYTES:
            raise serializers.ValidationError(
                f"Logo file too large. Maximum size is {MAX_LOGO_SIZE_BYTES // (1024 * 1024)} MB."
            )

        if magic:
            try:
                mime = magic.from_buffer(value.read(2048), mime=True)
                value.seek(0)
            except (AttributeError, TypeError):
                mime, _ = mimetypes.guess_type(value.name)
        else:
            mime, _ = mimetypes.guess_type(value.name)

        if mime not in ALLOWED_LOGO_MIME_TYPES:
            raise serializers.ValidationError(
                f"Unsupported image type '{mime}'. "
                f"Allowed types: {', '.join(sorted(ALLOWED_LOGO_MIME_TYPES))}."
            )

        return value
