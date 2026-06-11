from django.urls import path, include
from rest_framework.routers import DefaultRouter

from .views import ManageDepartmentAPIView

router = DefaultRouter()
router.register("", ManageDepartmentAPIView, basename="department")

app_name = "department"

urlpatterns = [
    path("", include(router.urls)),
]

# Wire into your app_settings's root urls.py:
#
#   path("api/v1/department/", include("department.urls")),
#
# Routes registered by the router:
#
#   GET     /api/v1/department/           list
#   POST    /api/v1/department/           create
#   GET     /api/v1/department/{pk}/      retrieve
#   PUT     /api/v1/department/{pk}/      update
#   PATCH   /api/v1/department/{pk}/      partial_update
#   DELETE  /api/v1/department/{pk}/      destroy
