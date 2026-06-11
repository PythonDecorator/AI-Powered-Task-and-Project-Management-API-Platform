"""
Serializers for the user API View.
"""

from django.contrib.auth import authenticate, get_user_model
from django.utils import timezone
from django.utils.translation import gettext as _
from rest_framework import serializers
from rest_framework_simplejwt.tokens import RefreshToken

from .helpers import blacklist_all_user_tokens
from .models import EmailConfirmationToken

User = get_user_model()


class EmailCodeSerializer(serializers.Serializer):  # noqa
    email = serializers.EmailField()
    code = serializers.CharField(max_length=6, min_length=6)

    def validate(self, attrs):
        email = attrs.get("email")
        code = attrs.get("code")

        try:
            token = EmailConfirmationToken.objects.get(user__email=email, token=code)
            if token.expired_at < timezone.now():
                raise serializers.ValidationError("The confirmation code has expired.")
        except EmailConfirmationToken.DoesNotExist:
            raise serializers.ValidationError("Invalid confirmation code.")

        return attrs

    def save(self, **kwargs):
        email = self.validated_data.get("email")
        user = User.objects.get(email=email)

        user.is_verified = True
        user.save()

        EmailConfirmationToken.objects.filter(user=user).delete()
        return user


class EmailOnlySerializer(serializers.Serializer):  # noqa
    email = serializers.EmailField()

    def validate_email(self, value):  # noqa
        if not User.objects.filter(email=value).exists():
            raise serializers.ValidationError("User with this email does not exist.")
        return value


class ResetPasswordSerializer(serializers.Serializer):  # noqa
    email = serializers.EmailField()
    code = serializers.CharField(max_length=6, min_length=6)
    password = serializers.CharField(write_only=True, min_length=8)
    confirm_password = serializers.CharField(write_only=True, min_length=8)

    def validate(self, attrs):
        email = attrs.get("email")
        code = attrs.get("code")
        password = attrs.get("password")
        confirm_password = attrs.get("confirm_password")

        if password != confirm_password:
            raise serializers.ValidationError("Passwords do not match.")

        try:
            token = EmailConfirmationToken.objects.get(user__email=email, token=code)
            if token.expired_at < timezone.now():
                raise serializers.ValidationError("The code has expired.")
        except EmailConfirmationToken.DoesNotExist:
            raise serializers.ValidationError("Invalid email or code.")

        return attrs

    def save(self, **kwargs):
        email = self.validated_data.get("email")
        password = self.validated_data.get("password")

        user = User.objects.get(email=email)
        user.set_password(password)
        user.save()

        EmailConfirmationToken.objects.filter(user=user).delete()

        # Invalidate all existing sessions so old tokens cannot be replayed
        # after a password reset.
        blacklist_all_user_tokens(user)

        return user


class UserSerializer(serializers.ModelSerializer):
    """Serializer for the user object."""

    class Meta:
        model = User
        fields = ["id", "email", "name", "first_name", "last_name", "password"]
        extra_kwargs = {"password": {"write_only": True, "min_length": 8}}

    def create(self, validated_data):
        """Create and return a user with encrypted password."""
        return User.objects.create_user(**validated_data, is_verified=False)

    def update(self, instance, validated_data):
        """Update and return a user with encrypted password."""
        validated_data.pop("email", None)  # email is not updatable

        password = validated_data.pop("password", None)
        user = super().update(instance, validated_data)

        if password:
            user.set_password(password)
            user.save()

        return user


class LoginSerializer(serializers.Serializer):  # noqa
    """Serializer for JWT login — validates credentials and returns tokens."""
    email = serializers.EmailField()
    password = serializers.CharField(style={"input_type": "password"}, trim_whitespace=False)

    def validate(self, attrs):
        email = attrs.get("email")
        password = attrs.get("password")

        user = authenticate(
            request=self.context.get("request"),
            username=email,
            password=password,
        )

        if not user:
            raise serializers.ValidationError(
                _("Unable to authenticate with provided credentials."),
                code="authorization",
            )

        if not user.is_verified:
            raise serializers.ValidationError(
                _("Please verify your email address before logging in."),
                code="authorization",
            )

        attrs["user"] = user
        return attrs

    def get_tokens(self):
        """Return JWT access and refresh tokens for the validated user."""
        user = self.validated_data["user"]
        refresh = RefreshToken.for_user(user)
        return {
            "refresh": str(refresh),
            "access": str(refresh.access_token),
        }


class LogoutSerializer(serializers.Serializer):  # noqa
    """Serializer for logout — blacklists the refresh token."""
    refresh = serializers.CharField()

    def validate(self, attrs):
        self.token = attrs.get("refresh")
        return attrs

    def save(self, **kwargs):
        try:
            token = RefreshToken(self.token)
            token.blacklist()
        except Exception:
            raise serializers.ValidationError("Token is invalid or already expired.")
