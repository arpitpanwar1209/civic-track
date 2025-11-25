from django.shortcuts import render
from django.contrib.admin.views.decorators import staff_member_required
from django.db import IntegrityError
from rest_framework import viewsets, permissions
from rest_framework.decorators import action, api_view
from rest_framework.response import Response

from .models import Issue, FlagReport
from .serializers import IssueSerializer, FlagReportSerializer
from math import radians, cos, sin, asin, sqrt

from ml.predict import predict_issue_category


# ---------------------------------------------------------
# Haversine Helper
# ---------------------------------------------------------
def haversine(lat1, lon1, lat2, lon2):
    R = 6371
    lat1, lon1, lat2, lon2 = map(float, [lat1, lon1, lat2, lon2])

    dlat = radians(lat2 - lat1)
    dlon = radians(lon2 - lon1)

    a = (
        sin(dlat / 2) ** 2
        + cos(radians(lat1)) * cos(radians(lat2)) * sin(dlon / 2) ** 2
    )
    c = 2 * asin(min(1, sqrt(a)))

    return R * c


# ---------------------------------------------------------
# ML Category Prediction API
# ---------------------------------------------------------
@api_view(["POST"])
def predict_issue_category_api(request):
    description = request.data.get("description", "")
    if not description:
        return Response({"error": "description is required"}, status=400)

    category = predict_issue_category(description)
    return Response({"category": category})


# ---------------------------------------------------------
# Issue ViewSet (Main API)
# ---------------------------------------------------------
class IssueViewSet(viewsets.ModelViewSet):
    queryset = Issue.objects.all()
    serializer_class = IssueSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        qs = Issue.objects.all()

        # ---------------- Consumer can see only their issues ----------------
        if user.role == "consumer":
            qs = qs.filter(reported_by=user)

        # ---------------- Provider can see ONLY issues in their category ----------------
        elif user.role == "provider":
            if user.profession:
                qs = qs.filter(category=user.profession)
            else:
                return Issue.objects.none()

        # ---------------- Optional Distance Filter ----------------
        nearby = self.request.query_params.get("nearby")
        radius_km = self.request.query_params.get("radius_km")

        if nearby:
            try:
                lat, lon = map(float, nearby.split(","))
                result = []

                for issue in qs:
                    if issue.latitude and issue.longitude:
                        dist = haversine(lat, lon, issue.latitude, issue.longitude)
                        issue._distance = dist
                        result.append(issue)

                # Radius filter
                if radius_km:
                    result = [i for i in result if i._distance <= float(radius_km)]

                # Sort by nearest
                return sorted(result, key=lambda x: x._distance)

            except:
                pass

        return qs

    # Auto-assign reported_by
    def perform_create(self, serializer):
        serializer.save(reported_by=self.request.user)

    # -----------------------------------------------------
    # Provider → Claim Issue
    # -----------------------------------------------------
    @action(detail=True, methods=["post"])
    def claim(self, request, pk=None):
        issue = self.get_object()
        user = request.user

        if user.role != "provider":
            return Response({"detail": "Only providers can claim issues."}, status=403)

        if issue.assigned_to is not None:
            return Response({"detail": "Issue already claimed."}, status=400)

        if issue.status not in ("pending", "under_review", "assigned"):
            return Response({"detail": "Issue cannot be claimed now."}, status=400)

        issue.assigned_to = user
        issue.status = "in_progress"
        issue.save()

        return Response({"detail": "Issue claimed successfully."})

    # -----------------------------------------------------
    # Provider → Resolve Issue
    # -----------------------------------------------------
    @action(detail=True, methods=["post"])
    def resolve(self, request, pk=None):
        issue = self.get_object()
        user = request.user

        if user.role != "provider":
            return Response({"detail": "Only providers can resolve issues."}, status=403)

        if issue.assigned_to != user:
            return Response({"detail": "You must claim this issue first."}, status=403)

        if issue.status != "in_progress":
            return Response(
                {"detail": "Issue must be in progress before it can be resolved."},
                status=400,
            )

        issue.status = "resolved"
        issue.save()

        return Response({"detail": "Issue resolved successfully."})

    # -----------------------------------------------------
    # Like / Unlike
    # -----------------------------------------------------
    @action(detail=True, methods=["post"])
    def like(self, request, pk=None):
        issue = self.get_object()
        user = request.user

        if user in issue.likes.all():
            issue.likes.remove(user)
            return Response({"message": "Unliked", "likes_count": issue.likes.count()})

        issue.likes.add(user)
        return Response({"message": "Liked", "likes_count": issue.likes.count()})


# ---------------------------------------------------------
# Flag Report ViewSet
# ---------------------------------------------------------
class FlagReportViewSet(viewsets.ModelViewSet):
    queryset = FlagReport.objects.all()
    serializer_class = FlagReportSerializer
    permission_classes = [permissions.IsAuthenticated]

    def perform_create(self, serializer):
        try:
            serializer.save(reported_by=self.request.user)
        except IntegrityError:
            return Response(
                {"detail": "You have already flagged this issue."},
                status=400
            )


# ---------------------------------------------------------
# Moderation Dashboard (Staff Only)
# ---------------------------------------------------------
@staff_member_required
def flagged_issues_list(request):
    flagged_issues = FlagReport.objects.select_related("issue", "reported_by").all()
    return render(
        request,
        "reports/flagged_issues_list.html",
        {"flagged_issues": flagged_issues},
    )
