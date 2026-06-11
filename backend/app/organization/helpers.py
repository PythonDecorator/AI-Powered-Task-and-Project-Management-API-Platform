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

    member_record, _ = Member.objects.get_or_create(
        organization=organization,
        user=user,
        defaults={
            "name": user.get_full_name() or organization.name,
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
