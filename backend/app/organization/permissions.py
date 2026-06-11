"""
Organization permissions — role-based access control (RBAC).

Design:
  - ROLE_PERMISSIONS maps every role to the set of actions it can perform.
  - role_has_permission() is the single check used everywhere.
  - No DB writes when roles change — Member.role is the source of truth;
    permissions are derived at request time.
  - Org-scoped by definition: the Member row ties a user to a specific org,
  so permissions in org A never bleed into org B.

Roles (lowest → highest):
  staff < manager < admin < owner

Usage in a view:
    from organization.permissions_rbac import HasOrgPermission, OrgAction
    permission_classes = [IsAuthenticated, HasOrgPermission(OrgAction.HIRE_MEMBERS)]
"""

from rest_framework import permissions


class OrgAction:
    """All actions that can be gated by role."""
    FIRE_MEMBERS = "fire_members"
    HIRE_MEMBERS = "hire_members"
    MANAGE_MEMBERS = "manage_members"
    GIVE_MEMBER_PERMISSIONS = "give_members_permissions"
    MANAGE_DEPARTMENT = "manage_department"
    MANAGE_CHAT_ROOMS = "manage_chat_rooms"
    MANAGE_ORG = "manage_org"


ROLE_PERMISSIONS: dict[str, frozenset[str]] = {
    "staff": frozenset([]),  # Read-only; no management actions.
    "manager": frozenset([
        OrgAction.MANAGE_MEMBERS,
        OrgAction.MANAGE_DEPARTMENT,
        OrgAction.MANAGE_CHAT_ROOMS,
    ]),
    "admin": frozenset([
        OrgAction.MANAGE_MEMBERS,
        OrgAction.HIRE_MEMBERS,
        OrgAction.MANAGE_DEPARTMENT,
        OrgAction.MANAGE_CHAT_ROOMS,
        OrgAction.GIVE_MEMBER_PERMISSIONS,
    ]),
    "owner": frozenset([
        OrgAction.FIRE_MEMBERS,
        OrgAction.HIRE_MEMBERS,
        OrgAction.MANAGE_MEMBERS,
        OrgAction.GIVE_MEMBER_PERMISSIONS,
        OrgAction.MANAGE_DEPARTMENT,
        OrgAction.MANAGE_CHAT_ROOMS,
        OrgAction.MANAGE_ORG,
    ]),
}


def role_has_permission(role: str, action: str) -> bool:
    """Return True if *role* is allowed to perform *action*."""
    return action in ROLE_PERMISSIONS.get(role, frozenset())


def _get_member_for_org(user, org):
    """
    Return the active Member row linking *user* to *org*, or None.
    Deferred import to avoid circular dependency:
    """
    from member.models import Member  # noqa: PLC0415

    try:
        return Member.objects.select_related("user").get(
            user=user,
            organization=org,
            is_active=True,
        )
    except Member.DoesNotExist:
        return None


class IsOrgOwner(permissions.BasePermission):
    """
    Allow only the user who owns the Organization object.
    """

    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated)

    def has_object_permission(self, request, view, obj):
        return bool(request.user) and obj.user_id == request.user.pk


class HasOrgPermission(permissions.BasePermission):
    """
    Gate an endpoint on a specific OrgAction.
    Always instantiate with the action you want to guard:
        permission_classes = [IsAuthenticated, HasOrgPermission(OrgAction.HIRE_MEMBERS)]
    has_object_permission resolves the org from obj (which can be an
    Organization instance or any model with an .organization FK).
    """

    def __init__(self, required_action: str):
        self.required_action = required_action

    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated)

    def has_object_permission(self, request, view, obj):
        from organization.models import Organization  # noqa: PLC0415

        if isinstance(obj, Organization):
            org = obj
        elif hasattr(obj, "organization"):
            org = obj.organization
        else:
            return False

        member = _get_member_for_org(request.user, org)
        if member is None:
            return False
        return role_has_permission(member.role, self.required_action)


class IsMemberOfOrg(permissions.BasePermission):
    """
    Passes if the requesting user is an active member of the org.
    Use as a base gate where any role is acceptable
    (e.g. reading your own profile, listing chat rooms you belong to).
    """

    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated)

    def has_object_permission(self, request, view, obj):
        from organization.models import Organization  # noqa: PLC0415

        if isinstance(obj, Organization):
            org = obj
        elif hasattr(obj, "organization"):
            org = obj.organization
        else:
            return False

        return _get_member_for_org(request.user, org) is not None
