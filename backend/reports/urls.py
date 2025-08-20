from django.urls import path
from django.shortcuts import render   # ✅ import render
from . import views

app_name = 'reports'

urlpatterns = [
    path('submit/', views.submit_issue, name='submit_issue'),
    path('claim/<int:issue_id>/', views.claim_issue, name='claim_issue'),
    path('flag/<int:issue_id>/', views.flag_issue, name='flag_issue'),
    path('admin/flags/', views.flagged_issues_list, name='flagged_issues_list'),
    path('admin/flags/<int:flag_id>/<str:action>/', views.resolve_flag, name='resolve_flag'),
    path('success/', lambda request: render(request, 'reports/success.html'), name='issue_success'),
]
