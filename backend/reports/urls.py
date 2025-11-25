from django.urls import path, include
from django.shortcuts import render
from rest_framework.routers import DefaultRouter
from .views import (
    IssueViewSet,
    FlagReportViewSet,
    flagged_issues_list,
)
from ml.predict import predict_issue_category_api

app_name = "reports"

router = DefaultRouter()
router.register(r"issues", IssueViewSet, basename="issues")
router.register(r"flags", FlagReportViewSet, basename="flags")

urlpatterns = [
    # Moderation dashboard (staff only)
    path("moderation/flags/", flagged_issues_list, name="flagged_issues_list"),

    # Optional success page (frontend usage)
    path("success/", lambda req: render(req, "reports/success.html"), name="issue_success"),

    # API ViewSets
    path("", include(router.urls)),

    # ML Prediction API (POST)
    path("predict-category/", predict_issue_category_api, name="predict-category"),
]
