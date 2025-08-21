from django.contrib import admin
from .models import Issue, FlagReport

def assign_to_provider(modeladmin, request, queryset):
    provider = request.user  # or fetch a provider by logic
    for issue in queryset:
        issue.assigned_to = provider
        issue.save()
assign_to_provider.short_description = "Assign selected issues to provider"

@admin.register(Issue)
class IssueAdmin(admin.ModelAdmin):
    list_display = ('title', 'status', 'reported_by', 'assigned_to')
    actions = [assign_to_provider]

@admin.register(FlagReport)
class FlagReportAdmin(admin.ModelAdmin):
    list_display = ('issue', 'reported_by', 'reason', 'created_at', 'reviewed')
    list_filter = ('reason', 'reviewed', 'created_at')
    search_fields = ('issue__title', 'reported_by__username')
