from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from django.http import JsonResponse
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView

# Simple health-check used by deployments / frontend
def health_check(request):
    return JsonResponse({"status": "ok", "message": "CivicTrack API is running"})

urlpatterns = [
    # Root / health
    path("", health_check, name="home"),

    # Admin (use a non-standard path in production)
    path("superadmin/", admin.site.urls),

    # API (versioned)
    path("api/v1/accounts/", include("accounts.urls")),
    path("api/v1/reports/", include("reports.urls")),
      # optional: create moderation app urls if used

    # JWT token endpoints (kept at api root for convenience)
    path("api/v1/token/", TokenObtainPairView.as_view(), name="token_obtain_pair"),
    path("api/v1/token/refresh/", TokenRefreshView.as_view(), name="token_refresh"),
]

# Serve media files during development
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
