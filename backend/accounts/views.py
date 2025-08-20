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
    if request.user.role == 'provider':
        
        issues = Issue.objects.filter(assigned_to__isnull=True).order_by('-created_at')
    else:
       
        issues = Issue.objects.filter(reported_by=request.user).order_by('-created_at')
    
    return render(request, 'accounts/dashboard.html', {'issues': issues})
  
@login_required
def role_based_redirect(request):
    if request.user.role == 'provider':
        return redirect('accounts:provider_dashboard')
    else:
        return redirect('accounts:consumer_dashboard')


@login_required
def provider_dashboard(request):
    return render(request, 'accounts/provider_dashboard.html')

@login_required
def consumer_dashboard(request):
    issues = Issue.objects.filter(reported_by=request.user)
    return render(request, 'accounts/consumer_dashboard.html', {'issues': issues})
