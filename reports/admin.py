from django.contrib import admin
from .models import Issue

@admin.action(description='Assign selected issues to provider')
def assign_to_provider(modeladmin, request, queryset):
    provider = request.user  # or fetch a provider by logic
    for issue in queryset:
        issue.assigned_to = provider
        issue.save()

class IssueAdmin(admin.ModelAdmin):
    list_display = ('title', 'status', 'reported_by', 'assigned_to')
    actions = [assign_to_provider]

admin.site.register(Issue, IssueAdmin)
