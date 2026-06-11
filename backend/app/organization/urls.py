from django.urls import path, include
from rest_framework.routers import DefaultRouter

from .views import ManageOrganizationAPIView

router = DefaultRouter()
router.register("", ManageOrganizationAPIView, basename="organization")

app_name = "organization"

urlpatterns = [
    path("", include(router.urls)),
]

# Wire into your project's root urls.py:
#
#   path("api/v1/organization/", include("organization.urls")),
#
# Routes registered by the router:
#
#   POST    /api/v1/organization/                                  create
#   GET     /api/v1/organization/{pk}/                             retrieve
#   PUT     /api/v1/organization/{pk}/                             update
#   PATCH   /api/v1/organization/{pk}/                             partial_update
#   DELETE  /api/v1/organization/{pk}/                             destroy
#   POST    /api/v1/organization/{pk}/change-logo/                 change_logo
#   GET     /api/v1/organization/{pk}/emails/                      emails
#   POST    /api/v1/organization/{pk}/emails/add/                  add_email
#   DELETE  /api/v1/organization/{pk}/emails/{email_pk}/remove/    remove_email
