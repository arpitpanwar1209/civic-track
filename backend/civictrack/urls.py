# backend/urls.py
from django.contrib import admin
from django.urls import path, include
from civictrack.views import home
from rest_framework.routers import DefaultRouter
from reports.views import IssueViewSet, FlagReportViewSet
from django.conf import settings
from django.conf.urls.static import static
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView

# ✅ REST Framework Routers
router = DefaultRouter()
router.register(r"issues", IssueViewSet, basename="issue")
router.register(r"flags", FlagReportViewSet, basename="flag")

urlpatterns = [
    # Admin panel
    path("admin/", admin.site.urls),

    # Landing page
    path("", home, name="home"),

    # Accounts (Signup, Login, Profile, Reset Password)
    path("api/", include("accounts.urls")),  # ✅ handles /signup, /login, /profile, etc.

    # Reports (issues, flags)
    path("api/", include(router.urls)),      # ✅ handles /issues/, /flags/

    # JWT Authentication
    path("api/token/", TokenObtainPairView.as_view(), name="token_obtain_pair"),
    path("api/token/refresh/", TokenRefreshView.as_view(), name="token_refresh"),

    # DRF browsable API (optional)
    path("api/auth/", include("rest_framework.urls")),
]

# Serve uploaded files in DEBUG
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
