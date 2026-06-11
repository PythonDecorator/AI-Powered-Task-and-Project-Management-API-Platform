"""
Serializers for Employee API View.
"""
from django.contrib.auth import get_user_model
from django.contrib.auth.models import Permission
from django.contrib.contenttypes.models import ContentType
from rest_framework import serializers

from company.models import Company
from company.permissions import CustomPermissions
from core.serializers import ProfileSerializer
from department.models import Department
from employee.models import Employee, EmployeePermission


class UserSerializer(serializers.ModelSerializer):
    """Serializer for creating a user."""

    class Meta:
        model = get_user_model()
        fields = ["id", 'first_name', 'last_name', 'email']
        read_only_fields = ['id', "email"]


class DepartmentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Department
        fields = ['id', 'name']
        read_only_fields = ['id']

    def validate_name(self, value):
        company = self.context["request"].user.employee.company
        if not company.department_set.filter(name=value).exists():
            raise serializers.ValidationError(f"{value} is not a valid department for {company.name}.")
        return value


class SubordinateSerializer(serializers.ModelSerializer):
    """Serializer for subordinates."""

    class Meta:
        model = Employee
        fields = ['id', "name", 'email', "role"]
        read_only_fields = ["id"]
        extra_kwargs = {"name": {"required": False}, "role": {"required": False}}

    def validate(self, attrs):
        email = attrs.get('email')
        company = self.context["request"].user.employee.company

        if not Employee.objects.filter(company=company, email=email).exists():
            raise serializers.ValidationError(f"No employee with {email} found for {company.name}.")

        return attrs


class ManageEmployeeSerializer(serializers.ModelSerializer):
    """Serializer for managing an employee in a company."""
    user = UserSerializer(required=False)
    profile = ProfileSerializer(source='user.profile', required=False)
    departments = DepartmentSerializer(many=True, required=False)
    subordinates = SubordinateSerializer(many=True, required=False)

    class Meta:
        model = Employee
        fields = ["id", "email", "name", "status", "salary", "role", "skills", "phone", "address",
                  "emergency_contact_name", "emergency_contact_relationship", "emergency_contact_phone",
                  "emergency_contact_email", "resume", "contract", "bank_name", "bank_account_number",
                  "social_security_number", "passport_number", "hire_date", "termination_date", "is_active", "manager",
                  "user", "profile", "departments", "subordinates",
                  ]
        read_only_fields = ['id', "user", "profile"]

    @staticmethod
    def _set_employee_departments(employee, departments_data):
        """"Set an employee department"""
        employee.departments.clear()

        if departments_data:
            departments = [Department.objects.get(company=employee.company, **dep_data)
                           for dep_data in departments_data]
            employee.departments.set(departments)

    @staticmethod
    def _add_employee_subordinates(employee, subordinates_data):
        """"Set an employee subordinates"""
        employee.subordinates.clear()

        if subordinates_data:
            for subordinate_data in subordinates_data:
                if subordinate_data["email"] == employee.email:
                    raise serializers.ValidationError("An employee cannot be its own subordinate.")

            for subordinate_data in subordinates_data:
                subordinate = Employee.objects.get(company=employee.company, **subordinate_data)
                employee.subordinates.add(subordinate)

    def create(self, validated_data):
        """Create and return an employee"""
        departments_data = validated_data.pop('departments', [])
        subordinates_data = validated_data.pop('subordinates', [])

        company = self.context["request"].user.employee.company
        employee = Employee.objects.create(company=company, **validated_data)

        self._set_employee_departments(employee, departments_data)
        self._add_employee_subordinates(employee, subordinates_data)

        return employee

    def update(self, instance, validated_data):
        """Update and return the employee instance."""
        departments_data = validated_data.pop('departments', [])
        subordinates_data = validated_data.pop('subordinates', [])

        if 'email' in validated_data:
            validated_data["email"] = instance.email

        if 'manager' in validated_data and validated_data['manager'] is not None:
            manager = validated_data.get('manager')
            # Check if manager belongs to the same company
            if manager.company != instance.company:
                raise serializers.ValidationError("The manager must belong to the same company.")

        employee = super().update(instance, validated_data)
        self._set_employee_departments(employee, departments_data)
        self._add_employee_subordinates(employee, subordinates_data)

        return employee


class EmployeePermissionsDetailSerializer(serializers.ModelSerializer):
    """Add some employee details to the permissions serializer"""

    class Meta:
        model = Employee
        fields = ["id", "name", "email", "role", "skills", "manager"]
        read_only_fields = ["id", "name", "email", "role", "skills", "manager"]


class EmployeePermissionsSerializer(serializers.ModelSerializer):
    """Serializer for Employee Permissions model."""
    employee = EmployeePermissionsDetailSerializer(required=False)

    class Meta:
        model = EmployeePermission
        fields = "__all__"
        read_only_fields = ['id', "employee"]

    def update(self, instance, validated_data):
        """Update employee permissions and set user permissions."""
        user_permissions = []
        for codename, granted in validated_data.items():
            setattr(instance.permissions, codename, granted)
            instance.permissions.save()

            if granted:
                # Add permission to user
                content_type = ContentType.objects.get_for_model(Company)
                if codename in CustomPermissions.__dict__.values():
                    perm = Permission.objects.get(content_type=content_type, codename=codename)
                    user_permissions.append(perm)

        instance.user.user_permissions.set(user_permissions)
        instance.save()

        return instance.permissions
