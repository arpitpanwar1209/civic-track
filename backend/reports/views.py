from django.shortcuts import render, redirect, get_object_or_404
from django.contrib.auth.decorators import login_required
from django.contrib.admin.views.decorators import staff_member_required
from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import Issue, FlagReport
from .forms import IssueForm
from .serializers import IssueSerializer, FlagReportSerializer


# ---------------------------
# REST API ViewSets (for React)
# ---------------------------

class IssueViewSet(viewsets.ModelViewSet):
    queryset = Issue.objects.all()
    serializer_class = IssueSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        """Consumers see their own issues, providers/admins see all."""
        user = self.request.user
        if hasattr(user, "role") and user.role == "consumer":
            return Issue.objects.filter(reported_by=user)
        return Issue.objects.all()

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
