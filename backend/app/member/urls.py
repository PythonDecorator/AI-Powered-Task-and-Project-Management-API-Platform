from django.urls import path, include
from rest_framework.routers import DefaultRouter

from .views import ManageMemberAPIView, MemberConfirmInvitationAPIView, MemberSelfAPIView

router = DefaultRouter()
router.register("manage-member", ManageMemberAPIView, basename="manage-member")
router.register("me", MemberSelfAPIView, basename="member-self")

app_name = "member"

urlpatterns = [
    path("", include(router.urls)),
    path("confirm-invitation/", MemberConfirmInvitationAPIView.as_view(), name="confirm-invitation"),
]
