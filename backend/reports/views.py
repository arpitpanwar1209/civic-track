from django.shortcuts import render, redirect, get_object_or_404
from django.contrib.auth.decorators import login_required
from django.contrib.admin.views.decorators import staff_member_required
from rest_framework import viewsets
from .models import Issue, FlagReport
from .forms import IssueForm  # ✅ make sure you actually have this form
from .serializers import IssueSerializer, FlagReportSerializer


# ---------------------------
# REST API ViewSets (for React)
# ---------------------------

class IssueViewSet(viewsets.ModelViewSet):
    queryset = Issue.objects.all()
    serializer_class = IssueSerializer


class FlagReportViewSet(viewsets.ModelViewSet):
    queryset = FlagReport.objects.all()
    serializer_class = FlagReportSerializer


# ---------------------------
# Django Template Views (if using Django templates in parallel)
# ---------------------------

@staff_member_required
def flagged_issues_list(request):
    flagged_issues = FlagReport.objects.select_related('issue', 'reported_by').all()
    return render(request, 'reports/flagged_issues_list.html', {'flagged_issues': flagged_issues})


@login_required
def submit_issue(request):
    if request.method == 'POST':
        form = IssueForm(request.POST, request.FILES)
        if form.is_valid():
            issue = form.save(commit=False)
            issue.reported_by = request.user
            if request.POST.get('is_anonymous'):
                issue.is_anonymous = True
            issue.save()
            return redirect('accounts:dashboard')
    else:
        form = IssueForm()
    return render(request, 'reports/submit_issue.html', {'form': form})


@login_required
def claim_issue(request, issue_id):
    try:
        issue = Issue.objects.get(id=issue_id, assigned_to__isnull=True)
    except Issue.DoesNotExist:
        return redirect('accounts:dashboard')  # Or show an error message

    if hasattr(request.user, "role") and request.user.role == 'provider':
        issue.assigned_to = request.user
        issue.save()

    return redirect('accounts:dashboard')


@login_required
def flag_issue(request, issue_id):
    issue = get_object_or_404(Issue, id=issue_id)
    if request.method == 'POST':
        FlagReport.objects.create(
            issue=issue,
            reported_by=request.user,
            reason=request.POST.get('reason', 'other'),
            comment=request.POST.get('flag_reason', '')
        )
        return redirect('accounts:dashboard')
    return render(request, 'reports/flag_issue.html', {'issue': issue})


@staff_member_required
def resolve_flag(request, flag_id, action):
    flag = get_object_or_404(FlagReport, pk=flag_id)

    if action == 'approve':
        flag.reviewed = True
        flag.save()
    elif action == 'reject':
        flag.delete()
    elif action == 'delete':
        flag.issue.delete()
        flag.delete()

    return redirect('reports:flagged_issues_list')
