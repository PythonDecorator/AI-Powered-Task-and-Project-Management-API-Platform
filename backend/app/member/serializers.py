"""
Serializers for Member API Views.
"""
from django.contrib.auth import get_user_model
from rest_framework import serializers

from core.serializers import ProfileSerializer
from department.models import Department
from member.models import Member


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = get_user_model()
        fields = ["id", "first_name", "last_name", "email"]
        read_only_fields = ["id", "email"]


class DepartmentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Department
        fields = ["id", "name"]
        read_only_fields = ["id"]

    def validate_name(self, value):
        organization = self.context["request"].user.member.organization
        if not organization.department_set.filter(name=value).exists():
            raise serializers.ValidationError(
                f"{value} is not a valid department for {organization.name}."
            )
        return value


class DirectReportSerializer(serializers.ModelSerializer):
    """
    Accepts an email to look up the subordinate within the same org.
    The manager FK on Member is the single source of truth for hierarchy.
    """

    class Meta:
        model = Member
        fields = ["id", "name", "email", "role"]
        read_only_fields = ["id", "name", "role"]

    def validate_email(self, value):
        organization = self.context["request"].user.member.organization
        if not Member.objects.filter(organization=organization, email=value).exists():
            raise serializers.ValidationError(
                f"No member with email {value} found in {organization.name}."
            )
        return value


class ManageMemberSerializer(serializers.ModelSerializer):
    """
    Serializer for creating and updating a Member within an organization.
    """
    user = UserSerializer(required=False, read_only=True)
    profile = ProfileSerializer(source="user.profile", required=False, read_only=True)
    departments = DepartmentSerializer(many=True, required=False)
    direct_reports = DirectReportSerializer(many=True, required=False)

    class Meta:
        model = Member
        fields = [
            "id", "email", "name", "working", "salary", "role", "skills",
            "phone", "address",
            "emergency_contact_name", "emergency_contact_phone", "emergency_contact_email",
            "resume", "bank_name", "bank_account_number",
            "social_security_number", "passport_number",
            "hire_date", "termination_date", "is_active",
            "manager", "user", "profile", "departments", "direct_reports",
        ]
        read_only_fields = ["id", "user", "profile"]

    @staticmethod
    def _set_departments(member, departments_data):
        member.departments.clear()
        if departments_data:
            depts = [
                Department.objects.get(organization=member.organization, **d)
                for d in departments_data
            ]
            member.departments.set(depts)

    @staticmethod
    def _set_direct_reports(member, reports_data):
        """
        For each email in reports_data, set that Member's manager FK to this
        member. This keeps the single manager FK as the source of truth.
        """
        Member.objects.filter(manager=member).update(manager=None)

        for report_data in reports_data:
            email = report_data["email"]
            if email == member.email:
                raise serializers.ValidationError(
                    "A member cannot be their own direct report."
                )
            report = Member.objects.get(organization=member.organization, email=email)
            report.manager = member
            report.save(update_fields=["manager"])

    def validate(self, attrs):
        manager = attrs.get("manager")
        instance = getattr(self, "instance", None)
        organization = self.context["request"].user.member.organization

        if manager and manager.organization != organization:
            raise serializers.ValidationError(
                {"manager": "The manager must belong to the same organization."}
            )
        if manager and instance and manager.pk == instance.pk:
            raise serializers.ValidationError(
                {"manager": "A member cannot be their own manager."}
            )
        return attrs

    def create(self, validated_data):
        departments_data = validated_data.pop("departments", [])
        direct_reports_data = validated_data.pop("direct_reports", [])

        organization = self.context["request"].user.member.organization
        member = Member.objects.create(organization=organization, **validated_data)

        self._set_departments(member, departments_data)
        self._set_direct_reports(member, direct_reports_data)
        return member

    def update(self, instance, validated_data):
        departments_data = validated_data.pop("departments", [])
        direct_reports_data = validated_data.pop("direct_reports", [])

        # Email is immutable after creation.
        validated_data.pop("email", None)

        member = super().update(instance, validated_data)
        self._set_departments(member, departments_data)
        self._set_direct_reports(member, direct_reports_data)
        return member


class MemberRoleSerializer(serializers.ModelSerializer):
    """
    Used by the change-role action.
    """

    class Meta:
        model = Member
        fields = ["id", "name", "email", "role"]
        read_only_fields = ["id", "name", "email"]

    def validate_role(self, value):
        # Prevent demoting the org owner via this endpoint.
        if self.instance and self.instance.role == Member.Role.OWNER and value != Member.Role.OWNER:
            raise serializers.ValidationError(
                "The organization owner's role cannot be changed via this endpoint."
            )
        return value
