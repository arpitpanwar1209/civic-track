from django.urls import path
from . import views

urlpatterns = [
    # path('report/', views.report_issue, name='report_issue'),
    path('submit/', views.submit_issue, name='submit_issue'),
    path('success/', lambda request: render(request, 'reports/success.html'), name='issue_success'),
]
