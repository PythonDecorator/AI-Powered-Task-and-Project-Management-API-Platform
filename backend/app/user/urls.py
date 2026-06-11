"""
URL mappings for the user API.
"""
from django.urls import include, path
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import TokenRefreshView

from user import views

router = DefaultRouter()
router.register("auth", views.AuthenticationViewSet, basename="auth")

app_name = "user"

urlpatterns = [
    path("", include(router.urls)),
    path("login/", views.LoginView.as_view(), name="login"),
    path("logout/", views.LogoutView.as_view(), name="logout"),
    path("login/refresh/", TokenRefreshView.as_view(), name="token-refresh"),
    path("me/", views.ManageUserView.as_view(), name="me"),
]
