"""
Tests for the user API.
"""
from datetime import timedelta
from unittest.mock import patch

from django.contrib.auth import get_user_model
from django.test import TestCase
from django.urls import reverse
from django.utils import timezone

from rest_framework import status
from rest_framework.test import APIClient
from rest_framework_simplejwt.tokens import RefreshToken

from user.models import EmailConfirmationToken
from utils.create_test_model import TestDb

# ── URLs ───────────────────────────────────────────────────────────────────────

CREATE_USER_URL             = reverse("user:auth-list")
VERIFY_CODE_URL             = reverse("user:auth-verify-code")
RESEND_CODE_URL             = reverse("user:auth-resend-code")
REQUEST_PASSWORD_RESET_URL  = reverse("user:auth-request-password-reset")
VERIFY_PASSWORD_RESET_URL   = reverse("user:auth-verify-password-reset-code")
RESET_PASSWORD_URL          = reverse("user:auth-reset-password")
LOGIN_URL                   = reverse("user:login")
LOGOUT_URL                  = reverse("user:logout")
TOKEN_REFRESH_URL           = reverse("user:token-refresh")
ME_URL                      = reverse("user:me")


# ── Helpers ────────────────────────────────────────────────────────────────────

def create_user(**params):
    """Create and return a new (unverified) user."""
    return get_user_model().objects.create_user(**params)


def create_verified_user(**params):
    """Create, verify, and return a user."""
    user = create_user(**params)
    user.is_verified = True
    user.save()
    return user


def make_confirmation_token(user, *, expired=False):
    """
    Create and return an EmailConfirmationToken for *user*.
    Pass expired=True to back-date the expiry by one hour.
    """
    delta = timedelta(hours=-1) if expired else timedelta(hours=24)
    return EmailConfirmationToken.objects.create(
        user=user,
        token="123456",
        expired_at=timezone.now() + delta,
    )


# ── Base test case ─────────────────────────────────────────────────────────────

class UserApiTestCase(TestCase):
    """
    Shared setUp for all user API test classes.

    Provides:
      self.db      — TestDb instance (payloads + factories)
      self.client  — unauthenticated APIClient
      self.payload — standard registration payload from TestDb
    """

    def setUp(self):
        self.db     = TestDb()
        self.client = APIClient()
        self.payload = {
            "first_name": "Test",
            "last_name":  "User",
            "email":      self.db.USER_PAYLOAD["email"],
            "password":   self.db.USER_PAYLOAD["password"],
        }


# ── Public tests ───────────────────────────────────────────────────────────────

