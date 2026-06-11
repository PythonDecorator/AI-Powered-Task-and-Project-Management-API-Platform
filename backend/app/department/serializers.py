"""
Serializers for the Department API.
"""
from rest_framework import serializers

from department.models import Department
from member.models import Member


class MemberRefSerializer(serializers.ModelSerializer):
    """
    Lightweight member reference serializer.

    Used to look up an existing member by email within the same organization.
    All fields except email are read-only so callers only need to supply
    the email in POST/PATCH bodies.
    """

    class Meta:
        model = Member
        fields = ["id", "email", "name", "phone", "role", "skills"]
        read_only_fields = ["id", "name", "phone", "role", "skills"]
        extra_kwargs = {"email": {"required": True}}

    def validate_email(self, value):
        organization = self.context["request"].user.member.organization
        if not Member.objects.filter(organization=organization, email=value).exists():
            raise serializers.ValidationError(
                "No member with email '{value}' found in {organization.name}."
            )
        return value


class DepartmentSerializer(serializers.ModelSerializer):
    """
    Full read/write serializer for Department.

    - `members` is the reverse M2M accessor from Member.departments.
    - `head` is the OneToOne field on Department.
    Both accept member objects identified by email; all other fields are read-only.
    """
    members = MemberRefSerializer(many=True, required=False)
    head = MemberRefSerializer(required=False, allow_null=True)

    class Meta:
        model = Department
        fields = ["id", "name", "head", "members"]
        read_only_fields = ["id"]

    # ── Create ──────────────────────────

    def create(self, validated_data):
        members_data = validated_data.pop("members", [])
        head_data = validated_data.pop("head", None)

        organization = self.context["request"].user.member.organization

        # Uniqueness is enforced by the DB unique_together, but returning a
        # clear error message here is friendlier than a 500.
        if Department.objects.filter(organization=organization,
                                     name=validated_data["name"]).exists():
            raise serializers.ValidationError(
                "A department named '{validated_data['name']}' "
                "already exists in this organization."
            )

        head = None
        if head_data:
            head = Member.objects.get(organization=organization,
                                      email=head_data["email"])

        department = Department.objects.create(
            organization=organization, head=head, **validated_data
        )

        for member_data in members_data:
            member = Member.objects.get(organization=organization,
                                        email=member_data["email"])
            department.members.add(member)

        return department

    def update(self, instance, validated_data):
        members_data = validated_data.pop("members", None)
        head_data = validated_data.pop("head", None)

        for attr, value in validated_data.items():
            setattr(instance, attr, value)

        organization = self.context["request"].user.member.organization

        # head=null clears the head; head omitted leaves it unchanged.
        if "head" in self.initial_data:
            instance.head = (
                Member.objects.get(organization=organization, email=head_data["email"])
                if head_data
                else None
            )

        # members=[] replaces with empty set; omitted leaves members unchanged.
        if members_data is not None:
            instance.members.clear()
            for member_data in members_data:
                member = Member.objects.get(organization=organization, email=member_data["email"])
                instance.members.add(member)

        instance.save()
        return instance
