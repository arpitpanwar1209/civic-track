from django.contrib import admin
from django.urls import path, include
from civiltrack.views import home
from rest_framework.routers import DefaultRouter
from reports.views import IssueViewSet, FlagReportViewSet

router = DefaultRouter()
router.register(r'issues', IssueViewSet)
router.register(r'flags', FlagReportViewSet)

urlpatterns = [
    path("admin/", admin.site.urls),

    # Root API check
    path("", home, name="home"),

    # Accounts (signup/login/profile)
    path("accounts/", include("accounts.urls")),

    # Issues app
    path("issues/", include("reports.urls")),

    # API endpoints
    path("api/", include(router.urls)),
]
