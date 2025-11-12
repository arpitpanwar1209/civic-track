from django.urls import path
from .views import (
    RegisterView,
    LoginView,
    UserProfileView,
    UserProfileUpdateView,
    PasswordResetRequestView,
    PasswordResetConfirmView,
)

urlpatterns = [
    path("signup/", RegisterView.as_view(), name="signup"),
    path("login/", LoginView.as_view(), name="login"),
    path("profile/", UserProfileView.as_view(), name="profile"),
    path("profile/update/", UserProfileUpdateView.as_view(), name="profile_update"),
    

    # 🔹 Password reset endpoints
    path("password-reset/", PasswordResetRequestView.as_view(), name="password_reset"),
    path("password-reset-confirm/<uidb64>/<token>/", PasswordResetConfirmView.as_view(), name="password_reset_confirm"),
]
