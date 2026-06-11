"""
All helpers should be written here
"""
import os
import uuid
from member.models import Member
from django.utils import timezone


def get_permissions(obj):
    """Return a comma-separated list of permissions for the user."""
    user_permissions = obj.user_permissions.all()
    permission_names = [str(permission).split('|')[-1].strip() for permission in user_permissions]
    return ", ".join(permission_names)


def image_upload_file_path(instance, filename):  # noqa
    """Generate file path for new user profile image."""
    ext = os.path.splitext(filename)[1]
    filename = f'{uuid.uuid4()}{ext}'

    return os.path.join('uploads', 'profile', filename)


def create_member_owner_member_account(member):
    """Create a member account automatically with signals for the person who created the Organization"""
    owner_details = {
        "name": member.name,
        "email": member.user.email,
        "status": "active",
        "salary": 00.00,
        "role": "owner",
        "skills": "CEO",
        "phone": "11111111",
        "address": member.address,
        "nin": member.nin,
        "emergency_contact_name": member.name,
        "emergency_contact_relationship": member.name,
        "emergency_contact_phone": "1111111",
        "emergency_contact_email": member.user.email,
        "bank_name": "Owner Bank",
        "bank_account_number": "1111111",
        "social_security_number": "1111111",
        "passport_number": "1111111",
        "hire_date": timezone.now().date(),
    }
    member = Member.objects.create(member=member, **owner_details)
    member.user = member.user
    member.is_active = True
    member.save()
