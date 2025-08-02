from django.shortcuts import render, redirect
from django.contrib.auth.decorators import login_required
from .forms import IssueForm

@login_required
def submit_issue(request):
    if request.method == 'POST':
        form = IssueForm(request.POST, request.FILES)
        if form.is_valid():
            issue = form.save(commit=False)
            if not form.cleaned_data['is_anonymous']:
                issue.reported_by = request.user
            issue.save()
            return redirect('reports:issue_list')
    else:
        form = IssueForm()
    return render(request, 'reports/submit_issue.html', {'form': form})
