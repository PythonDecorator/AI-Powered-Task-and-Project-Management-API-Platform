from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from django.contrib.auth.models import Permission
from django.utils.translation import gettext_lazy as _

from department.models import Department
from member.models import Member, MemberInvitationToken
from organization.models import Organization, OrganizationEmail
from project.models import Project
from user.models import User


class UserAdmin(BaseUserAdmin):
    """Define the admin pages for users."""

    ordering = ["id"]
    list_display = ["email", "name", "get_permissions"]
    fieldsets = (
        (None, {"fields": ("email", "password")}),
        (_("Permissions"), {"fields": ("is_active", "is_staff", "is_superuser")}),
        (_("Important dates"), {"fields": ("last_login",)}),
    )
    readonly_fields = ["last_login"]

    add_fieldsets = (
        (None, {
            "classes": ("wide",),
            "fields": (
                "first_name",
                "last_name",
                "email",
                "password1",
                "password2",
                "is_active",
                "is_staff",
            ),
        }),
    )

    def get_permissions(self, obj):
        """Return a comma-separated list of permissions for the user."""
        user_permissions = obj.user_permissions.all()
        permission_names = [str(permission).split('|')[-1].strip() for permission in user_permissions]
        return ", ".join(permission_names)

    get_permissions.short_description = "Permissions"


class OrganizationAdmin(admin.ModelAdmin):
    list_display = ("id", "name", "user", "size", "currency")
    search_fields = ("name", "user__email")
    list_filter = ("currency",)
    raw_id_fields = ("user",)


class OrganizationEmailAdmin(admin.ModelAdmin):
    list_display = ("id", "organization", "email")
    search_fields = ("email",)
    raw_id_fields = ("organization",)


class MemberAdmin(admin.ModelAdmin):
    list_display = ("id", "name", "email", "role", "is_active", "organization")
    search_fields = ("name", "email")
    list_filter = ("role", "is_active")
    raw_id_fields = ("user", "manager")
    filter_horizontal = ("departments",)


class DepartmentAdmin(admin.ModelAdmin):
    list_display = ("id", "name", "organization", "head")
    search_fields = ("name",)
    raw_id_fields = ("head",)
    filter_horizontal = ("projects",)


class ProjectAdmin(admin.ModelAdmin):
    list_display = ("id", "name", "status", "priority", "organization", "lead")
    search_fields = ("name", "description")
    list_filter = ("status", "priority")
    raw_id_fields = ("lead",)
    filter_horizontal = ("members", "departments")


class MemberInvitationTokenAdmin(admin.ModelAdmin):
    list_display = ("id", "organization", "email", "token")
    search_fields = ("email",)
    raw_id_fields = ("organization",)


# Register core auth models
admin.site.register(Permission)
admin.site.register(User, UserAdmin)
admin.site.register(Organization, OrganizationAdmin)
admin.site.register(OrganizationEmail, OrganizationEmailAdmin)
admin.site.register(Member, MemberAdmin)
admin.site.register(Department, DepartmentAdmin)
admin.site.register(Project, ProjectAdmin)
admin.site.register(MemberInvitationToken, MemberInvitationTokenAdmin)
