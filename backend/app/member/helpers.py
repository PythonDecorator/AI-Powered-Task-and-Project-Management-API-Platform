"""
All helpers for the organization
"""

from member.models import Member
from django.utils import timezone


def create_member_owner_member_account(member):
    """Create a member account automatically with signals for the person who created the Organization"""
    owner_details = {
        "name": member.name,
        "email": member.user.email,
        "salary": 00.00,
        "role": "owner",
        "skills": "CEO",
        "phone": "11111111",
        "address": member.address,
        "nin": member.nin,
        "emergency_contact_name": member.name,
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
