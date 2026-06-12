"""
Helpers for the organization app.
"""
from django.utils import timezone


def create_owner_member_account(organization):
    """
    Auto-create a Member record for whoever created the Organization.
    Called from transaction.on_commit inside the post_save signal, so the
    Organization row is guaranteed to be committed before this runs.
    """
    from member.models import Member  # deferred to avoid circular import

    user = organization.user

    # Compute a display name for the owner user. Some custom User models may
    # expose a `name` attribute (single-field), or implement get_full_name().
    # Fall back to email or the organization name when needed.
    display_name = None
    if hasattr(user, "name") and getattr(user, "name"):
        display_name = user.name
    else:
        try:
            full_name = user.get_full_name()
        except Exception:
            first = getattr(user, "first_name", "") or ""
            last = getattr(user, "last_name", "") or ""
            full_name = (f"{first} {last}".strip()) or None
        display_name = full_name or getattr(user, "email", None) or organization.name

    member_record, _ = Member.objects.get_or_create(
        organization=organization,
        user=user,
        defaults={
            "name": display_name,
            "email": user.email,
            "salary": 0.00,
            "role": "owner",
            "skills": "",
            "phone": "",
            "address": organization.address,
            "nin": "",
            "emergency_contact_name": "",
            "emergency_contact_phone": "",
            "emergency_contact_email": user.email,
            "bank_name": "",
            "bank_account_number": "",
            "social_security_number": "",
            "passport_number": "",
            "hire_date": timezone.now().date(),
            "is_active": True,
        },
    )
    return member_record
