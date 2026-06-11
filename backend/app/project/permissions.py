"""
Project app permissions.
Delegates to the RBAC table in organization/permissions.py.
No Django user_permissions — Member.role is the single source of truth.
"""
from organization.permissions import OrgAction, role_has_permission
from member.permissions import IsMemberActive, get_caller_member


class CanManageProject(IsMemberActive):
    """
    Allow members whose role grants MANAGE_DEPARTMENT (managers, admins, owners).
    Inherits the is_active guard from IsMemberActive.
    """
    message = "You do not have permission to manage projects."

    def has_permission(self, request, view):
        if not super().has_permission(request, view):
            return False
        member = get_caller_member(request)
        return role_has_permission(member.role, OrgAction.MANAGE_DEPARTMENT)


class CanDeleteProject(IsMemberActive):
    """
    Allow only admins and owners
    """
    message = "Only admins and owners can delete projects."

    def has_permission(self, request, view):
        if not super().has_permission(request, view):
            return False
        member = get_caller_member(request)
        return (
                role_has_permission(member.role, OrgAction.GIVE_MEMBER_PERMISSIONS)
                or role_has_permission(member.role, OrgAction.MANAGE_ORG)
        )
