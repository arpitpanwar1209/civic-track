from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from django.http import JsonResponse

from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView
)


# =========================================================
# Health Check
# =========================================================
def health_check(request):
    return JsonResponse({
        "status": "ok",
        "message": "CivicTrack API is running"
    })


# =========================================================
# API Root
# =========================================================
def api_root(request):
    return JsonResponse({
        "accounts": "/api/v1/accounts/",
        "reports": "/api/v1/reports/",
        "token": "/api/v1/token/",
        "health": "/health/"
    })


# =========================================================
# URL Patterns
# =========================================================
urlpatterns = [

    # Health check
    path("health/", health_check, name="health"),

    # API root
    path("api/v1/", api_root),

    # Admin
    path("superadmin/", admin.site.urls),

    # App APIs
    path("api/v1/accounts/", include("accounts.urls")),
    path("api/v1/reports/", include("reports.urls")),

    # JWT authentication
    path(
        "api/v1/token/",
        TokenObtainPairView.as_view(),
        name="token_obtain_pair"
    ),

    path(
        "api/v1/token/refresh/",
        TokenRefreshView.as_view(),
        name="token_refresh"
    ),
]


# =========================================================
# Media files (development only)
# =========================================================
if settings.DEBUG:
    urlpatterns += static(
        settings.MEDIA_URL,
        document_root=settings.MEDIA_ROOT
    )