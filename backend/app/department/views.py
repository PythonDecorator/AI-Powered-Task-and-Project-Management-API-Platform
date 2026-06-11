"""
Department API Views.
"""
from rest_framework import permissions, viewsets, status
from rest_framework.response import Response
from rest_framework_simplejwt.authentication import JWTAuthentication

from . import serializers
from .models import Department
from .permissions import CanManageDepartment


class ManageDepartmentAPIView(viewsets.ModelViewSet):
    """
    CRUD for departments scoped to the authenticated user's organization.

    Permission:
      - List / Retrieve: any active member (CanManageDepartment checks is_active
        + role ≥ manager).
      - Create / Update / Destroy: same gate — managers, admins, and owners.

    If you need finer-grained separation (e.g. all active members can list,
    only managers+ can write), split into two viewsets or override
    get_permissions() per action.
    """

    serializer_class       = serializers.DepartmentSerializer
    authentication_classes = [JWTAuthentication]
    permission_classes     = [permissions.IsAuthenticated, CanManageDepartment]

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

    # ── Create ─────────────────────────────────────────────────────────────────

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
        instance   = self.get_object()
        serializer = self.get_serializer(instance)
        return Response(
            {"ok": True, "message": "Department retrieved successfully.", "results": serializer.data}
        )

    # ── Update ─────────────────────────────────────────────────────────────────

    def update(self, request, *args, **kwargs):
        kwargs["partial"] = True
        instance   = self.get_object()
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
        queryset   = self.filter_queryset(self.get_queryset())
        serializer = self.get_serializer(queryset, many=True)
        return Response(
            {"ok": True, "results": serializer.data}
        )

    # ── Destroy ────────────────────────────────────────────────────────────────

    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        name     = instance.name
        self.perform_destroy(instance)
        return Response(
            {"ok": True, "message": f"Department '{name}' deleted successfully."},
            status=status.HTTP_200_OK,
        )
