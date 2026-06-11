from django.urls import path, include
from rest_framework.routers import DefaultRouter

from .views import ManageEmployeeAPIView, EmployeeConfirmInvitationAPIView

router = DefaultRouter()
# router.register('', ManageCompanyEmployeesAPIView, basename="employees")
router.register('manage', ManageEmployeeAPIView, basename="manage")


app_name = 'employee'

urlpatterns = [
    path('', include(router.urls)),
    path('confirm-invitation/', EmployeeConfirmInvitationAPIView.as_view(), name="confirm-invitation")
]
