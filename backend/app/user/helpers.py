import secrets
from rest_framework_simplejwt.token_blacklist.models import BlacklistedToken, OutstandingToken

def generate_six_digit_code() -> str:
    """Return a cryptographically secure 6-digit string.
    code cannot be predicted even if the process's RNG state is known.
    """
    return str(secrets.randbelow(900_000) + 100_000)


def blacklist_all_user_tokens(user):
    """Blacklist every outstanding refresh token for a user.

    Called after a password reset so existing sessions cannot be replayed.
    """
    for outstanding in OutstandingToken.objects.filter(user=user):
        BlacklistedToken.objects.get_or_create(token=outstanding)


