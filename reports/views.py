from django.shortcuts import render, redirect
from django.contrib.auth.decorators import login_required
from .models import Issue
from .forms import IssueForm  # Make sure you have this form

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

    if request.user.role == 'provider':
        issue.assigned_to = request.user
        issue.save()

    return redirect('accounts:dashboard')

@login_required
def flag_issue(request, issue_id):
    issue = get_object_or_404(Issue, id=issue_id)
    if request.method == 'POST':
        issue.is_flagged = True
        issue.flag_reason = request.POST.get('flag_reason', '')
        issue.save()
        return redirect('accounts:dashboard')
    return render(request, 'reports/flag_issue.html', {'issue': issue})
