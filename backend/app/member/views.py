"""
Company Employee API Views
"""
import math
import jwt
from collections import OrderedDict

from django.conf import settings
from django.contrib.auth import get_user_model
from django.utils import timezone

from rest_framework import permissions, viewsets, status, authentication, exceptions, mixins, pagination
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.viewsets import GenericViewSet

from django.utils.decorators import method_decorator
from django.views.decorators.cache import cache_page
from django.core.cache import cache
from django.views.decorators.vary import vary_on_cookie, vary_on_headers
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.filters import OrderingFilter, SearchFilter
from django_redis import get_redis_connection  # noqa
from django_filters import FilterSet, CharFilter, BooleanFilter

from . import serializers
from core.authentication import JWTAuthentication
from employee.models import Employee
from . import permissions as perms
from .models import EmployeeInvitationToken
from . import tasks
from .permissions import CanManageEmployees


class PaginateItems(pagination.PageNumberPagination):
    page_size = 15
    page_size_query_param = 'per_page'
    max_page_size = 25

    def get_paginated_response(self, data):
        return Response(
            OrderedDict([
                ('totalItems', self.page.paginator.count),
                ('countItemsOnPage', self.page_size),
                ('currentPage', self.page.number),
                ('next', self.get_next_link()),
                ('previous', self.get_previous_link()),
                ('totalPages',  math.ceil(self.page.paginator.count / self.page_size)),
                ('results', data)
            ]))


class EmployeeFilter(FilterSet):
    role = CharFilter(field_name='role', lookup_expr='exact')
    status = CharFilter(field_name='status', lookup_expr='exact')
    is_active = BooleanFilter(field_name='is_active')

    class Meta:
        model = Employee
        fields = ['role', "status", 'is_active']


class ManageEmployeeAPIView(mixins.RetrieveModelMixin,
                            mixins.UpdateModelMixin,
                            mixins.ListModelMixin,
                            GenericViewSet):
    """Manage an employee for a company."""
    serializer_class = serializers.ManageEmployeeSerializer
    authentication_classes = [JWTAuthentication, authentication.TokenAuthentication]
    permission_classes = [permissions.IsAuthenticated, CanManageEmployees]
    pagination_class = PaginateItems
    filter_backends = [DjangoFilterBackend, OrderingFilter, SearchFilter]
    filterset_class = EmployeeFilter
    ordering_fields = ["salary"]
    search_fields = ['name', 'role', 'skills', 'address']

    queryset = Employee.objects.all()

    def get_queryset(self):
        """Retrieve Employees for the Company of the authenticated user."""
        queryset = Employee.objects.filter(company=self.request.user.employee.company)

        if 'ordering' in self.request.query_params:
            query_param = self.request.query_params['ordering']

            if query_param == 'max_salary':
                return queryset.order_by('-salary').distinct()
            if query_param == 'min_salary':
                return queryset.order_by('salary').distinct()
            if query_param == 'hire_date':
                return queryset.order_by('-hire_date').distinct()

        return queryset.order_by('-id').distinct()

    def get_permissions(self):
        if self.action == 'hire_employee':
            return [permissions.IsAuthenticated(), perms.CanHireEmployee()]
        elif self.action == 'fire_employee':
            return [permissions.IsAuthenticated(), perms.CanFireEmployee()]
        elif self.action == 'give_employee_permissions':
            return [permissions.IsAuthenticated(), perms.CanGiveEmployeesPermissions()]

        return super().get_permissions()

    def get_serializer_class(self):
        """Return the serializer class for request."""
        if self.action == 'give_employee_permissions':
            return serializers.EmployeePermissionsSerializer

        return self.serializer_class

    @method_decorator(cache_page(60 * 60 * 2, key_prefix='cached_employees'))
    @method_decorator(vary_on_cookie)
    @method_decorator(vary_on_headers("Authorization"))
    def list(self, request, *args, **kwargs):
        """Return searched, ordered, filtered and paginated employee(s)"""
        queryset = self.filter_queryset(self.get_queryset())

        page = self.paginate_queryset(queryset)

        if page is not None:
            serializer = self.get_serializer(page, many=True)
            return self.get_paginated_response(serializer.data)

        serializer = self.get_serializer(queryset, many=True)

        return Response(serializer.data)

    def update(self, request, *args, **kwargs):
        """Update an existing employee."""
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data, context={'request': request}, partial=True)
        serializer.is_valid(raise_exception=True)
        self.perform_update(serializer)

        # Invalidate cache after updating employee
        cache.delete('cached_employees')

        return Response(serializer.data, status=status.HTTP_200_OK)

    def retrieve(self, request, *args, **kwargs):
        instance = self.get_object()
        serializer = self.get_serializer(instance)
        response_data = {
            "ok": True,
            "message": "Employee retrieve successfully.",
            "results": serializer.data
        }
        return Response(response_data, status=status.HTTP_200_OK)

    @action(methods=['POST'], detail=False, url_path='hire-employee')
    def hire_employee(self, request, pk=None):  # noqa
        """Create employee"""
        serializer = self.get_serializer(data=request.data, context={'request': request})
        serializer.is_valid(raise_exception=True)
        serializer.save()

        email = serializer.data["email"]
        company = request.user.employee.company

        # Create invitation token
        payload = {"email": email, "company_id": company.id}
        token = jwt.encode(payload, settings.SECRET_KEY, algorithm='HS256')
        token_obj, created = EmployeeInvitationToken.objects.get_or_create(company=company, token=token)

        if not created:
            return Response({"error": f"The user with email {email} already exist in your company."},
                            status=status.HTTP_400_BAD_REQUEST)

        # Send email confirmation
        data = {"token": token_obj.token, "email": email, "company_name": company.name}

        # Send invitation email asynchronously
        getattr(tasks, "send_invitation_email_to_employee_task").delay(data)

        # Clear cache
        cache.delete('cached_employees')

        response_data = {
            "ok": True,
            "message": "Employee created successfully. A confirmation email has been sent to the employee's email.",
            "results": serializer.data
        }

        return Response(response_data, status=status.HTTP_201_CREATED)

    @action(methods=['GET'], detail=True, url_path='fire-employee')
    def fire_employee(self, request, pk=None):  # noqa
        """Fire employee"""
        instance = self.get_object()
        instance.is_active = False
        instance.termination_date = timezone.now().date()
        instance.save()
        instance.refresh_from_db()
        serializer = self.get_serializer(instance)

        # Clear cache
        cache.delete('cached_employees')

        response_data = {
            "ok": True,
            "message": "Employee have been fired.",
            "results": serializer.data
        }
        return Response(response_data, status=status.HTTP_200_OK)

    @action(methods=['PATCH'], detail=True, url_path='give-employee-permissions')
    def give_employee_permissions(self, request, pk=None):  # noqa
        """Give employees permissions"""
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        self.perform_update(serializer)

        # Invalidate cached employees
        cache.delete('cached_employees')

        return Response(serializer.data, status=status.HTTP_200_OK)


