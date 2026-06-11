"""
Private user API tests — require authentication.
"""
from rest_framework import status
from rest_framework.test import APIClient
from rest_framework_simplejwt.tokens import RefreshToken

from user.tests.test_user_api import (
    UserApiTestCase,
    create_verified_user,
    ME_URL,
    LOGOUT_URL,
    TOKEN_REFRESH_URL,
)


class PrivateUserApiTests(UserApiTestCase):
    """Tests that require authentication."""

    def setUp(self):
        super().setUp()
        self.user = create_verified_user(
            email=self.payload["email"],
            password=self.payload["password"],
            first_name=self.payload["first_name"],
            last_name=self.payload["last_name"],
        )
        self.refresh = RefreshToken.for_user(self.user)
        self.client.force_authenticate(user=self.user)

    # ── Profile ────────────────────────────────────────────────────────────────

    def test_retrieve_profile_success(self):
        """Authenticated GET /me/ returns HTTP 200."""
        res = self.client.get(ME_URL)

        self.assertEqual(res.status_code, status.HTTP_200_OK)

    def test_retrieve_profile_contains_email(self):
        """GET /me/ response contains the authenticated user's email."""
        res = self.client.get(ME_URL)

        self.assertEqual(res.data["email"], self.user.email)

    def test_post_me_not_allowed(self):
        """POST is not allowed on /me/."""
        res = self.client.post(ME_URL, {})

        self.assertEqual(res.status_code, status.HTTP_405_METHOD_NOT_ALLOWED)

    def test_update_user_first_name(self):
        """PATCH /me/ can update first_name."""
        res = self.client.patch(ME_URL, {"first_name": "Updated"})

        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.user.refresh_from_db()
        self.assertEqual(self.user.first_name, "Updated")

    def test_update_user_last_name(self):
        """PATCH /me/ can update last_name."""
        res = self.client.patch(ME_URL, {"last_name": "Smith"})

        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.user.refresh_from_db()
        self.assertEqual(self.user.last_name, "Smith")

    def test_update_user_password(self):
        """PATCH /me/ with a new password changes it successfully."""
        res = self.client.patch(ME_URL, {"password": "newpassword123"})

        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.user.refresh_from_db()
        self.assertTrue(self.user.check_password("newpassword123"))

    def test_update_user_password_is_hashed(self):
        """Updated password is stored as a hash, not plain text."""
        self.client.patch(ME_URL, {"password": "newpassword123"})

        self.user.refresh_from_db()
        self.assertNotEqual(self.user.password, "newpassword123")

    def test_update_user_email_is_ignored(self):
        """Attempting to change email via PATCH /me/ has no effect."""
        original_email = self.user.email
        self.client.patch(ME_URL, {"email": "changed@example.com"})

        self.user.refresh_from_db()
        self.assertEqual(self.user.email, original_email)

    # ── Logout ─────────────────────────────────────────────────────────────────

    def test_logout_success(self):
        """Logout blacklists the token and returns HTTP 200 with ok=True."""
        res = self.client.post(LOGOUT_URL, {"refresh": str(self.refresh)})

        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertTrue(res.data["ok"])

    def test_logout_blacklisted_token_error(self):
        """Submitting the same refresh token a second time returns HTTP 400."""
        self.client.post(LOGOUT_URL, {"refresh": str(self.refresh)})
        res = self.client.post(LOGOUT_URL, {"refresh": str(self.refresh)})

        self.assertEqual(res.status_code, status.HTTP_400_BAD_REQUEST)

    def test_logout_invalid_token_error(self):
        """A garbage string as refresh token returns HTTP 400."""
        res = self.client.post(LOGOUT_URL, {"refresh": "not-a-valid-token"})

        self.assertEqual(res.status_code, status.HTTP_400_BAD_REQUEST)

    def test_logout_requires_authentication(self):
        """Unauthenticated logout attempt returns HTTP 401."""
        unauthenticated_client = APIClient()
        res = unauthenticated_client.post(LOGOUT_URL, {"refresh": str(self.refresh)})

        self.assertEqual(res.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_logout_blacklisted_token_cannot_refresh(self):
        """A token blacklisted via logout cannot be used to refresh."""
        self.client.post(LOGOUT_URL, {"refresh": str(self.refresh)})

        anon_client = APIClient()
        res = anon_client.post(TOKEN_REFRESH_URL, {"refresh": str(self.refresh)})

        self.assertEqual(res.status_code, status.HTTP_401_UNAUTHORIZED)
