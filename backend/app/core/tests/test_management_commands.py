from io import StringIO
from django.test import TestCase
from django.core.management import call_command
from django.contrib.auth import get_user_model
from unittest.mock import patch

User = get_user_model()


class CreateSuperuserCommandTest(TestCase):
    def test_create_superuser_with_env_vars(self):
        with patch('core.management.commands.create_superuser.config') as mock_config:
            mock_config.side_effect = lambda key, default=None: {
                'SUPERUSER_EMAIL': 'admin@test.com',
                'SUPERUSER_PASSWORD': 'testpass123'
            }.get(key, default)

            out = StringIO()
            call_command('create_superuser', stdout=out)

            self.assertTrue(User.objects.filter(email='admin@test.com').exists())
            superuser = User.objects.get(email='admin@test.com')
            self.assertEqual(superuser.email, 'admin@test.com')
            self.assertTrue(superuser.is_superuser)
            self.assertTrue(superuser.is_staff)
            self.assertIn('created successfully', out.getvalue())

    def test_create_superuser_already_exists(self):
        User.objects.create_superuser(
            email='existing@test.com',
            password='pass123'
        )

        with patch('core.management.commands.create_superuser.config') as mock_config:
            mock_config.side_effect = lambda key, default=None: {
                'SUPERUSER_EMAIL': 'existing@test.com',
                'SUPERUSER_PASSWORD': 'newpass123'
            }.get(key, default)

            out = StringIO()
            call_command('create_superuser', stdout=out)

            self.assertIn('already exists', out.getvalue())

    def test_create_superuser_default_values(self):
        out = StringIO()
        call_command('create_superuser', stdout=out)

        self.assertTrue(User.objects.filter(email='admin@example.com').exists())
        superuser = User.objects.get(email='admin@example.com')
        self.assertEqual(superuser.email, 'admin@example.com')
        self.assertTrue(superuser.is_superuser)

    def test_create_superuser_can_login(self):
        with patch('core.management.commands.create_superuser.config') as mock_config:
            mock_config.side_effect = lambda key, default=None: {
                'SUPERUSER_EMAIL': 'login@test.com',
                'SUPERUSER_PASSWORD': 'loginpass123'
            }.get(key, default)

            call_command('create_superuser')

            superuser = User.objects.get(email='login@test.com')
            self.assertTrue(superuser.check_password('loginpass123'))