class EmployeeConfirmInvitationAPIView(APIView):
    """Employee invitation email confirmation view"""

    def get(self, request):  # noqa
        token = request.GET.get('token')
        exists = EmployeeInvitationToken.objects.filter(token=token).exists()

        if not exists:
            return Response({"error": "Token not found"}, status=status.HTTP_404_NOT_FOUND)

        token_obj = EmployeeInvitationToken.objects.filter(token=token).first()

        # Decode token_obj
        try:
            payload = jwt.decode(token_obj.token, settings.SECRET_KEY, algorithms=['HS256'])
        except jwt.exceptions.DecodeError:
            raise exceptions.ValidationError('Invalid token')
        except Exception as e:
            print(e)
            raise exceptions.ValidationError('An error has occurred please try again later.')

        user = get_user_model().objects.filter(email=payload["email"]).first()

        if not user:
            return Response({"error": f"Please create an account with this email {payload['email']}"
                                      f" before using this link"}, status=status.HTTP_404_NOT_FOUND)

        new_employee = Employee.objects.filter(**payload).first()

        if not new_employee:
            return Response({"error": "Employee not found!"}, status=status.HTTP_404_NOT_FOUND)

        # Update employee info
        new_employee.user = user
        new_employee.is_active = True
        new_employee.save()

        # Delete the token from the database
        token_obj.delete()

        response_data = {
            "ok": True,
            "message": f"Employee Hired! You have been added to {new_employee.company.name} company.",
        }

        return Response(response_data)


class EmployeeAPIView(viewsets.ModelViewSet):
    """Employee views."""
    serializer_class = serializers.ManageEmployeeSerializer
    authentication_classes = [JWTAuthentication, authentication.TokenAuthentication]
    permission_classes = [permissions.IsAuthenticated]

    def get_object(self):
        """Retrieve and return the authenticated user."""
        return self.request.user
