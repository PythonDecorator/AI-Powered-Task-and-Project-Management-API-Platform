"""
Views for the user API.
"""

from django.contrib.auth import get_user_model
from django.utils import timezone
from rest_framework import generics, mixins, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.throttling import AnonRateThrottle
from rest_framework.viewsets import GenericViewSet
from rest_framework_simplejwt.authentication import JWTAuthentication

from .helpers import generate_six_digit_code
from .models import EmailConfirmationToken
from user.serializers import (
    EmailCodeSerializer,
    EmailOnlySerializer,
    LoginSerializer,
    LogoutSerializer,
    ResetPasswordSerializer,
    UserSerializer,
)
from . import tasks

User = get_user_model()


class LoginRateThrottle(AnonRateThrottle):
    """Tight per-IP throttle applied only to the login endpoint."""
    scope = "login"


class AuthCodeRateThrottle(AnonRateThrottle):
    """Throttle for endpoints that send or consume one-time codes."""
    scope = "auth_code"


class AuthenticationViewSet(mixins.CreateModelMixin, GenericViewSet):
    """Handles registration and all email-code-based flows."""
    serializer_class = UserSerializer
    permission_classes = [permissions.AllowAny]

    # Applied per-action below; we set a sensible baseline for the whole viewset.
    throttle_classes = [AuthCodeRateThrottle]

    def create(self, request, *args, **kwargs):
        """Register a new user and send a confirmation email."""
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()

        code = generate_six_digit_code()
        EmailConfirmationToken.objects.filter(user=user).delete()
        EmailConfirmationToken.objects.create(
            user=user,
            token=code,
            expired_at=timezone.now() + timezone.timedelta(hours=24),
        )

        tasks.send_confirmation_email_task.delay({
            "token": code,
            "email": user.email,
            "first_name": user.first_name,
        })

        return Response(
            {
                "ok": True,
                "email": user.email,
                "message": "Your account was created successfully. Please check your email for the confirmation code.",
            },
            status=status.HTTP_201_CREATED,
        )

    @action(
        detail=False,
        methods=["post"],
        url_path="verify-code",
        serializer_class=EmailCodeSerializer,
    )
    def verify_code(self, request):
        """Verify a user's email confirmation code."""
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save()

        return Response({"ok": True, "message": "Email verified successfully."})

    @action(
        detail=False,
        methods=["post"],
        url_path="verify-password-reset-code",
        serializer_class=EmailCodeSerializer,
    )
    def verify_password_reset_code(self, request):
        """Verify the first-stage password-reset code and issue a short-lived
        follow-up code sent *by email only*.
        """
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()

        code = generate_six_digit_code()
        EmailConfirmationToken.objects.create(
            user=user,
            token=code,
            expired_at=timezone.now() + timezone.timedelta(minutes=10),
        )

        # Send the follow-up code via email.
        tasks.send_password_reset_code_task.delay({
            "token": code,
            "email": user.email,
            "first_name": user.first_name,
        })

        return Response({
            "ok": True,
            "email": user.email,
            "message": "Code verified. A new reset code has been sent to your email.",
        })

    @action(
        detail=False,
        methods=["post"],
        url_path="resend-code",
        serializer_class=EmailOnlySerializer,
    )
    def resend_code(self, request):
        """Resend a confirmation code to the given email."""
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        email = serializer.validated_data["email"]
        user = User.objects.get(email=email)

        EmailConfirmationToken.objects.filter(user=user).delete()
        code = generate_six_digit_code()
        EmailConfirmationToken.objects.create(
            user=user,
            token=code,
            expired_at=timezone.now() + timezone.timedelta(hours=24),
        )

        tasks.send_confirmation_email_task.delay({
            "token": code,
            "email": user.email,
            "first_name": user.first_name,
        })

        return Response({
            "ok": True,
            "email": user.email,
            "message": "A new confirmation code has been sent to your email.",
        })

    @action(
        detail=False,
        methods=["post"],
        url_path="request-password-reset",
        serializer_class=EmailOnlySerializer,
    )
    def request_password_reset(self, request):
        """Send a password reset code to the given email."""
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        email = serializer.validated_data["email"]
        user = User.objects.get(email=email)

        EmailConfirmationToken.objects.filter(user=user).delete()
        code = generate_six_digit_code()
        EmailConfirmationToken.objects.create(
            user=user,
            token=code,
            expired_at=timezone.now() + timezone.timedelta(minutes=10),
        )

        tasks.send_password_reset_code_task.delay({
            "token": code,
            "email": user.email,
            "first_name": user.first_name,
        })

        return Response({
            "ok": True,
            "email": user.email,
            "message": "Password reset code sent to your email.",
        })

    @action(
        detail=False,
        methods=["post"],
        url_path="reset-password",
        serializer_class=ResetPasswordSerializer,
    )
    def reset_password(self, request):
        """Reset the user's password using a valid code.
        The serializer's save() also blacklists all outstanding refresh tokens
        so every existing session is immediately invalidated.
        """
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save()

        return Response({
            "ok": True,
            "message": "Your password has been reset successfully.",
        })


class LoginView(generics.GenericAPIView):
    """Authenticate a user and return JWT access + refresh tokens."""
    serializer_class = LoginSerializer
    permission_classes = [permissions.AllowAny]

    # tight per-IP throttle to slow down brute-force attempts.
    throttle_classes = [LoginRateThrottle]

    def post(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        user = serializer.validated_data["user"]
        tokens = serializer.get_tokens()

        return Response(
            {
                "ok": True,
                "first_name": user.first_name,
                "access": tokens["access"],
                "refresh": tokens["refresh"],
            },
            status=status.HTTP_200_OK,
        )


class LogoutView(generics.GenericAPIView):
    """Blacklist the refresh token to invalidate the session."""
    serializer_class = LogoutSerializer
    authentication_classes = [JWTAuthentication]
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save()

        return Response({"ok": True, "message": "Logged out successfully."}, status=status.HTTP_200_OK)


class ManageUserView(generics.RetrieveUpdateAPIView):
    """Retrieve or update the authenticated user."""
    serializer_class = UserSerializer
    authentication_classes = [JWTAuthentication]
    permission_classes = [permissions.IsAuthenticated]

    def get_object(self):
        """Retrieve and return the authenticated user."""
        return self.request.user
