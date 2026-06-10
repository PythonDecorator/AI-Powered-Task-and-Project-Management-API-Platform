from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from decouple import config

User = get_user_model()


class Command(BaseCommand):
    help = 'Create a superuser from environment variables'

    def handle(self, *args, **options):
        email = config('SUPERUSER_EMAIL', default='admin@example.com')
        password = config('SUPERUSER_PASSWORD', default='admin123')

        if User.objects.filter(email=email).exists():
            self.stdout.write(
                self.style.WARNING(f'Superuser "{email}" already exists.')
            )
            return

        User.objects.create_superuser(
            email=email,
            password=password
        )
        self.stdout.write(
            self.style.SUCCESS(f'Superuser "{email}" created successfully!')
        )
