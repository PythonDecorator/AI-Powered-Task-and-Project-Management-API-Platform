from rest_framework import permissions


class CanManageEmployees(permissions.BasePermission):
    """
    Custom permission to only allow permitted employees to manage employees.
    """

    def has_permission(self, request, view):
        """
        Return `True` if the user making the request is authenticated.
        """
        if not request.user.employee.is_active:
            return False

        return request.user.has_perm('company.manage_employees')


class CanHireEmployee(permissions.BasePermission):
    """
    Custom permission to only allow users from the same company to hire employees.
    """

    def has_permission(self, request, view):
        """
        Return `True` if the user making the request belongs to the company.
        """
        if not request.user.employee.is_active:
            return False

        return request.user.has_perm('company.hire_employees')


class CanFireEmployee(permissions.BasePermission):
    """
    Custom permission to only allow users from the same company to fire employees.
    """

    def has_permission(self, request, view):
        """
        Return `True` if the user making the request belongs to the company and has the necessary permissions.
        """
        if not request.user.employee.is_active:
            return False

        return request.user.has_perm('company.fire_employees')


class CanGiveEmployeesPermissions(permissions.BasePermission):
    """
    Custom permission to only allow permitted employees to give other employees permissions.
    """

    def has_permission(self, request, view):
        """
        Return `True` if the user making the request has permission.
        """
        if not request.user.employee.is_active:
            return False

        return request.user.has_perm('company.give_employees_permissions')