class PublicUserApiTests(UserApiTestCase):
    """Tests that do not require authentication."""

    # ── Registration ───────────────────────────────────────────────────────────

    def test_create_user_success(self):
        """Creating a user returns HTTP 201."""
        res = self.client.post(CREATE_USER_URL, self.payload)

        self.assertEqual(res.status_code, status.HTTP_201_CREATED, res.data)

    def test_create_user_returns_email_and_ok_flag(self):
        """Response body contains the registered email and ok=True."""
        res = self.client.post(CREATE_USER_URL, self.payload)

        self.assertTrue(res.data["ok"])
        self.assertEqual(res.data["email"], self.payload["email"])

    def test_create_user_does_not_return_password(self):
        """Password must never appear in the registration response."""
        res = self.client.post(CREATE_USER_URL, self.payload)

        self.assertNotIn("password", res.data)

    @patch("user.tasks.send_confirmation_email_task.delay")
    def test_create_user_sends_confirmation_email(self, mock_send):
        """Registering triggers a confirmation-email task."""
        self.client.post(CREATE_USER_URL, self.payload)

        mock_send.assert_called_once()

    def test_user_with_email_exists_error(self):
        """Duplicate email returns HTTP 400."""
        create_user(email=self.payload["email"], password=self.payload["password"])
        res = self.client.post(CREATE_USER_URL, self.payload)

        self.assertEqual(res.status_code, status.HTTP_400_BAD_REQUEST)

    def test_password_too_short_error(self):
        """Password shorter than 8 characters returns HTTP 400 and no user is created."""
        payload = {**self.payload, "password": "ph"}
        res = self.client.post(CREATE_USER_URL, payload)

        self.assertEqual(res.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertFalse(
            get_user_model().objects.filter(email=payload["email"]).exists()
        )

    def test_create_user_missing_email_error(self):
        """Missing email returns HTTP 400."""
        res = self.client.post(CREATE_USER_URL, {"password": self.payload["password"]})

        self.assertEqual(res.status_code, status.HTTP_400_BAD_REQUEST)

    def test_create_user_missing_password_error(self):
        """Missing password returns HTTP 400."""
        res = self.client.post(CREATE_USER_URL, {"email": self.payload["email"]})

        self.assertEqual(res.status_code, status.HTTP_400_BAD_REQUEST)

    @patch("user.tasks.send_confirmation_email_task.delay")
    def test_registration_token_expiry_is_24_hours(self, _mock):
        """The confirmation token created at registration expires in ≤ 24 h."""
        self.client.post(CREATE_USER_URL, self.payload)

        user  = get_user_model().objects.get(email=self.payload["email"])
        token = EmailConfirmationToken.objects.get(user=user)

        expected_max = timezone.now() + timedelta(hours=24, seconds=5)
        self.assertLessEqual(token.expired_at, expected_max)

    # ── Login ──────────────────────────────────────────────────────────────────

    def test_login_returns_jwt_tokens(self):
        """Valid credentials return both access and refresh tokens."""
        create_verified_user(email=self.payload["email"], password=self.payload["password"])
        res = self.client.post(LOGIN_URL, {
            "email":    self.payload["email"],
            "password": self.payload["password"],
        })

        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertIn("access",  res.data)
        self.assertIn("refresh", res.data)

    def test_login_returns_first_name(self):
        """Login response includes the user's first name."""
        create_verified_user(
            email=self.payload["email"],
            password=self.payload["password"],
            first_name="Ada",
        )
        res = self.client.post(LOGIN_URL, {
            "email":    self.payload["email"],
            "password": self.payload["password"],
        })

        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertEqual(res.data["first_name"], "Ada")

    def test_login_unverified_user_error(self):
        """Login is rejected for users who have not verified their email."""
        create_user(email=self.payload["email"], password=self.payload["password"])
        res = self.client.post(LOGIN_URL, {
            "email":    self.payload["email"],
            "password": self.payload["password"],
        })

        self.assertEqual(res.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertNotIn("access", res.data)

    def test_login_bad_credentials_error(self):
        """Wrong password returns HTTP 400 without tokens."""
        create_verified_user(email=self.payload["email"], password="goodpass123")
        res = self.client.post(LOGIN_URL, {
            "email":    self.payload["email"],
            "password": "badpass123",
        })

        self.assertEqual(res.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertNotIn("access", res.data)

    def test_login_nonexistent_email_error(self):
        """Login with an unregistered email returns HTTP 400."""
        res = self.client.post(LOGIN_URL, {
            "email":    "nobody@example.com",
            "password": self.payload["password"],
        })

        self.assertEqual(res.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertNotIn("access", res.data)

    def test_login_blank_password_error(self):
        """Blank password returns HTTP 400."""
        res = self.client.post(LOGIN_URL, {"email": self.payload["email"], "password": ""})

        self.assertEqual(res.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertNotIn("access", res.data)

    def test_login_blank_email_error(self):
        """Blank email returns HTTP 400."""
        res = self.client.post(LOGIN_URL, {"email": "", "password": self.payload["password"]})

        self.assertEqual(res.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertNotIn("access", res.data)

    # ── Token refresh ──────────────────────────────────────────────────────────

    def test_token_refresh_success(self):
        """A valid refresh token issues a new access token."""
        user    = create_verified_user(email=self.payload["email"], password=self.payload["password"])
        refresh = RefreshToken.for_user(user)
        res     = self.client.post(TOKEN_REFRESH_URL, {"refresh": str(refresh)})

        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertIn("access", res.data)

    def test_token_refresh_with_invalid_token_error(self):
        """A garbage string as refresh token returns HTTP 401."""
        res = self.client.post(TOKEN_REFRESH_URL, {"refresh": "not-a-jwt"})

        self.assertEqual(res.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_token_refresh_with_blacklisted_token_error(self):
        """A blacklisted refresh token cannot be used to obtain a new access token."""
        user    = create_verified_user(email=self.payload["email"], password=self.payload["password"])
        refresh = RefreshToken.for_user(user)

        self.client.force_authenticate(user=user)
        self.client.post(LOGOUT_URL, {"refresh": str(refresh)})
        self.client.force_authenticate(user=None)

        res = self.client.post(TOKEN_REFRESH_URL, {"refresh": str(refresh)})

        self.assertEqual(res.status_code, status.HTTP_401_UNAUTHORIZED)

    # ── Me endpoint (unauthenticated) ──────────────────────────────────────────

    def test_retrieve_user_unauthorized(self):
        """Authentication is required to access /me/."""
        res = self.client.get(ME_URL)

        self.assertEqual(res.status_code, status.HTTP_401_UNAUTHORIZED)

    # ── Email verification ─────────────────────────────────────────────────────

    @patch("user.tasks.send_confirmation_email_task.delay")
    def test_verify_code_success(self, _mock):
        """A valid code marks the user as verified."""
        user = create_user(email=self.payload["email"], password=self.payload["password"])
        make_confirmation_token(user)

        res = self.client.post(VERIFY_CODE_URL, {
            "email": self.payload["email"],
            "code":  "123456",
        })

        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertTrue(res.data["ok"])
        user.refresh_from_db()
        self.assertTrue(user.is_verified)

    def test_verify_code_wrong_code_error(self):
        """An incorrect code returns HTTP 400 and the user stays unverified."""
        user = create_user(email=self.payload["email"], password=self.payload["password"])
        make_confirmation_token(user)

        res = self.client.post(VERIFY_CODE_URL, {
            "email": self.payload["email"],
            "code":  "000000",
        })

        self.assertEqual(res.status_code, status.HTTP_400_BAD_REQUEST)
        user.refresh_from_db()
        self.assertFalse(user.is_verified)

    def test_verify_code_expired_token_error(self):
        """An expired code returns HTTP 400."""
        user = create_user(email=self.payload["email"], password=self.payload["password"])
        make_confirmation_token(user, expired=True)

        res = self.client.post(VERIFY_CODE_URL, {
            "email": self.payload["email"],
            "code":  "123456",
        })

        self.assertEqual(res.status_code, status.HTTP_400_BAD_REQUEST)

    def test_verify_code_wrong_email_error(self):
        """Correct code but wrong email returns HTTP 400."""
        user = create_user(email=self.payload["email"], password=self.payload["password"])
        make_confirmation_token(user)

        res = self.client.post(VERIFY_CODE_URL, {
            "email": "other@example.com",
            "code":  "123456",
        })

        self.assertEqual(res.status_code, status.HTTP_400_BAD_REQUEST)

    # ── Resend code ────────────────────────────────────────────────────────────

    @patch("user.tasks.send_confirmation_email_task.delay")
    def test_resend_code_success(self, mock_send):
        """Resending a code returns HTTP 200 and triggers the email task."""
        create_user(email=self.payload["email"], password=self.payload["password"])
        res = self.client.post(RESEND_CODE_URL, {"email": self.payload["email"]})

        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertTrue(res.data["ok"])
        mock_send.assert_called_once()

    def test_resend_code_unknown_email_error(self):
        """Resending to an unregistered email returns HTTP 400."""
        res = self.client.post(RESEND_CODE_URL, {"email": "ghost@example.com"})

        self.assertEqual(res.status_code, status.HTTP_400_BAD_REQUEST)

    @patch("user.tasks.send_confirmation_email_task.delay")
    def test_resend_code_replaces_existing_token(self, _mock):
        """Each resend replaces the previous token; only one token exists per user."""
        user = create_user(email=self.payload["email"], password=self.payload["password"])
        make_confirmation_token(user)

        self.client.post(RESEND_CODE_URL, {"email": self.payload["email"]})

        count = EmailConfirmationToken.objects.filter(user=user).count()
        self.assertEqual(count, 1)

    @patch("user.tasks.send_confirmation_email_task.delay")
    def test_resend_code_expiry_is_24_hours(self, _mock):
        """The resent token must also expire within 24 hours."""
        create_user(email=self.payload["email"], password=self.payload["password"])
        self.client.post(RESEND_CODE_URL, {"email": self.payload["email"]})

        user  = get_user_model().objects.get(email=self.payload["email"])
        token = EmailConfirmationToken.objects.get(user=user)

        expected_max = timezone.now() + timedelta(hours=24, seconds=5)
        self.assertLessEqual(token.expired_at, expected_max)

    # ── Password reset flow ────────────────────────────────────────────────────

    @patch("user.tasks.send_password_reset_code_task.delay")
    def test_request_password_reset_success(self, mock_send):
        """Requesting a password reset returns HTTP 200 and sends the email."""
        create_user(email=self.payload["email"], password=self.payload["password"])
        res = self.client.post(REQUEST_PASSWORD_RESET_URL, {"email": self.payload["email"]})

        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertTrue(res.data["ok"])
        mock_send.assert_called_once()

    def test_request_password_reset_unknown_email_error(self):
        """Requesting a reset for an unregistered email returns HTTP 400."""
        res = self.client.post(REQUEST_PASSWORD_RESET_URL, {"email": "ghost@example.com"})

        self.assertEqual(res.status_code, status.HTTP_400_BAD_REQUEST)

    @patch("user.tasks.send_password_reset_code_task.delay")
    def test_request_password_reset_expiry_is_10_minutes(self, _mock):
        """The password-reset token expires within 10 minutes."""
        create_user(email=self.payload["email"], password=self.payload["password"])
        self.client.post(REQUEST_PASSWORD_RESET_URL, {"email": self.payload["email"]})

        user  = get_user_model().objects.get(email=self.payload["email"])
        token = EmailConfirmationToken.objects.get(user=user)

        expected_max = timezone.now() + timedelta(minutes=10, seconds=5)
        self.assertLessEqual(token.expired_at, expected_max)

    @patch("user.tasks.send_password_reset_code_task.delay")
    def test_verify_password_reset_code_success(self, _mock):
        """A valid first-stage reset code returns HTTP 200."""
        user = create_user(email=self.payload["email"], password=self.payload["password"])
        make_confirmation_token(user)

        res = self.client.post(VERIFY_PASSWORD_RESET_URL, {
            "email": self.payload["email"],
            "code":  "123456",
        })

        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertTrue(res.data["ok"])

    @patch("user.tasks.send_password_reset_code_task.delay")
    def test_verify_password_reset_code_does_not_leak_code_in_response(self, _mock):
        """The follow-up reset code must NOT appear in the JSON response body."""
        user = create_user(email=self.payload["email"], password=self.payload["password"])
        make_confirmation_token(user)

        res = self.client.post(VERIFY_PASSWORD_RESET_URL, {
            "email": self.payload["email"],
            "code":  "123456",
        })

        self.assertNotIn("code", res.data)

    @patch("user.tasks.send_password_reset_code_task.delay")
    def test_verify_password_reset_code_sends_follow_up_email(self, mock_send):
        """After verifying the first code a new code is sent by email."""
        user = create_user(email=self.payload["email"], password=self.payload["password"])
        make_confirmation_token(user)

        self.client.post(VERIFY_PASSWORD_RESET_URL, {
            "email": self.payload["email"],
            "code":  "123456",
        })

        mock_send.assert_called_once()

    def test_verify_password_reset_code_wrong_code_error(self):
        """Wrong first-stage code returns HTTP 400."""
        user = create_user(email=self.payload["email"], password=self.payload["password"])
        make_confirmation_token(user)

        res = self.client.post(VERIFY_PASSWORD_RESET_URL, {
            "email": self.payload["email"],
            "code":  "000000",
        })

        self.assertEqual(res.status_code, status.HTTP_400_BAD_REQUEST)

    def test_verify_password_reset_code_expired_error(self):
        """Expired first-stage code returns HTTP 400."""
        user = create_user(email=self.payload["email"], password=self.payload["password"])
        make_confirmation_token(user, expired=True)

        res = self.client.post(VERIFY_PASSWORD_RESET_URL, {
            "email": self.payload["email"],
            "code":  "123456",
        })

        self.assertEqual(res.status_code, status.HTTP_400_BAD_REQUEST)

    def test_reset_password_success(self):
        """A valid code + matching passwords resets the password and returns HTTP 200."""
        user = create_user(email=self.payload["email"], password="oldpass123")
        make_confirmation_token(user)

        res = self.client.post(RESET_PASSWORD_URL, {
            "email":            self.payload["email"],
            "code":             "123456",
            "password":         "newpass123",
            "confirm_password": "newpass123",
        })

        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertTrue(res.data["ok"])
        user.refresh_from_db()
        self.assertTrue(user.check_password("newpass123"))

    def test_reset_password_mismatched_passwords_error(self):
        """Mismatched passwords return HTTP 400."""
        user = create_user(email=self.payload["email"], password="oldpass123")
        make_confirmation_token(user)

        res = self.client.post(RESET_PASSWORD_URL, {
            "email":            self.payload["email"],
            "code":             "123456",
            "password":         "newpass123",
            "confirm_password": "different123",
        })

        self.assertEqual(res.status_code, status.HTTP_400_BAD_REQUEST)

    def test_reset_password_wrong_code_error(self):
        """Wrong code during reset returns HTTP 400."""
        user = create_user(email=self.payload["email"], password="oldpass123")
        make_confirmation_token(user)

        res = self.client.post(RESET_PASSWORD_URL, {
            "email":            self.payload["email"],
            "code":             "000000",
            "password":         "newpass123",
            "confirm_password": "newpass123",
        })

        self.assertEqual(res.status_code, status.HTTP_400_BAD_REQUEST)

    def test_reset_password_expired_code_error(self):
        """Expired reset code returns HTTP 400."""
        user = create_user(email=self.payload["email"], password="oldpass123")
        make_confirmation_token(user, expired=True)

        res = self.client.post(RESET_PASSWORD_URL, {
            "email":            self.payload["email"],
            "code":             "123456",
            "password":         "newpass123",
            "confirm_password": "newpass123",
        })

        self.assertEqual(res.status_code, status.HTTP_400_BAD_REQUEST)

    def test_reset_password_short_password_error(self):
        """New password shorter than 8 characters returns HTTP 400."""
        user = create_user(email=self.payload["email"], password="oldpass123")
        make_confirmation_token(user)

        res = self.client.post(RESET_PASSWORD_URL, {
            "email":            self.payload["email"],
            "code":             "123456",
            "password":         "short",
            "confirm_password": "short",
        })

        self.assertEqual(res.status_code, status.HTTP_400_BAD_REQUEST)

    def test_reset_password_blacklists_all_tokens(self):
        """After a password reset every outstanding refresh token is blacklisted."""
        from rest_framework_simplejwt.token_blacklist.models import BlacklistedToken

        user     = create_user(email=self.payload["email"], password="oldpass123")
        refresh1 = RefreshToken.for_user(user)
        refresh2 = RefreshToken.for_user(user)
        make_confirmation_token(user)

        self.client.post(RESET_PASSWORD_URL, {
            "email":            self.payload["email"],
            "code":             "123456",
            "password":         "newpass123",
            "confirm_password": "newpass123",
        })

        self.assertTrue(BlacklistedToken.objects.filter(token__jti=refresh1["jti"]).exists())
        self.assertTrue(BlacklistedToken.objects.filter(token__jti=refresh2["jti"]).exists())

    def test_old_refresh_token_rejected_after_password_reset(self):
        """A refresh attempt with a pre-reset token must return HTTP 401."""
        user    = create_user(email=self.payload["email"], password="oldpass123")
        refresh = RefreshToken.for_user(user)
        make_confirmation_token(user)

        self.client.post(RESET_PASSWORD_URL, {
            "email":            self.payload["email"],
            "code":             "123456",
            "password":         "newpass123",
            "confirm_password": "newpass123",
        })

        res = self.client.post(TOKEN_REFRESH_URL, {"refresh": str(refresh)})
        self.assertEqual(res.status_code, status.HTTP_401_UNAUTHORIZED)
