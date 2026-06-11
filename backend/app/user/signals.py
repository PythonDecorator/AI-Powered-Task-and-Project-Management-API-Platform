from .models import User, Profile
from django.db.models.signals import post_save
from django.dispatch import receiver


@receiver(post_save, sender=User)
def create_profile(sender, instance, created, **kwargs):  # noqa
    """Create a Profile instance when a User is created and email is verified."""
    if created:
        Profile.objects.get_or_create(user=instance)


@receiver(post_save, sender=User)
def save_profile(sender, instance, **kwargs):  # noqa
    """Save the Profile instance when a User is saved."""
    instance.profile.save()
