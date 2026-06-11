from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from django.contrib.auth.models import Permission
from django.utils.translation import gettext_lazy as _

from department.models import Department
from projects.models import Project
from .models import User, Profile
from employee.models import Employee, EmployeePermission
from company.models import Company, CompanyPhoneNumber, CompanyEmail


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


admin.site.register(Permission)
admin.site.register(User, UserAdmin)
admin.site.register(Profile)
admin.site.register(Company)
admin.site.register(Department)
admin.site.register(Project)
admin.site.register(CompanyPhoneNumber)
admin.site.register(CompanyEmail)
admin.site.register(Employee)
admin.site.register(EmployeePermission)
