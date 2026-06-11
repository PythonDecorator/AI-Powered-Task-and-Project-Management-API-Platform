"""
Member API Views.
"""
import jwt

from django.conf import settings
from django.contrib.auth import get_user_model
from django.utils import timezone

from rest_framework import permissions, status, mixins, exceptions
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.viewsets import GenericViewSet
from rest_framework_simplejwt.authentication import JWTAuthentication

from django.utils.decorators import method_decorator
from django.views.decorators.cache import cache_page
from django.views.decorators.vary import vary_on_cookie, vary_on_headers
from django.core.cache import cache
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.filters import OrderingFilter, SearchFilter
from django_filters import FilterSet, CharFilter, BooleanFilter

from . import serializers
from .models import Member, MemberInvitationToken
from . import tasks
from .permissions import (
    IsMemberActive,
    CanManageMembers,
    CanHireMember,
    CanFireMember,
    CanGiveMembersPermissions,
)

CACHE_KEY = "cached_members"


class MemberFilter(FilterSet):
    role = CharFilter(field_name="role", lookup_expr="exact")
    working = CharFilter(field_name="working", lookup_expr="exact")
    is_active = BooleanFilter(field_name="is_active")

    class Meta:
        model = Member
        fields = ["role", "working", "is_active"]


def _bust_member_cache():
    """
    Delete all cache keys that match the cached_members prefix.
    Falls back to cache.clear() if the backend doesn't support patterns.
    """
    try:
        cache.delete_pattern(f"*{CACHE_KEY}*")
    except AttributeError:
        cache.clear()


