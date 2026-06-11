from django.urls import path, include
from rest_framework.routers import DefaultRouter

from .views import ManageProjectAPIView

router = DefaultRouter()
router.register("", ManageProjectAPIView, basename="project")

app_name = "project"

urlpatterns = [
    path("", include(router.urls)),
]
