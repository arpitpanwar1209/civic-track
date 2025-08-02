from django.shortcuts import render, redirect
from django.contrib.auth.decorators import login_required
from django.contrib.auth import get_user_model
from reports.models import Issue 
from .forms import CustomUserCreationForm

User = get_user_model()

def login_view(request):
    return render(request, 'accounts/login.html')

def signup_view(request):
    if request.method == 'POST':
        form = CustomUserCreationForm(request.POST)
        if form.is_valid():
            form.save()
            return redirect('accounts:login')  # Assuming this URL exists
    else:
        form = CustomUserCreationForm()
    return render(request, 'accounts/signup.html', {'form': form})

@login_required
def dashboard(request):
    issues = Issue.objects.filter(reported_by=request.user).order_by('-created_at')
    return render(request, 'accounts/dashboard.html', {'issues': issues})

