"""
Project API Views.
"""

from rest_framework import permissions, viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework_simplejwt.authentication import JWTAuthentication

from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.filters import OrderingFilter, SearchFilter
from django_filters import FilterSet, CharFilter

from member.permissions import IsMemberActive
from utils.helpers import PaginateItems
from . import serializers
from .models import Project
from .permissions import CanManageProject, CanDeleteProject


class ProjectFilter(FilterSet):
    status = CharFilter(field_name="status", lookup_expr="exact")
    priority = CharFilter(field_name="priority", lookup_expr="exact")

    class Meta:
        model = Project
        fields = ["status", "priority"]


class ManageProjectAPIView(viewsets.ModelViewSet):
    """
    CRUD for projects scoped to the authenticated user's organization.
    """
    serializer_class = serializers.ProjectSerializer
    authentication_classes = [JWTAuthentication]
    permission_classes = [permissions.IsAuthenticated, IsMemberActive]
    pagination_class = PaginateItems
    filter_backends = [DjangoFilterBackend, OrderingFilter, SearchFilter]
    filterset_class = ProjectFilter
    ordering_fields = ["start_date", "due_date", "priority"]
    search_fields = ["name", "description", "status"]

    # Class-level queryset required by DRF router; get_queryset() narrows it.
    queryset = Project.objects.none()

    def get_queryset(self):
        """Scope to the requesting user's org."""
        return (
            Project.objects
            .filter(organization=self.request.user.member.organization)
            .select_related("lead", "organization")
            .prefetch_related("departments", "members")
            .order_by("-id")
        )

    def get_permissions(self):
        write_actions = {"create", "update", "partial_update",
                         "assign_members", "assign_departments", "change_lead"}
        delete_actions = {"destroy"}

        if self.action in write_actions:
            return [permissions.IsAuthenticated(), CanManageProject()]
        if self.action in delete_actions:
            return [permissions.IsAuthenticated(), CanDeleteProject()]
        # list / retrieve → any active member
        return super().get_permissions()

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        project = serializer.save()
        return Response(
            {
                "ok": True,
                "message": "Project created successfully.",
                "results": self.get_serializer(project).data,
            },
            status=status.HTTP_201_CREATED,
        )

    def retrieve(self, request, *args, **kwargs):
        instance = self.get_object()
        serializer = self.get_serializer(instance)
        return Response(
            {"ok": True, "message": "Project retrieved successfully.", "results": serializer.data}
        )

    def update(self, request, *args, **kwargs):
        kwargs["partial"] = True
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(
            {"ok": True, "message": "Project updated successfully.", "results": serializer.data}
        )

    def partial_update(self, request, *args, **kwargs):
        return self.update(request, *args, **kwargs)

    def list(self, request, *args, **kwargs):
        queryset = self.filter_queryset(self.get_queryset())
        page = self.paginate_queryset(queryset)
        if page is not None:
            return self.get_paginated_response(self.get_serializer(page, many=True).data)
        return Response({"ok": True, "results": self.get_serializer(queryset, many=True).data})

    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        name = instance.name
        self.perform_destroy(instance)
        return Response(
            {"ok": True, "message": f"Project '{name}' deleted successfully."},
            status=status.HTTP_200_OK,
        )

    @action(methods=["PATCH"], detail=True, url_path="assign-members")
    def assign_members(self, request, pk=None):  # noqa
        """
        Replace the project's member list.
        Body: { "members": [<pk>, <pk>, ...] }
        """
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(
            {
                "ok": True,
                "message": "Project members updated successfully.",
                "results": self.get_serializer(instance).data,
            }
        )

    @action(methods=["PATCH"], detail=True, url_path="assign-departments")
    def assign_departments(self, request, pk=None):  # noqa
        """
        Replace the project's department list.
        Body: { "departments": [<pk>, <pk>, ...] }
        """
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(
            {
                "ok": True,
                "message": "Project departments updated successfully.",
                "results": self.get_serializer(instance).data,
            }
        )

    @action(methods=["PATCH"], detail=True, url_path="change-lead")
    def change_lead(self, request, pk=None):  # noqa
        """
        Set or replace the project lead.
        Body: { "lead": <member_pk> }  or  { "lead": null }
        """
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(
            {
                "ok": True,
                "message": "Project lead updated successfully.",
                "results": self.get_serializer(instance).data,
            }
        )
