from django.urls import path
from django.contrib.auth import views as auth_views
from . import views

app_name = 'accounts'

urlpatterns = [
    path('signup/', views.signup_view, name='signup'),
    path('login/', auth_views.LoginView.as_view(template_name='accounts/login.html'), name='login'),
    path('logout/', auth_views.LogoutView.as_view(next_page='home'), name='logout'),
     
    
    path('dashboard/', views.role_based_redirect, name='dashboard'),
    path('dashboard/provider/', views.provider_dashboard, name='provider_dashboard'),
    path('dashboard/consumer/', views.consumer_dashboard, name='consumer_dashboard'),
]
