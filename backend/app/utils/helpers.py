"""
All helpers should be written here
"""
import os
import uuid


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
