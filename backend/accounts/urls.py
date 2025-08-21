from django.urls import path
from .views import RegisterView, UserProfileView, LoginView
from rest_framework_simplejwt.views import TokenRefreshView

urlpatterns = [
    path("signup/", RegisterView.as_view(), name="signup"),
    path("login/", LoginView.as_view(), name="login"),
    path("profile/", UserProfileView.as_view(), name="profile"),
    path("token/refresh/", TokenRefreshView.as_view(), name="token_refresh"),
]
