from django.urls import path
from .views import (
    RegisterView,
    UserProfileView,
    UserProfileUpdateView,
    PasswordResetRequestView,
    PasswordResetConfirmView,
)

urlpatterns = [
    # =============================
    # AUTH
    # =============================
    path("signup/", RegisterView.as_view(), name="signup"),

    # =============================
    # PROFILE
    # =============================
    path("profile/", UserProfileView.as_view(), name="profile"),
    path(
        "profile/update/",
        UserProfileUpdateView.as_view(),
        name="profile_update",
    ),

    # =============================
    # PASSWORD RESET
    # =============================
    path(
        "password-reset/",
        PasswordResetRequestView.as_view(),
        name="password_reset",
    ),
    path(
        "password-reset-confirm/<uidb64>/<token>/",
        PasswordResetConfirmView.as_view(),
        name="password_reset_confirm",
    ),
]
