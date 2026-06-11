from django.urls import path, include
from rest_framework.routers import DefaultRouter

from .views import ManageDepartmentAPIView

router = DefaultRouter()
router.register('', ManageDepartmentAPIView, basename="department")

app_name = 'department'

urlpatterns = [
    path('', include(router.urls)),
]
