from django.contrib.auth import get_user_model


class TestDb:
    def __init__(self):
        self.password = "testpass123"
        self.name = "Test User"
        self.email = "test@example.com"

        self.org_name = "Test Organization"
        self.member_details = {
            "name": "Test Member",
            "status": "active",
            "salary": 50000.00,
            "role": "Developer",
            "skills": "Python, React",
            "phone": "345 773 377",
            "address": "234 new ST.",
            "emergency_contact_name": "Address 2",
            "emergency_contact_relationship": "Family",
            "emergency_contact_phone": "+2 345 3636 123",
            "emergency_contact_email": "other@example.com",
            "bank_name": "Test Bank",
            "bank_account_number": "4646737378",
            "social_security_number": "863 2627 33",
            'nin': "AZWEE323",
            "passport_number": "12333636",
            "hire_date": "2024-09-02",
            "termination_date": "2025-04-09"
        }

    def create_user(self, email='test@example.com'):
        """Create and return a new user."""
        return get_user_model().objects.create_user(
            email=email,
            password=self.password,
            first_name="Test",
            last_name="User",

        )
