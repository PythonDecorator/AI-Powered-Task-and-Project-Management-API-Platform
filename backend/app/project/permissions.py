"""
Project app permissions.

Delegates to the RBAC table in organization/permissions_rbac.py.
No Django user_permissions — Member.role is the single source of truth.
"""
from organization.permissions_rbac import OrgAction, role_has_permission
from member.permissions import IsMemberActive, _get_caller_member


class CanManageProject(IsMemberActive):
    """
    Allow members whose role grants MANAGE_DEPARTMENT (managers, admins, owners).

    Used for create / update / assign actions.
    Inherits the is_active guard from IsMemberActive.
    """
    message = "You do not have permission to manage projects."

    def has_permission(self, request, view):
        if not super().has_permission(request, view):
            return False
        member = _get_caller_member(request)
        return role_has_permission(member.role, OrgAction.MANAGE_DEPARTMENT)


class CanDeleteProject(IsMemberActive):
    """
    Allow only admins and owners to delete projects.

    MANAGE_ORG is held by admin + owner, which maps neatly to the
    "delete project" row in the permissions table.
    """
    message = "Only admins and owners can delete projects."

    def has_permission(self, request, view):
        if not super().has_permission(request, view):
            return False
        member = _get_caller_member(request)
        # admin has GIVE_MEMBER_PERMISSIONS; owner has MANAGE_ORG.
        # Use GIVE_MEMBER_PERMISSIONS as the admin gate (owner has it too
        # through ROLE_PERMISSIONS) — or check both explicitly.
        return (
            role_has_permission(member.role, OrgAction.GIVE_MEMBER_PERMISSIONS)
            or role_has_permission(member.role, OrgAction.MANAGE_ORG)
        )
