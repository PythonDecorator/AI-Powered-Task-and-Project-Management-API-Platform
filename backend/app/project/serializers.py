"""
Serializers for Project API Views.
"""
from django.utils import timezone
from rest_framework import serializers

from department.models import Department
from member.models import Member
from .models import Project


class MemberMinimalSerializer(serializers.ModelSerializer):
    """Lightweight member representation used inside project responses."""

    class Meta:
        model = Member
        fields = ["id", "name", "email", "role"]
        read_only_fields = ["id", "name", "email", "role"]


class DepartmentMinimalSerializer(serializers.ModelSerializer):
    class Meta:
        model = Department
        fields = ["id", "name"]
        read_only_fields = ["id", "name"]


class MemberPKField(serializers.PrimaryKeyRelatedField):
    """Accepts a member PK and validates it belongs to the caller's org."""

    def get_queryset(self):
        request = self.context.get("request")
        if request is None or not getattr(request, "user", None):
            return Member.objects.none()
        user = request.user
        # Resolve organization from request user (owner or member)
        organization = None
        if hasattr(user, "organization") and user.organization is not None:
            organization = user.organization
        else:
            try:
                organization = user.member.organization
            except Exception:
                organization = None
        if organization is None:
            return Member.objects.none()
        return Member.objects.filter(
            organization=organization,
            is_active=True,
        )


class DepartmentPKField(serializers.PrimaryKeyRelatedField):
    """Accepts a department PK and validates it belongs to the caller's org."""

    def get_queryset(self):
        request = self.context.get("request")
        if request is None or not getattr(request, "user", None):
            return Department.objects.none()
        user = request.user
        organization = None
        if hasattr(user, "organization") and user.organization is not None:
            organization = user.organization
        else:
            try:
                organization = user.member.organization
            except Exception:
                organization = None
        if organization is None:
            return Department.objects.none()
        return Department.objects.filter(
            organization=organization,
        )


class ProjectSerializer(serializers.ModelSerializer):
    """
    Serializer for creating and updating a Project within an organization.
    """

    lead = MemberPKField(required=False, allow_null=True)
    departments = DepartmentPKField(many=True, required=False)
    members = MemberPKField(many=True, required=False)

    class Meta:
        model = Project
        fields = ["id", "name", "description", "status", "priority", "start_date", "due_date", "completed_at",
                  "lead", "departments", "members", "created_at", "updated_at", ]
        read_only_fields = ["id", "completed_at", "created_at", "updated_at"]

    def to_representation(self, instance):
        """Expand FK/M2M fields to nested objects on read."""
        data = super().to_representation(instance)
        data["lead"] = MemberMinimalSerializer(instance.lead).data if instance.lead else None
        data["departments"] = DepartmentMinimalSerializer(instance.departments.all(), many=True).data
        data["members"] = MemberMinimalSerializer(instance.members.all(), many=True).data
        return data

    def validate(self, attrs):
        start_date = attrs.get("start_date") or (self.instance.start_date if self.instance else None)
        due_date = attrs.get("due_date") or (self.instance.due_date if self.instance else None)

        if start_date and due_date and due_date < start_date:
            raise serializers.ValidationError(
                {"due_date": "Due date cannot be before start date."}
            )
        return attrs

    def create(self, validated_data):
        departments = validated_data.pop("departments", [])
        members = validated_data.pop("members", [])

        user = self.context.get("request").user
        organization = None
        if hasattr(user, "organization") and user.organization is not None:
            organization = user.organization
        else:
            try:
                organization = user.member.organization
            except Exception:
                organization = None

        if organization is None:
            raise serializers.ValidationError("Requesting user is not associated with an organization.")

        project = Project.objects.create(organization=organization, **validated_data)

        if departments:
            project.departments.set(departments)
        if members:
            project.members.set(members)

        return project

    def update(self, instance, validated_data):
        departments = validated_data.pop("departments", None)
        members = validated_data.pop("members", None)

        # Auto-stamp completed_at when status transitions to completed.
        new_status = validated_data.get("status")
        if new_status == Project.Status.COMPLETED and instance.status != Project.Status.COMPLETED:
            validated_data["completed_at"] = timezone.now()
        elif new_status and new_status != Project.Status.COMPLETED:
            validated_data["completed_at"] = None

        project = super().update(instance, validated_data)

        if departments is not None:
            project.departments.set(departments)
        if members is not None:
            project.members.set(members)

        return project
