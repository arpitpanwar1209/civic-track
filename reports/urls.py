from django.urls import path
from . import views

app_name = 'reports'

urlpatterns = [
    # path('report/', views.report_issue, name='report_issue'),
    path('submit/', views.submit_issue, name='submit_issue'),
    path('claim/<int:issue_id>/', views.claim_issue, name='claim_issue'),
    path('flag/<int:issue_id>/', views.flag_issue, name='flag_issue'),
    path('success/', lambda request: render(request, 'reports/success.html'), name='issue_success'),
]
