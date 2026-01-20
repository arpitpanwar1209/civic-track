from django.contrib import admin
from django.contrib import messages

from .models import Issue, IssuePhoto, FlagReport


# =========================================================
# Admin Action: Assign to logged-in provider
# =========================================================
def assign_to_provider(modeladmin, request, queryset):
    user = request.user

    if getattr(user, "role", None) != "provider":
        messages.error(
            request,
            "Only provider users can be assigned to issues."
        )
        return

    updated = 0
    for issue in queryset:
        if issue.assigned_provider is None:
            issue.assigned_provider = user
            issue.status = "assigned"
            issue.save()
            updated += 1

    messages.success(
        request,
        f"{updated} issue(s) assigned to {user.username}."
    )

assign_to_provider.short_description = "Assign selected issues to me (provider)"


# =========================================================
# Issue Admin
# =========================================================
@admin.register(Issue)
class IssueAdmin(admin.ModelAdmin):
    list_display = (
        "id",
        "title",
        "status",
        "reported_by",
        "assigned_provider",
        "priority",
        "created_at",
    )
    list_filter = (
        "status",
        "category",
        "priority",
        "assigned_provider",
    )
    search_fields = (
        "title",
        "description",
        "reported_by__username",
    )
    ordering = ("-created_at",)
    actions = [assign_to_provider]


# =========================================================
# Issue Photo Admin
# =========================================================
@admin.register(IssuePhoto)
class IssuePhotoAdmin(admin.ModelAdmin):
    list_display = ("id", "issue", "uploaded_at")
    ordering = ("-uploaded_at",)


# =========================================================
# Flag Report Admin
# =========================================================
@admin.register(FlagReport)
class FlagReportAdmin(admin.ModelAdmin):
    list_display = (
        "id",
        "issue",
        "reported_by",
        "reason",
        "reviewed",
        "created_at",
    )
    list_filter = ("reason", "reviewed", "created_at")
    search_fields = (
        "issue__title",
        "reported_by__username",
    )
    ordering = ("-created_at",)
