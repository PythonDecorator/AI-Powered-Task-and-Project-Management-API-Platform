from django.contrib.auth import get_user_model
from django.test import TestCase

from user.models import User
from utils.create_test_model import TestDb


class UserModelTest(TestCase):
    def setUp(self):
        self.test_db = TestDb()
        self.user = self.test_db.create_user()

    def test_user_creation(self):
        self.assertEqual(self.user.email, self.test_db.email)
        self.assertTrue(self.user.check_password(self.test_db.password))

    def test_user_email_unique(self):
        with self.assertRaises(Exception):
            self.test_db.create_user()

    def test_user_str(self):
        user_with_name = User.objects.create_user(
            first_name='John',
            last_name='Doe',
            email='john@example.com',
            password='pass123'
        )
        self.assertEqual(str(user_with_name), 'John Doe')

    def test_superuser_creation(self):
        superuser = User.objects.create_superuser(
            email='admin@example.com',
            password='adminpass123'
        )
        self.assertTrue(superuser.is_staff)
        self.assertTrue(superuser.is_superuser)

    def test_user_full_name(self):
        user = User.objects.create_user(
            first_name='Jane',
            last_name='Smith',
            email='jane@example.com',
            password='pass123'
        )
        self.assertEqual(user.name, 'Jane Smith')

    def test_user_password_not_stored_plain(self):
        self.assertNotEqual(self.user.password, self.test_db.password)

    def test_user_permissions(self):
        self.assertFalse(self.user.is_staff)
        self.assertFalse(self.user.is_superuser)

    def test_creating_user_creates_profile(self):
        """Test that the full name attr is created after creating a user."""
        first_name = "First"
        last_name = "Last"
        email = "test4@example.com",
        user = get_user_model().objects.create(
            email=email,
            password="password123",
            first_name=first_name,
            last_name=last_name,
        )

        self.assertEqual(str(user.profile), user.name)
        self.assertEqual(user.name, f"{first_name} {last_name}")
