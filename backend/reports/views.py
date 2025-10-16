# reports/views.py
from django.shortcuts import render, redirect, get_object_or_404
from django.contrib.auth.decorators import login_required
from django.contrib.admin.views.decorators import staff_member_required
from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import Issue, FlagReport
from .forms import IssueForm
from .serializers import IssueSerializer, FlagReportSerializer
import math


# ---------------------------
# Helper for haversine distance
# ---------------------------
def haversine(lat1, lon1, lat2, lon2):
    """
    Return distance in kilometers between two (lat, lon) points.
    """
    R = 6371  # Earth radius in km
    phi1, phi2 = math.radians(float(lat1)), math.radians(float(lat2))
    dphi = math.radians(float(lat2) - float(lat1))
    dlambda = math.radians(float(lon2) - float(lon1))

    a = math.sin(dphi / 2) ** 2 + math.cos(phi1) * math.cos(phi2) * math.sin(dlambda / 2) ** 2
    return R * (2 * math.atan2(math.sqrt(a), math.sqrt(1 - a)))


# ---------------------------
# REST API ViewSets (for React)
# ---------------------------
class IssueViewSet(viewsets.ModelViewSet):
    queryset = Issue.objects.all()
    serializer_class = IssueSerializer
    permission_classes = [permissions.IsAuthenticated]
   
    def get_queryset(self):
        """
        Consumers see their own issues,
        providers/admins see all.
        Supports ?nearby=lat,lon&radius_km=10
        """
        user = self.request.user
        qs = Issue.objects.all()

        if hasattr(user, "role") and user.role == "consumer":
            qs = qs.filter(reported_by=user)

        # ✅ Nearby filtering
        nearby = self.request.query_params.get("nearby")
        radius_km = self.request.query_params.get("radius_km")

        if nearby:
            try:
                lat_str, lon_str = nearby.split(",")
                lat, lon = float(lat_str), float(lon_str)

                issues_with_distance = []
                for issue in qs:
                    if issue.latitude is not None and issue.longitude is not None:
                        dist = haversine(lat, lon, issue.latitude, issue.longitude)
                        issues_with_distance.append((dist, issue))

                # Filter by radius if provided
                if radius_km:
                    r = float(radius_km)
                    issues_with_distance = [(d, i) for d, i in issues_with_distance if d <= r]

                # Sort by distance
                issues_with_distance.sort(key=lambda x: x[0])

                # Attach temporary field `_distance` so serializer can pick it up
                for d, issue in issues_with_distance:
                    issue._distance = d

                return [i for _, i in issues_with_distance]

            except Exception as e:
                print("Nearby query error:", e)

        return qs

    def perform_create(self, serializer):
        """Automatically attach logged-in user when creating issue."""
        serializer.save(reported_by=self.request.user)

    # ✅ Like/Unlike toggle with like count
    @action(detail=True, methods=["post"])
    def like(self, request, pk=None):
        issue = self.get_object()
        user = request.user

        if user in issue.likes.all():
            issue.likes.remove(user)
            return Response(
                {"message": "❌ Unliked", "likes_count": issue.likes.count()},
                status=status.HTTP_200_OK,
            )
        else:
            issue.likes.add(user)
            return Response(
                {"message": "✅ Liked", "likes_count": issue.likes.count()},
                status=status.HTTP_200_OK,
            )


class FlagReportViewSet(viewsets.ModelViewSet):
    queryset = FlagReport.objects.all()
    serializer_class = FlagReportSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return FlagReport.objects.all()

    def perform_create(self, serializer):
        serializer.save(reported_by=self.request.user)


# ---------------------------
# Django Template Views (optional)
# ---------------------------

@staff_member_required
def flagged_issues_list(request):
    flagged_issues = FlagReport.objects.select_related("issue", "reported_by").all()
    return render(
        request,
        "reports/flagged_issues_list.html",
        {"flagged_issues": flagged_issues},
    )


@login_required
def submit_issue(request):
    if request.method == "POST":
        form = IssueForm(request.POST, request.FILES)
        if form.is_valid():
            issue = form.save(commit=False)
            issue.reported_by = request.user
            if request.POST.get("is_anonymous"):
                issue.is_anonymous = True
            issue.save()
            return redirect("accounts:dashboard")
    else:
        form = IssueForm()
    return render(request, "reports/submit_issue.html", {"form": form})


@login_required
def claim_issue(request, issue_id):
    issue = get_object_or_404(Issue, id=issue_id, assigned_to__isnull=True)

    if hasattr(request.user, "role") and request.user.role == "provider":
        issue.assigned_to = request.user
        issue.save()

    return redirect("accounts:dashboard")


@login_required
def flag_issue(request, issue_id):
    issue = get_object_or_404(Issue, id=issue_id)
    if request.method == "POST":
        FlagReport.objects.create(
            issue=issue,
            reported_by=request.user,
            reason=request.POST.get("reason", "other"),
            comment=request.POST.get("flag_reason", ""),
        )
        return redirect("accounts:dashboard")
    return render(request, "reports/flag_issue.html", {"issue": issue})


@staff_member_required
def resolve_flag(request, flag_id, action):
    flag = get_object_or_404(FlagReport, pk=flag_id)

    if action == "approve":
        flag.reviewed = True
        flag.save()
    elif action == "reject":
        flag.delete()
    elif action == "delete":
        flag.issue.delete()
        flag.delete()

    return redirect("reports:flagged_issues_list")
