"""
Department app permissions.

Delegates to the RBAC table in organization/permissions.py.
No Django user_permissions — Member.role is the single source of truth.
"""
from organization.permissions import OrgAction, role_has_permission
from member.permissions import IsMemberActive, _get_caller_member


class CanManageDepartment(IsMemberActive):
    """
    Allow only members whose role grants MANAGE_DEPARTMENT.

    Inherits the is_active guard from IsMemberActive so inactive members
    are always rejected before the role check runs.
    """
    message = "You do not have permission to manage departments."

    def has_permission(self, request, view):
        if not super().has_permission(request, view):
            return False
        member = _get_caller_member(request)
        return role_has_permission(member.role, OrgAction.MANAGE_DEPARTMENT)
