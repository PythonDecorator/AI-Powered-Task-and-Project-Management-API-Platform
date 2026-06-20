"""
Management command to seed realistic test data for local/dev use.
Creates multiple Organizations (companies), organization emails, Members (owners/admins/managers/staff),
Departments, and Projects wired together using the project's TestDb helpers.

Usage:
  python manage.py seed_test_data [--base-name "My Company"] [--org-count 2] [--reset]

--reset deletes any existing organizations with the same base name prefix before creating.
"""
from django.core.management.base import BaseCommand
from django.db import IntegrityError, transaction

from organization.models import OrganizationEmail, Organization
from utils.create_test_model import TestDb


class Command(BaseCommand):
    help = "Seed test data: multiple organizations, members, departments, projects"

    def add_arguments(self, parser):
        parser.add_argument(
            "--base-name",
            dest="base_name",
            default="OneUp-AI",
            help="Base name of the organizations to create",
        )
        parser.add_argument(
            "--org-count",
            dest="org_count",
            default=2,
            type=int,
            help="How many organizations to create (default: 2)",
        )
        parser.add_argument(
            "--reset",
            action="store_true",
            dest="reset",
            help="If set, delete any existing organizations whose name starts with the base name before seeding",
        )

    def handle(self, *args, **options):
        base_name = options.get("base_name")
        org_count = int(options.get("org_count") or 2)
        reset = options.get("reset")

        db = TestDb()

        if reset:
            existing = Organization.objects.filter(name__startswith=base_name)
            if existing.exists():
                count = existing.count()
                existing.delete()
                self.stdout.write(
                    self.style.WARNING(f"Deleted {count} existing organization(s) with prefix '{base_name}'"))

        created_orgs = []
        try:
            with transaction.atomic():
                for i in range(org_count):
                    idx = i + 1
                    org_name = f"{base_name} {idx}"

                    # Create unique users for each org
                    owner_email = f"owner{idx}@example.com"
                    owner_user = db.create_user(email=owner_email, first_name=f"Owner{idx}", last_name="User")
                    # Ensure the seeded user can bypass email verification in dev
                    try:
                        owner_user.is_verified = True
                        owner_user.is_active = True
                        owner_user.save(update_fields=["is_verified", "is_active"])
                    except Exception:
                        # Some custom user backends may behave differently; ignore failures
                        pass

                    org = db.create_organization(user=owner_user, name=org_name)

                    # Organization contact emails
                    OrganizationEmail.objects.get_or_create(organization=org,
                                                            email=f"contact{idx}@{base_name.replace(' ', '').lower()}.example.com")
                    OrganizationEmail.objects.get_or_create(organization=org,
                                                            email=f"hr{idx}@{base_name.replace(' ', '').lower()}.example.com")

                    # Members: owner, 2 admins, 2 managers, 3 staff — create linked Django users + profiles
                    owner_member = db.create_owner_member(organization=org, user=owner_user,
                                                          email=f"owner_member{idx}@example.com", is_active=True)

                    # Helper to create a user and member pairing
                    def create_user_and_member(email_local, role_creator, first_name_prefix, **member_kwargs):
                        # create a Django User
                        user_email = f"{email_local}_{idx}@example.com"
                        user = db.create_user(email=user_email, first_name=f"{first_name_prefix}{idx}", last_name="User")
                        try:
                            user.is_verified = True
                            user.is_active = True
                            user.save(update_fields=["is_verified", "is_active"])
                        except Exception:
                            pass
                        # create profile if profile model exists
                        try:
                            from user.models import Profile

                            if not hasattr(user, 'profile'):
                                Profile.objects.create(user=user)
                        except Exception:
                            pass

                        # create the Member using the provided role factory (db.create_admin etc.)
                        return role_creator(organization=org, user=user, email=user_email, **member_kwargs)

                    admin1 = create_user_and_member('admin1', db.create_admin, 'Admin')
                    admin2 = create_user_and_member('admin2', db.create_admin, 'Admin')
                    manager1 = create_user_and_member('manager1', db.create_manager, 'Manager')
                    manager2 = create_user_and_member('manager2', db.create_manager, 'Manager')
                    staff1 = create_user_and_member('staff1', db.create_member, 'Staff')
                    staff2 = create_user_and_member('staff2', db.create_member, 'Staff')
                    staff3 = create_user_and_member('staff3', db.create_member, 'Staff')

                    # Create one deactivated member for testing
                    deactivated_staff = create_user_and_member('staff_deactivated', db.create_member, 'Deactivated', is_active=False)
                    from django.utils import timezone
                    deactivated_staff.termination_date = timezone.now().date()
                    deactivated_staff.save(update_fields=['termination_date'])

                    # Departments: Engineering, Sales
                    eng = db.create_department(organization=org, head=manager1, name="Engineering")
                    sales = db.create_department(organization=org, head=manager2, name="Sales")

                    # Assign members to departments
                    eng.members.add(manager1, staff1, staff2)
                    sales.members.add(manager2, staff3)

                    # Projects per org
                    p1 = db.create_project(
                        organization=org,
                        name=f"Website Redesign {idx}",
                        lead=manager1,
                        members=[manager1, staff1, staff2],
                        departments=[eng],
                    )

                    p2 = db.create_project(
                        organization=org,
                        name=f"Product Launch {idx}",
                        lead=admin1,
                        members=[admin1, staff3],
                        departments=[sales],
                    )

                    created_orgs.append({
                        "name": org_name,
                        "id": org.id,
                        "owner": owner_member.email,
                        "admins": [admin1.email, admin2.email],
                        "managers": [manager1.email, manager2.email],
                        "staff": [staff1.email, staff2.email, staff3.email],
                        "departments": [eng.name, sales.name],
                        "projects": [p1.name, p2.name],
                    })

                # Summary output
                for info in created_orgs:
                    self.stdout.write(self.style.SUCCESS(f"Seeded organization '{info['name']}' (id={info['id']})"))
                    self.stdout.write(self.style.SUCCESS(
                        f" Members: owner={info['owner']}, admins={info['admins']}, managers={info['managers']}, staff={info['staff']}"))
                    self.stdout.write(self.style.SUCCESS(f" Departments: {info['departments']}"))
                    self.stdout.write(self.style.SUCCESS(f" Projects: {info['projects']}"))

        except IntegrityError as exc:
            self.stderr.write(self.style.ERROR(f"Integrity error while seeding data: {exc}"))
        except Exception as exc:
            self.stderr.write(self.style.ERROR(f"Error while seeding data: {exc}"))
