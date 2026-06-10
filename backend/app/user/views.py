"""
Views for the API
"""
from rest_framework import generics, authentication, mixins
from rest_framework.authtoken.models import Token
from rest_framework.authtoken.views import ObtainAuthToken
from rest_framework.settings import api_settings
from rest_framework.viewsets import GenericViewSet

from core.models import EmailConfirmationToken
from user.serializers import AuthTokenSerializer, EmailCodeSerializer, \
    ResetPasswordSerializer, EmailOnlySerializer

from rest_framework import permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.utils import timezone
from django.contrib.auth import get_user_model
import random

from .serializers import UserSerializer
from . import tasks

User = get_user_model()


def generate_six_digit_code():
    return str(random.randint(100000, 999999))


class AuthenticationViewSet(mixins.CreateModelMixin, GenericViewSet):
    serializer_class = UserSerializer
    permission_classes = [permissions.AllowAny]

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()

        code = generate_six_digit_code()

        EmailConfirmationToken.objects.filter(user=user).delete()
        EmailConfirmationToken.objects.create(
            user=user,
            token=code,
            expired_at=timezone.now() + timezone.timedelta(days=7)
        )

        tasks.send_confirmation_email_task.delay({
            "token": code,
            "email": user.email,
            "first_name": user.first_name
        })

        return Response({
            "ok": True,
            "email": user.email,
            "message": "Your account was created successfully. Please check your email for the confirmation code.",
        }, status=status.HTTP_201_CREATED)

    @action(
        detail=False,
        methods=["post"],
        url_path="verify-code",
        permission_classes=[permissions.AllowAny],
        serializer_class=EmailCodeSerializer
    )
    def verify_code(self, request):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save()

        return Response({
            "ok": True,
            "message": "Email verified successfully."
        }, status=status.HTTP_200_OK)

    @action(
        detail=False,
        methods=["post"],
        url_path="verify-password-reset-code",
        permission_classes=[permissions.AllowAny],
        serializer_class=EmailCodeSerializer
    )
    def verify_password_reset_code(self, request):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()

        code = generate_six_digit_code()
        EmailConfirmationToken.objects.create(
            user=user,
            token=code,
            expired_at=timezone.now() + timezone.timedelta(days=7)
        )

        return Response({
            "ok": True,
            "email": user.email,
            "code": code,
            "message": "Password reset successful. Please login with your new password."
        }, status=status.HTTP_200_OK)

    @action(
        detail=False,
        methods=["post"],
        url_path="resend-code",
        permission_classes=[permissions.AllowAny],
        serializer_class=EmailOnlySerializer
    )
    def resend_code(self, request):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        email = serializer.validated_data['email']
        user = User.objects.get(email=email)

        EmailConfirmationToken.objects.filter(user=user).delete()

        code = generate_six_digit_code()
        EmailConfirmationToken.objects.create(
            user=user,
            token=code,
            expired_at=timezone.now() + timezone.timedelta(days=7)
        )

        tasks.send_confirmation_email_task.delay({
            "token": code,
            "email": user.email,
            "first_name": user.first_name
        })

        return Response({
            "ok": True,
            "email": user.email,
            "message": "A new confirmation code has been sent to your email."
        })

    @action(
        detail=False,
        methods=["post"],
        url_path="request-password-reset",
        permission_classes=[permissions.AllowAny],
        serializer_class=EmailOnlySerializer
    )
    def request_password_reset(self, request):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        email = serializer.validated_data['email']
        user = User.objects.get(email=email)

        EmailConfirmationToken.objects.filter(user=user).delete()

        code = generate_six_digit_code()
        EmailConfirmationToken.objects.create(
            user=user,
            token=code,
            expired_at=timezone.now() + timezone.timedelta(minutes=10)
        )

        tasks.send_password_reset_code_task.delay({
            "token": code,
            "email": user.email,
            "first_name": user.first_name
        })

        return Response({
            "ok": True,
            "email": user.email,
            "message": "Password reset code sent to your email."
        })

    @action(
        detail=False,
        methods=["post"],
        url_path="reset-password",
        permission_classes=[permissions.AllowAny],
        serializer_class=ResetPasswordSerializer
    )
    def reset_password(self, request):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save()

        return Response({
            "ok": True,
            "message": "Your password has been reset successfully."
        }, status=status.HTTP_200_OK)


class CreateTokenView(ObtainAuthToken):
    """Create a new auth token for user."""
    serializer_class = AuthTokenSerializer
    renderer_classes = api_settings.DEFAULT_RENDERER_CLASSES

    def post(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.validated_data['user']
        token, created = Token.objects.get_or_create(user=user)
        return Response({'token': token.key, 'first_name': user.first_name}, status=status.HTTP_200_OK)


class ManageUserView(generics.RetrieveUpdateAPIView):
    """Mange the authenticated user."""
    serializer_class = UserSerializer
    authentication_classes = [authentication.TokenAuthentication]
    permission_classes = [permissions.IsAuthenticated]

    def get_object(self):
        """Retrieve and return the authenticated user."""
        return self.request.user

