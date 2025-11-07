from django.contrib import admin
from django.urls import path, include
from civictrack.views import home
from rest_framework.routers import DefaultRouter
from reports.views import IssueViewSet, FlagReportViewSet

from accounts.views import UserProfileUpdateView
from django.conf import settings
from django.conf.urls.static import static
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView

# ✅ DRF Routers for REST API
router = DefaultRouter()
router.register(r'issues', IssueViewSet, basename="issue")
router.register(r'flags', FlagReportViewSet, basename="flag")

urlpatterns = [
    path("admin/", admin.site.urls),

    # 🌐 Home page (optional landing page)
    path("", home, name="home"),

    # 👤 Accounts & Profile Management
    path("api/accounts/", include("accounts.urls")),
    path("api/profile/", UserProfileUpdateView.as_view(), name="profile"),


    # 🧾 Main REST API Endpoints (used by React)
    path("api/", include(router.urls)),

    # 🔑 JWT Authentication
    path("api/token/", TokenObtainPairView.as_view(), name="token_obtain_pair"),
    path("api/token/refresh/", TokenRefreshView.as_view(), name="token_refresh"),

    # 🧪 DRF Browsable API Auth (optional, for debugging)
    path("api/auth/", include("rest_framework.urls")),


]

# 🖼️ Media files (user uploads)
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
