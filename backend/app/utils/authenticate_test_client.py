from django.utils import timezone

from core.authentication import JWTAuthentication
from core.models import UserToken
from rest_framework.test import APIClient


def authenticated_api_client(user) -> APIClient:
    """Authenticates a test user and returns the APIClient"""
    # Generate JWT token for the user
    user.is_email_confirmed = True
    user.profile.has_passcode_authenticated = True
    user.save()
    user.refresh_from_db()

    token = JWTAuthentication.generate_jwt(user.id)

    # Add te token to db
    UserToken.objects.create(
        user=user,
        token=token,
        expired_at=timezone.now() + timezone.timedelta(days=1)
    )

    # Set up APIClient and include token in the headers
    client = APIClient()
    client.credentials(HTTP_AUTHORIZATION=f'Bearer {token}')

    return client
