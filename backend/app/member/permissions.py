"""
Member app permissions.

All permission logic lives in organization/permissions.py (ROLE_PERMISSIONS).
These classes are thin wrappers that resolve the member from the requesting
user and delegate to the shared RBAC helpers.

Member.role is the single source of truth — no Django user_permissions,
no separate permission model.
"""
from rest_framework import permissions

from organization.permissions import OrgAction, role_has_permission


def get_caller_member(request):
    """
    Return the requesting user's Member record, or None.
    Uses the OneToOne reverse accessor. Guards against users who have no
    member record (e.g. a freshly registered user who hasn't been hired yet).
    """
    try:
        return request.user.member
    except Exception:
        return None


class IsMemberActive(permissions.BasePermission):
    """Base gate: user must be authenticated and have an active Member record."""

    message = "You must be an active member of an organization to perform this action."

    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
        member = get_caller_member(request)
        return member is not None and member.is_active


class _RBACPermission(IsMemberActive):
    """
    Internal base for role-checked permissions.
    Subclasses set `required_action` to an OrgAction constant.
    Inherits the is_active guard from IsMemberActive.
    """
    required_action: str = ""

    def has_permission(self, request, view):
        if not super().has_permission(request, view):
            return False
        member = get_caller_member(request)
        return role_has_permission(member.role, self.required_action)


class CanManageMembers(_RBACPermission):
    required_action = OrgAction.MANAGE_MEMBERS
    message = "You do not have permission to manage members."


class CanHireMember(_RBACPermission):
    required_action = OrgAction.HIRE_MEMBERS
    message = "You do not have permission to hire members."


class CanFireMember(_RBACPermission):
    required_action = OrgAction.FIRE_MEMBERS
    message = "You do not have permission to fire members."


class CanGiveMembersPermissions(_RBACPermission):
    required_action = OrgAction.GIVE_MEMBER_PERMISSIONS
    message = "You do not have permission to change member roles."
