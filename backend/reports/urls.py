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

router = DefaultRouter()

router.register(
    r"consumer/issues",
    ConsumerIssueViewSet,
    basename="consumer-issues",
)

router.register(
    r"provider/issues",
    ProviderIssueViewSet,
    basename="provider-issues",
)

router.register(
    r"flags",
    FlagReportViewSet,
    basename="flags",
)


# =========================================================
# URL Patterns
# =========================================================
urlpatterns = [

    # ---------------- API Router ----------------
    path("", include(router.urls)),

    # ---------------- Moderation ----------------
    path(
        "moderation/flags/",
        flagged_issues_list,
        name="flagged_issues_list",
    ),

    # ---------------- ML Utility ----------------
    path(
        "predict-category/",
        predict_issue_category_api,
        name="predict-category",
    ),

    # Optional success page
    path(
        "success/",
        lambda req: render(req, "reports/success.html"),
        name="issue_success",
    ),
]