"""
Organization API Views.
"""
from django.db import IntegrityError
from rest_framework import permissions, viewsets, status, mixins
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework_simplejwt.authentication import JWTAuthentication

from . import serializers
from organization.models import Organization, OrganizationEmail
from .permissions_rbac import IsOrgOwner


class ManageOrganizationAPIView(
    mixins.CreateModelMixin,
    mixins.RetrieveModelMixin,
    mixins.UpdateModelMixin,
    mixins.DestroyModelMixin,
    viewsets.GenericViewSet,
):
    """CRUD + extras for the authenticated user's organization."""

    authentication_classes = [JWTAuthentication]
    # IsOrgOwner covers update + destroy via has_object_permission.
    permission_classes     = [permissions.IsAuthenticated, IsOrgOwner]
    serializer_class       = serializers.OrganizationDetailsSerializer

    # ── Queryset ───────────────────────────────────────────────────────────────

    def get_queryset(self):
        """Scope to the requesting user's org; prefetch to avoid N+1 queries."""
        return (
            Organization.objects
            .filter(user=self.request.user)
            .select_related("user")
            .prefetch_related("organization_emails")
        )

    # ── Serializer dispatch ────────────────────────────────────────────────────

    def get_serializer_class(self):
        if self.action == "change_logo":
            return serializers.OrganizationLogoSerializer
        if self.action in ("emails", "add_email"):
            return serializers.OrganizationEmailSerializer
        return self.serializer_class

    # ── Standard actions ───────────────────────────────────────────────────────

    def create(self, request, *args, **kwargs):
        if Organization.objects.filter(user=request.user).exists():
            return Response(
                {
                    "ok": False,
                    "error": (
                        "You already have an organization. "
                        "To create another one, register with a different email."
                    ),
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        try:
            self.perform_create(serializer)
        except IntegrityError:
            return Response(
                {"ok": False, "error": "Organization already exists for this account."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        return Response(
            {
                "ok": True,
                "message": "Organization created successfully.",
                "results": serializer.data,
            },
            status=status.HTTP_201_CREATED,
        )

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

    def retrieve(self, request, *args, **kwargs):
        instance   = self.get_object()
        serializer = self.get_serializer(instance)
        return Response(
            {"ok": True, "message": "Organization retrieved successfully.", "results": serializer.data}
        )

    def update(self, request, *args, **kwargs):
        partial    = kwargs.pop("partial", False)
        instance   = self.get_object()
        serializer = self.get_serializer(instance, data=request.data, partial=partial)
        serializer.is_valid(raise_exception=True)
        self.perform_update(serializer)
        return Response(
            {"ok": True, "message": "Organization updated successfully.", "results": serializer.data}
        )

    def partial_update(self, request, *args, **kwargs):
        kwargs["partial"] = True
        return self.update(request, *args, **kwargs)

    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        self.perform_destroy(instance)
        return Response(
            {"ok": True, "message": "Organization deleted successfully."},
            status=status.HTTP_200_OK,
        )

    # ── Logo ───────────────────────────────────────────────────────────────────

    @action(methods=["POST"], detail=True, url_path="change-logo")
    def change_logo(self, request, pk=None):  # noqa
        """Replace the organization logo."""
        organization = self.get_object()  # triggers IsOrgOwner.has_object_permission
        serializer   = self.get_serializer(organization, data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(
            {"ok": True, "message": "Logo updated successfully.", "results": serializer.data},
            status=status.HTTP_200_OK,
        )

    # ── Emails ─────────────────────────────────────────────────────────────────

    @action(methods=["GET"], detail=True, url_path="emails")
    def emails(self, request, pk=None):  # noqa
        """List all contact emails for the organization (paginated)."""
        organization = self.get_object()
        qs   = organization.organization_emails.all()
        page = self.paginate_queryset(qs)
        if page is not None:
            return self.get_paginated_response(self.get_serializer(page, many=True).data)
        return Response(
            {"ok": True, "message": "Emails retrieved successfully.", "results": self.get_serializer(qs, many=True).data}
        )

    @action(methods=["POST"], detail=True, url_path="emails/add")
    def add_email(self, request, pk=None):  # noqa
        """Add a contact email to the organization."""
        organization = self.get_object()
        serializer   = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        OrganizationEmail.objects.get_or_create(
            organization=organization,
            email=serializer.validated_data["email"],
        )
        return Response(
            {"ok": True, "message": "Email added successfully.", "results": serializer.data},
            status=status.HTTP_201_CREATED,
        )

    @action(
        methods=["DELETE"],
        detail=True,
        url_path=r"emails/(?P<email_pk>[0-9]+)/remove",
    )
    def remove_email(self, request, pk=None, email_pk=None):  # noqa
        """Remove a contact email from the organization by its ID."""
        organization = self.get_object()
        try:
            email_obj = organization.organization_emails.get(pk=email_pk)
        except OrganizationEmail.DoesNotExist:
            return Response(
                {"ok": False, "error": "Email not found on this organization."},
                status=status.HTTP_404_NOT_FOUND,
            )
        email_obj.delete()
        return Response(
            {"ok": True, "message": "Email removed successfully."},
            status=status.HTTP_200_OK,
        )
