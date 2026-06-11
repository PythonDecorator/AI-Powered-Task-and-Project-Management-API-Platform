from django.urls import path, include
from rest_framework.routers import DefaultRouter

from .views import ManageOrganizationAPIView

router = DefaultRouter()
router.register("", ManageOrganizationAPIView, basename="organization")

app_name = "organization"

urlpatterns = [
    path("", include(router.urls)),
]
