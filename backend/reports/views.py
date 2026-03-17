from django.shortcuts import render
from django.contrib.admin.views.decorators import staff_member_required
from django.db import IntegrityError

from rest_framework import viewsets, status
from rest_framework.decorators import action, api_view
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework_simplejwt.authentication import JWTAuthentication

from math import radians, cos, sin, asin, sqrt

from .models import Issue, FlagReport
from .serializers import (
    ConsumerIssueSerializer,
    ProviderIssueSerializer,
    FlagReportSerializer,
)
from .permission import IsConsumer, IsProvider

from ml.predict import predict_issue_category


# =========================================================
# Utility: Haversine Distance (KM)
# =========================================================
def haversine(lat1, lon1, lat2, lon2):
    R = 6371

    lat1, lon1, lat2, lon2 = map(float, [lat1, lon1, lat2, lon2])

    dlat = radians(lat2 - lat1)
    dlon = radians(lon2 - lon1)

    a = (
        sin(dlat / 2) ** 2
        + cos(radians(lat1))
        * cos(radians(lat2))
        * sin(dlon / 2) ** 2
    )

    c = 2 * asin(min(1, sqrt(a)))

    return R * c


# =========================================================
# ML Category Prediction API
# =========================================================
@api_view(["POST"])
def predict_issue_category_api(request):

    description = request.data.get("description")

    if not description:
        return Response(
            {"error": "description is required"},
            status=status.HTTP_400_BAD_REQUEST,
        )

    category = predict_issue_category(description)

    return Response({"category": category})


# =========================================================
# CONSUMER ISSUE VIEWSET
# =========================================================
class ConsumerIssueViewSet(viewsets.ModelViewSet):

    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated, IsConsumer]
    serializer_class = ConsumerIssueSerializer

    def get_queryset(self):
        return Issue.objects.filter(
            reported_by=self.request.user
        ).order_by("-created_at")

    def perform_create(self, serializer):

        serializer.save(
            reported_by=self.request.user
        )

    # ---------------- Like Issue ----------------
    @action(detail=True, methods=["post"])
    def like(self, request, pk=None):

        issue = self.get_object()
        user = request.user

        if user in issue.likes.all():
            issue.likes.remove(user)
            return Response(
                {"liked": False, "likes_count": issue.likes.count()}
            )

        issue.likes.add(user)

        return Response(
            {"liked": True, "likes_count": issue.likes.count()}
        )


# =========================================================
# PROVIDER ISSUE VIEWSET
# =========================================================
class ProviderIssueViewSet(viewsets.ReadOnlyModelViewSet):

    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated, IsProvider]
    serializer_class = ProviderIssueSerializer

    def get_queryset(self):

        user = self.request.user

        queryset = Issue.objects.filter(
            assigned_provider__isnull=True,
            status="pending",
            category=user.profession
        ).order_by("-created_at")

        return queryset


    # =====================================================
    # Provider Dashboard → My Assigned Issues
    # =====================================================
    @action(detail=False, methods=["get"], url_path="my-issues")
    def my_issues(self, request):

        issues = Issue.objects.filter(
            assigned_provider=request.user
        ).order_by("-created_at")

        serializer = self.get_serializer(
            issues,
            many=True
        )

        return Response(serializer.data)


    # =====================================================
    # Nearby Issues
    # =====================================================
    @action(detail=False, methods=["get"], url_path="nearby")
    def nearby_issues(self, request):

        lat = request.query_params.get("lat")
        lon = request.query_params.get("lon")
        radius = float(request.query_params.get("radius", 10))

        if not lat or not lon:
            return Response(
                {"detail": "lat and lon are required"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        provider_profession = request.user.profession

        issues_in_radius = []

        issues = Issue.objects.filter(
            assigned_provider__isnull=True,
            status="pending",
            category=provider_profession
        )

        for issue in issues:

            if issue.latitude and issue.longitude:

                dist = haversine(
                    lat,
                    lon,
                    issue.latitude,
                    issue.longitude
                )

                if dist <= radius:

                    issue._distance = dist
                    issues_in_radius.append(issue)

        issues_in_radius.sort(
            key=lambda x: x._distance
        )

        serializer = self.get_serializer(
            issues_in_radius,
            many=True
        )

        return Response(serializer.data)


    # =====================================================
    # Claim Issue
    # =====================================================
    @action(detail=True, methods=["post"])
    def claim(self, request, pk=None):

        issue = self.get_object()

        if issue.assigned_provider:
            return Response(
                {"detail": "Issue already assigned"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        # department validation
        if issue.category != request.user.profession:
            return Response(
                {"detail": "You cannot claim this issue category"},
                status=status.HTTP_403_FORBIDDEN,
            )

        issue.assigned_provider = request.user
        issue.status = "assigned"
        issue.save()

        return Response({"detail": "Issue claimed successfully"})


    # =====================================================
    # Start Work
    # =====================================================
    @action(detail=True, methods=["post"])
    def start(self, request, pk=None):

        issue = self.get_object()

        if issue.assigned_provider != request.user:
            return Response(
                {"detail": "Not authorized"},
                status=status.HTTP_403_FORBIDDEN,
            )

        issue.status = "in_progress"
        issue.save()

        return Response({"detail": "Work started"})


    # =====================================================
    # Resolve Issue
    # =====================================================
    @action(detail=True, methods=["post"])
    def resolve(self, request, pk=None):

        issue = self.get_object()

        if issue.assigned_provider != request.user:
            return Response(
                {"detail": "Not authorized"},
                status=status.HTTP_403_FORBIDDEN,
            )

        if issue.status != "in_progress":
            return Response(
                {"detail": "Issue must be in progress"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        issue.status = "resolved"
        issue.save()

        return Response({"detail": "Issue resolved"})


# =========================================================
# FLAG REPORT VIEWSET
# =========================================================
class FlagReportViewSet(viewsets.ModelViewSet):

    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated, IsConsumer]
    serializer_class = FlagReportSerializer
    queryset = FlagReport.objects.all()

    def perform_create(self, serializer):

        try:
            serializer.save(
                reported_by=self.request.user
            )

        except IntegrityError:
            raise IntegrityError("Duplicate flag")


# =========================================================
# STAFF MODERATION VIEW
# =========================================================
@staff_member_required
def flagged_issues_list(request):

    flagged_issues = FlagReport.objects.select_related(
        "issue",
        "reported_by"
    )

    return render(
        request,
        "reports/flagged_issues_list.html",
        {"flagged_issues": flagged_issues},
    )