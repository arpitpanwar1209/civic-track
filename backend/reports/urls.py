from django.urls import path, include
from django.shortcuts import render
from rest_framework.routers import DefaultRouter

from .views import (
    ConsumerIssueViewSet,
    ProviderIssueViewSet,
    FlagReportViewSet,
    flagged_issues_list,
    predict_issue_category_api,
)

app_name = "reports"


# =========================================================
# Routers
# =========================================================

consumer_router = DefaultRouter()
consumer_router.register(
    r"issues",
    ConsumerIssueViewSet,
    basename="consumer-issues",
)

provider_router = DefaultRouter()
provider_router.register(
    r"issues",
    ProviderIssueViewSet,
    basename="provider-issues",
)

flag_router = DefaultRouter()
flag_router.register(
    r"flags",
    FlagReportViewSet,
    basename="flags",
)


# =========================================================
# URL Patterns (API ONLY)
# =========================================================
urlpatterns = [

    # ---------------- Consumer APIs ----------------
    path(
        "consumer/",
        include(consumer_router.urls),
    ),

    # ---------------- Provider APIs ----------------
    path(
        "provider/",
        include(provider_router.urls),
    ),

    # ---------------- Flag APIs ----------------
    path(
        "flags/",
        include(flag_router.urls),
    ),

    # ---------------- Moderation (Staff only) ----------------
    path(
        "moderation/flags/",
        flagged_issues_list,
        name="flagged_issues_list",
    ),

    # ---------------- Utility ----------------
    path(
        "predict-category/",
        predict_issue_category_api,
        name="predict-category",
    ),

    # Optional success page (OK to keep)
    path(
        "success/",
        lambda req: render(req, "reports/success.html"),
        name="issue_success",
    ),
]
