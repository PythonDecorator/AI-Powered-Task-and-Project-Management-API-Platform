"""
Department API Views.
"""
from rest_framework import permissions, viewsets, status
from rest_framework.response import Response
from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework.filters import SearchFilter, OrderingFilter
from django_filters.rest_framework import DjangoFilterBackend

from utils.helpers import PaginateItems
from . import serializers
from .models import Department
from .permissions import CanManageDepartment


class ManageDepartmentAPIView(viewsets.ModelViewSet):
    """
    CRUD for departments scoped to the authenticated user's organization.
    """

    serializer_class = serializers.DepartmentSerializer
    authentication_classes = [JWTAuthentication]
    permission_classes = [permissions.IsAuthenticated, CanManageDepartment]
    pagination_class = PaginateItems
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]

    # Enable search and filtering
    search_fields = ['name']
    ordering_fields = ['id', 'name', 'created_at']

    # Class-level queryset required by DRF router; get_queryset() narrows it.
    queryset = Department.objects.none()

    def get_queryset(self):
        """Scope to the authenticated user's organization."""
        return (
            Department.objects
            .filter(organization=self.request.user.member.organization)
            .select_related("head", "organization")
            .prefetch_related("members")
            .order_by("-id")
            .distinct()
        )

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        department = serializer.save()
        return Response(
            {
                "ok": True,
                "message": "Department created successfully.",
                "results": self.get_serializer(department).data,
            },
            status=status.HTTP_201_CREATED,
        )

    # ── Retrieve ───────────────────────────────────────────────────────────────

    def retrieve(self, request, *args, **kwargs):
        instance = self.get_object()
        serializer = self.get_serializer(instance)
        return Response(
            {"ok": True, "message": "Department retrieved successfully.", "results": serializer.data}
        )

    # ── Update ─────────────────────────────────────────────────────────────────

    def update(self, request, *args, **kwargs):
        kwargs["partial"] = True
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(
            {"ok": True, "message": "Department updated successfully.", "results": serializer.data}
        )

    def partial_update(self, request, *args, **kwargs):
        return self.update(request, *args, **kwargs)

    # ── List ───────────────────────────────────────────────────────────────────

    def list(self, request, *args, **kwargs):
        queryset = self.filter_queryset(self.get_queryset())
        page = self.paginate_queryset(queryset)
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            return self.get_paginated_response(serializer.data)

        serializer = self.get_serializer(queryset, many=True)
        return Response({
            "ok": True,
            "results": serializer.data,
            "count": queryset.count()
        })

    # ── Destroy ────────────────────────────────────────────────────────────────

    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        name = instance.name
        self.perform_destroy(instance)
        return Response(
            {"ok": True, "message": f"Department '{name}' deleted successfully."},
            status=status.HTTP_200_OK,
        )
