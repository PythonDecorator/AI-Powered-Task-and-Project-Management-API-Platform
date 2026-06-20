"""
All helpers should be written here
"""
import math
import os
import uuid
from collections import OrderedDict

from rest_framework import pagination
from rest_framework.response import Response


def get_permissions(obj):
    """Return a comma-separated list of permissions for the user."""
    user_permissions = obj.user_permissions.all()
    permission_names = [str(permission).split('|')[-1].strip() for permission in user_permissions]
    return ", ".join(permission_names)


def generate_upload_path(folder: str, filename: str) -> str:
    ext = os.path.splitext(filename)[1]
    new_filename = f"{uuid.uuid4()}{ext}"  # noqa
    return os.path.join("uploads", folder, new_filename)


class PaginateItems(pagination.PageNumberPagination):
    page_size = 10
    page_size_query_param = "per_page"
    max_page_size = 25

    def get_paginated_response(self, data):
        return Response(
            OrderedDict([
                ("totalItems", self.page.paginator.count),
                ("countItemsOnPage", self.page_size),
                ("currentPage", self.page.number),
                ("next", self.get_next_link()),
                ("previous", self.get_previous_link()),
                ("totalPages", math.ceil(self.page.paginator.count / self.page_size)),
                ("results", data),
            ])
        )
