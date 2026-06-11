"""
Company Department API Views
"""
from rest_framework import permissions, viewsets, status, authentication
from rest_framework.response import Response

from . import serializers
from core.authentication import JWTAuthentication
from .models import Department
from .permissions import CanManageDepartment


class ManageDepartmentAPIView(viewsets.ModelViewSet):
    """View for manage company departments APIs."""
    serializer_class = serializers.DepartmentSerializer
    queryset = Department.objects.all()
    authentication_classes = [JWTAuthentication, authentication.TokenAuthentication]
    permission_classes = [permissions.IsAuthenticated, CanManageDepartment]

    def get_queryset(self):
        """Retrieve Departments for the Company of the authenticated user."""
        queryset = self.queryset.filter(company=self.request.user.employee.company)

        return queryset.order_by('-id').distinct()

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data, context={'request': request})
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)
        return Response(serializer.data, status=status.HTTP_201_CREATED)