class ManageMemberAPIView(
    mixins.RetrieveModelMixin,
    mixins.UpdateModelMixin,
    mixins.ListModelMixin,
    GenericViewSet,
):
    """Manage members within the authenticated user's organization."""

    authentication_classes = [JWTAuthentication]
    permission_classes = [permissions.IsAuthenticated, CanManageMembers]
    serializer_class = serializers.ManageMemberSerializer
    pagination_class = PaginateItems
    filter_backends = [DjangoFilterBackend, OrderingFilter, SearchFilter]
    filterset_class = MemberFilter
    ordering_fields = ["salary", "hire_date"]
    search_fields = ["name", "role", "skills", "address"]

    # Class-level queryset required by DRF router; get_queryset() narrows it.
    queryset = Member.objects.none()

    def get_queryset(self):
        """Scope to the requesting user's org."""
        base = (
            Member.objects
            .filter(organization=self.request.user.member.organization)
            .select_related("user", "manager", "organization")
            .prefetch_related("departments", "direct_reports")
        )

        ordering = self.request.query_params.get("ordering")
        if ordering == "max_salary":
            return base.order_by("-salary")
        if ordering == "min_salary":
            return base.order_by("salary")
        if ordering == "hire_date":
            return base.order_by("-hire_date")

        return base.order_by("-id")

    def get_permissions(self):
        action_map = {
            "hire_member": [permissions.IsAuthenticated(), CanHireMember()],
            "fire_member": [permissions.IsAuthenticated(), CanFireMember()],
            "change_member_role": [permissions.IsAuthenticated(), CanGiveMembersPermissions()],
        }
        return action_map.get(self.action, super().get_permissions())

    def get_serializer_class(self):
        if self.action == "change_member_role":
            return serializers.MemberRoleSerializer
        return self.serializer_class

    @method_decorator(cache_page(60 * 60 * 2, key_prefix=CACHE_KEY))
    @method_decorator(vary_on_cookie)
    @method_decorator(vary_on_headers("Authorization"))
    def list(self, request, *args, **kwargs):
        """Filtered, ordered, and paginated member list."""
        queryset = self.filter_queryset(self.get_queryset())
        page = self.paginate_queryset(queryset)
        if page is not None:
            return self.get_paginated_response(self.get_serializer(page, many=True).data)
        return Response(self.get_serializer(queryset, many=True).data)

    def retrieve(self, request, *args, **kwargs):
        instance = self.get_object()
        serializer = self.get_serializer(instance)
        return Response(
            {"ok": True, "message": "Member retrieved successfully.", "results": serializer.data}
        )

    def update(self, request, *args, **kwargs):
        kwargs["partial"] = True
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        self.perform_update(serializer)
        _bust_member_cache()
        return Response(
            {"ok": True, "message": "Member updated successfully.", "results": serializer.data}
        )

    def partial_update(self, request, *args, **kwargs):
        return self.update(request, *args, **kwargs)

    @action(methods=["POST"], detail=False, url_path="hire-member")
    def hire_member(self, request, pk=None):  # noqa
        """Create a Member row and email them an invitation link."""
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        member = serializer.save()

        organization = request.user.member.organization
        email = member.email

        payload = {"email": email, "organization_id": organization.id}
        token = jwt.encode(payload, settings.SECRET_KEY, algorithm="HS256")

        _, created = MemberInvitationToken.objects.get_or_create(
            organization=organization,
            email=email,
            defaults={"token": token},
        )

        if not created:
            member.delete()
            return Response(
                {"ok": False, "error": f"{email} has already been invited to this organization."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        tasks.send_invitation_email_to_member_task.delay(
            {"invitation_token": token, "email": email, "first_name": member.name}
        )

        _bust_member_cache()
        return Response(
            {
                "ok": True,
                "message": "Member created. An invitation email has been sent.",
                "results": serializer.data,
            },
            status=status.HTTP_201_CREATED,
        )

    @action(methods=["POST"], detail=True, url_path="fire-member")
    def fire_member(self, request, pk=None):  # noqa
        """Deactivate a member (set is_active=False, record termination date)."""
        instance = self.get_object()

        if instance == request.user.member:
            return Response(
                {"ok": False, "error": "You cannot fire yourself."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        instance.is_active = False
        instance.termination_date = timezone.now().date()
        instance.save(update_fields=["is_active", "termination_date"])

        _bust_member_cache()
        return Response(
            {
                "ok": True,
                "message": "Member has been deactivated.",
                "results": self.get_serializer(instance).data,
            }
        )

    @action(methods=["PATCH"], detail=True, url_path="change-role")
    def change_member_role(self, request, pk=None):  # noqa
        """
        MemberPermission table or Django user_permissions involved.
        """
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        _bust_member_cache()
        return Response(
            {
                "ok": True,
                "message": f"{instance.name}'s role has been updated.",
                "results": serializer.data,
            }
        )


class MemberConfirmInvitationAPIView(APIView):
    """
    Called when the new hire clicks the link in their invitation email.
    """

    def get(self, request):  # noqa
        raw_token = request.GET.get("token", "").strip()
        if not raw_token:
            return Response(
                {"ok": False, "error": "Token is required."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            token_obj = MemberInvitationToken.objects.select_related("organization").get(
                token=raw_token
            )
        except MemberInvitationToken.DoesNotExist:
            return Response(
                {"ok": False, "error": "Invitation token not found or already used."},
                status=status.HTTP_404_NOT_FOUND,
            )

        try:
            payload = jwt.decode(raw_token, settings.SECRET_KEY, algorithms=["HS256"])
        except jwt.ExpiredSignatureError:
            token_obj.delete()
            return Response(
                {"ok": False, "error": "Invitation link has expired. Please ask to be re-invited."},
                status=status.HTTP_400_BAD_REQUEST,
            )
        except jwt.DecodeError:
            raise exceptions.ValidationError("Invalid invitation token.")
        except Exception:
            raise exceptions.ValidationError("An error occurred. Please try again.")

        email = payload["email"]
        organization_id = payload["organization_id"]

        user = get_user_model().objects.filter(email=email).first()
        if not user:
            return Response(
                {
                    "ok": False,
                    "error": f"Please register an account with {email} before using this link.",
                },
                status=status.HTTP_404_NOT_FOUND,
            )

        try:
            new_member = Member.objects.get(
                email=email,
                organization_id=organization_id,
            )
        except Member.DoesNotExist:
            return Response(
                {"ok": False, "error": "Member record not found."},
                status=status.HTTP_404_NOT_FOUND,
            )

        new_member.user = user
        new_member.is_active = True
        new_member.save(update_fields=["user", "is_active"])

        token_obj.delete()

        return Response(
            {
                "ok": True,
                "message": f"Welcome! You have been added to {new_member.organization.name}.",
            }
        )


class MemberSelfAPIView(mixins.RetrieveModelMixin, mixins.UpdateModelMixin, GenericViewSet):
    """
    Lets the authenticated user read and update their own Member record.
    """
    authentication_classes = [JWTAuthentication]
    permission_classes = [permissions.IsAuthenticated, IsMemberActive]
    serializer_class = serializers.ManageMemberSerializer

    def get_object(self):
        return self.request.user.member
