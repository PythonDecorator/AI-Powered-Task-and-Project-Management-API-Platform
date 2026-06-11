from django.urls import path, include
from rest_framework.routers import DefaultRouter

from .views import ManageProjectAPIView

router = DefaultRouter()
router.register("", ManageProjectAPIView, basename="project")

app_name = "project"

urlpatterns = [
    path("", include(router.urls)),
]

# Wire into your project's root urls.py:
#
#   path("api/v1/project/", include("project.urls")),
#
# Routes registered by the router:
#
#   GET     /api/v1/project/                              list
#   POST    /api/v1/project/                              create
#   GET     /api/v1/project/{pk}/                         retrieve
#   PUT     /api/v1/project/{pk}/                         update
#   PATCH   /api/v1/project/{pk}/                         partial_update
#   DELETE  /api/v1/project/{pk}/                         destroy
#   PATCH   /api/v1/project/{pk}/assign-members/          assign_members
#   PATCH   /api/v1/project/{pk}/assign-departments/      assign_departments
#   PATCH   /api/v1/project/{pk}/change-lead/             change_lead
