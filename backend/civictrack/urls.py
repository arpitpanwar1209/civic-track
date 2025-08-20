from django.contrib import admin
from django.urls import path, include
from civiltrack.views import home
from rest_framework.routers import DefaultRouter
from reports.views import IssueViewSet, FlagReportViewSet  # ✅ new imports

# DRF Router
router = DefaultRouter()
router.register(r'issues', IssueViewSet)       # /api/issues/
router.register(r'flags', FlagReportViewSet)   # /api/flags/

urlpatterns = [
    path('admin/', admin.site.urls),
    path('', home, name='home'),
    path('', include('civiltrack.urls')),
    path('accounts/', include('accounts.urls')),
    path('issues/', include('reports.urls')),   # regular Django views
    path('api/', include(router.urls)),         # DRF API endpoints
]
