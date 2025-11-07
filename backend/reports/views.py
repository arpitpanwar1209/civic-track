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
# Helper for Haversine Distance
# ---------------------------
def haversine(lat1, lon1, lat2, lon2):
    R = 6371
    phi1, phi2 = math.radians(float(lat1)), math.radians(float(lat2))
    dphi = math.radians(float(lat2) - float(lat1))
    dlambda = math.radians(float(lon2) - float(lon1))

    a = math.sin(dphi / 2) ** 2 + math.cos(phi1) * math.cos(phi2) * math.sin(dlambda / 2) ** 2
    return R * (2 * math.atan2(math.sqrt(a), math.sqrt(1 - a)))


# ---------------------------
# REST API ViewSet (Used by React)
# ---------------------------
class IssueViewSet(viewsets.ModelViewSet):
    queryset = Issue.objects.all()
    serializer_class = IssueSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        qs = Issue.objects.all()

        # ✅ Consumer sees only their issues
        if user.role == "consumer":
            qs = qs.filter(reported_by=user)

        # ✅ Provider sees only issues in their assigned profession
        elif user.role == "provider":
            if user.profession:
                qs = qs.filter(category__iexact=user.profession.lower())
            else:
                qs = Issue.objects.none()

        # ✅ Optional Nearby Filtering
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

                if radius_km:
                    r = float(radius_km)
                    result = [i for i in result if i._distance <= r]

                return sorted(result, key=lambda i: i._distance)

            except Exception as e:
                print("Nearby filter error:", e)

        return qs

    def perform_create(self, serializer):
        """Auto-assign reporter"""
        serializer.save(reported_by=self.request.user)

    # ✅ Provider Claim Issue
    @action(detail=True, methods=["post"])
    def claim(self, request, pk=None):
        issue = self.get_object()

        if request.user.role != "provider":
            return Response({"detail": "Only providers can claim issues."}, status=403)

        if issue.assigned_to:
            return Response({"detail": "This issue is already claimed."}, status=400)

        issue.assigned_to = request.user
        issue.status = "in_progress"
        issue.save()

        return Response({"detail": "✅ Issue claimed successfully."}, status=200)

    # ✅ Provider Resolve Issue
    @action(detail=True, methods=["post"])
    def resolve(self, request, pk=None):
        issue = self.get_object()

        if request.user.role != "provider":
            return Response({"detail": "Only providers can mark issues resolved."}, status=403)

        if issue.assigned_to != request.user:
            return Response({"detail": "You must claim the issue before resolving it."}, status=400)

        issue.status = "resolved"
        issue.save()

        return Response({"detail": "✅ Issue marked as resolved."}, status=200)

    # ✅ Like / Unlike Toggle
    @action(detail=True, methods=["post"])
    def like(self, request, pk=None):
        issue = self.get_object()
        user = request.user

        if user in issue.likes.all():
            issue.likes.remove(user)
            return Response({"message": "❌ Unliked", "likes_count": issue.likes.count()}, status=200)

        issue.likes.add(user)
        return Response({"message": "✅ Liked", "likes_count": issue.likes.count()}, status=200)


# ---------------------------
# Flag Reporting (Moderation)
# ---------------------------
class FlagReportViewSet(viewsets.ModelViewSet):
    queryset = FlagReport.objects.all()
    serializer_class = FlagReportSerializer
    permission_classes = [permissions.IsAuthenticated]

    def perform_create(self, serializer):
        serializer.save(reported_by=self.request.user)


# ---------------------------
# Admin Moderation Views
# ---------------------------
@staff_member_required
def flagged_issues_list(request):
    flagged_issues = FlagReport.objects.select_related("issue", "reported_by").all()
    return render(request, "reports/flagged_issues_list.html", {"flagged_issues": flagged_issues})


# ---------------------------
# Legacy Template Views (Optional)
# ---------------------------
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
