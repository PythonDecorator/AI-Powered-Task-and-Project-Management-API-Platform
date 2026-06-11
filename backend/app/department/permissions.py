from rest_framework import permissions


class CanManageDepartment(permissions.BasePermission):
    """
    Custom permission to only allow permitted employees to manage departments.
    """

    def has_permission(self, request, view):
        if not request.user.employee.is_active:
            return False

        return request.user.has_perm('company.manage_department')
