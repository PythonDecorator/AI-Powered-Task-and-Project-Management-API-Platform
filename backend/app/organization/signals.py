"""
Organization signals.

With RBAC, permissions are derived at request time from ROLE_PERMISSIONS
on the Member's role — no per-user Django permissions are needed.
The signal simply bootstraps the owner Member record when an org is created.
"""
from django.db import transaction
from django.db.models.signals import post_save
from django.dispatch import receiver

from .models import Organization
from .helpers import create_owner_member_account


@receiver(post_save, sender=Organization)
def bootstrap_new_organization(sender, instance, created, **kwargs):  # noqa
    """
    On org creation: create the owner Member record inside on_commit.

    Deferred via transaction.on_commit so the callback runs AFTER the
    Organization row is fully committed.  If the transaction is rolled back
    for any reason the callback is never fired — no orphan Member rows.
    """
    if not created:
        return

    transaction.on_commit(lambda: create_owner_member_account(instance))
