from django.contrib import admin
from django.urls import path, include
from civiltrack.views import home
from rest_framework.routers import DefaultRouter
from reports.views import IssueViewSet, FlagReportViewSet
from accounts.views import UserProfileUpdateView
from django.conf import settings
from django.conf.urls.static import static

# DRF Routers for API
router = DefaultRouter()
router.register(r'issues', IssueViewSet, basename="issue")
router.register(r'flags', FlagReportViewSet, basename="flag")

urlpatterns = [
    path("admin/", admin.site.urls),

    # Home (optional landing page)
    path("", home, name="home"),

    # Accounts (signup/login/profile update)
    path("accounts/", include("accounts.urls")),
    path("api/profile/", UserProfileUpdateView.as_view(), name="profile"),

    # Issues (if you still want Django templates)
    path("issues/", include("reports.urls")),

    # API endpoints (React will consume these)
    path("api/", include(router.urls)),

    # Auth endpoints (optional DRF login for testing)
    path("api/auth/", include("rest_framework.urls")),
]

# Media (for profile pictures & issue photos)
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
