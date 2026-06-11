"""
Serializers for Department.
"""

from rest_framework import serializers
from department.models import Department
from employee.models import Employee


class EmployeeSerializer(serializers.ModelSerializer):
    """Serializer for managing an employee in a company."""

    class Meta:
        model = Employee
        fields = ["id", "email", "name", "phone", "role", "skills"]
        read_only_fields = ['id']
        extra_kwargs = {
            "name": {"required": False},
            "role": {"required": False},
            "skills": {"required": False},
            "phone": {"required": False},
        }

    def validate(self, data):
        try:
            Employee.objects.get(company=self.context["request"].user.employee.company, **data)
        except Employee.DoesNotExist:
            raise serializers.ValidationError(f"Employee with email: {data['email']} does not exist.")

        return data


class DepartmentSerializer(serializers.ModelSerializer):
    """Serializer for company department."""
    employees = EmployeeSerializer(many=True, required=False)
    head = EmployeeSerializer(required=False)

    class Meta:
        model = Department
        fields = ["id", "name", "head", "employees"]
        read_only_fields = ['id']

    def create(self, validated_data):
        """Create and return department."""
        employees_data = validated_data.pop('employees', [])
        head_data = validated_data.pop('head', None)

        company = self.context["request"].user.employee.company

        if Department.objects.filter(company=company, name=validated_data["name"]).exists():
            raise serializers.ValidationError(f"Department with name {validated_data['name']} already exist")

        if head_data:
            head = Employee.objects.get(company=company, **head_data)
            department = Department.objects.create(company=company, head=head, **validated_data)
        else:
            department = Department.objects.create(company=company, **validated_data)

        # Add employees to the department
        for employee_data in employees_data:
            employee = Employee.objects.get(company=company, **employee_data)
            department.employees.add(employee)

        return department

    def update(self, instance, validated_data):
        """Update department."""
        employees_data = validated_data.pop('employees', [])
        head_data = validated_data.pop('head', None)

        for attr, value in validated_data.items():
            setattr(instance, attr, value)

        company = self.context["request"].user.employee.company

        if head_data:
            employee = Employee.objects.get(company=company, **head_data)
            setattr(instance, "head", employee)

        # Add employees to the department
        instance.employees.clear()
        for employee_data in employees_data:
            employee = Employee.objects.get(company=company, **employee_data)
            instance.employees.add(employee)

        instance.save()

        return instance
