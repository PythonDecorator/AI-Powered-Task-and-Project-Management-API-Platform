"""
Serializers for Project API Views.
"""
from django.utils import timezone
from rest_framework import serializers

from department.models import Department
from member.models import Member
from .models import Project


# ── Nested read-only helpers ───────────────────────────────────────────────────

class MemberMinimalSerializer(serializers.ModelSerializer):
    """Lightweight member representation used inside project responses."""
    class Meta:
        model  = Member
        fields = ["id", "name", "email", "role"]
        read_only_fields = ["id", "name", "email", "role"]


class DepartmentMinimalSerializer(serializers.ModelSerializer):
    class Meta:
        model  = Department
        fields = ["id", "name"]
        read_only_fields = ["id", "name"]


# ── Write helpers (accept PK or email) ────────────────────────────────────────

class MemberPKField(serializers.PrimaryKeyRelatedField):
    """Accepts a member PK and validates it belongs to the caller's org."""

    def get_queryset(self):
        request = self.context.get("request")
        if request is None:
            return Member.objects.none()
        return Member.objects.filter(
            organization=request.user.member.organization,
            is_active=True,
        )


class DepartmentPKField(serializers.PrimaryKeyRelatedField):
    """Accepts a department PK and validates it belongs to the caller's org."""

    def get_queryset(self):
        request = self.context.get("request")
        if request is None:
            return Department.objects.none()
        return Department.objects.filter(
            organization=request.user.member.organization,
        )


# ── Main serializer ────────────────────────────────────────────────────────────

class ProjectSerializer(serializers.ModelSerializer):
    """
    Serializer for creating and updating a Project within an organization.

    Write:
      - lead        → member PK (must be active, same org)
      - departments → list of department PKs (same org)
      - members     → list of member PKs (active, same org)

    Read:
      - lead, departments, members are expanded with minimal nested objects.
    """

    # Write fields (accept PKs)
    lead        = MemberPKField(required=False, allow_null=True)
    departments = DepartmentPKField(many=True, required=False)
    members     = MemberPKField(many=True, required=False)

    class Meta:
        model  = Project
        fields = [
            "id",
            "name",
            "description",
            "status",
            "priority",
            "start_date",
            "due_date",
            "completed_at",
            "lead",
            "departments",
            "members",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["id", "completed_at", "created_at", "updated_at"]

    # ── Representation ─────────────────────────────────────────────────────────

    def to_representation(self, instance):
        """Expand FK/M2M fields to nested objects on read."""
        data = super().to_representation(instance)
        data["lead"]        = MemberMinimalSerializer(instance.lead).data if instance.lead else None
        data["departments"] = DepartmentMinimalSerializer(instance.departments.all(), many=True).data
        data["members"]     = MemberMinimalSerializer(instance.members.all(), many=True).data
        return data

    # ── Validation ─────────────────────────────────────────────────────────────

    def validate(self, attrs):
        start_date = attrs.get("start_date") or (self.instance.start_date if self.instance else None)
        due_date   = attrs.get("due_date")   or (self.instance.due_date   if self.instance else None)

        if start_date and due_date and due_date < start_date:
            raise serializers.ValidationError(
                {"due_date": "Due date cannot be before start date."}
            )
        return attrs

    # ── Create / Update ────────────────────────────────────────────────────────

    def create(self, validated_data):
        departments = validated_data.pop("departments", [])
        members     = validated_data.pop("members", [])

        organization = self.context["request"].user.member.organization
        project = Project.objects.create(organization=organization, **validated_data)

        if departments:
            project.departments.set(departments)
        if members:
            project.members.set(members)

        return project

    def update(self, instance, validated_data):
        departments = validated_data.pop("departments", None)
        members     = validated_data.pop("members", None)

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
