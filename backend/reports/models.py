from django.db import models
from django.contrib.auth import get_user_model

User = get_user_model()


class Issue(models.Model):
    CATEGORY_CHOICES = [
        ('road', 'Road'),
        ('garbage', 'Garbage'),
        ('water', 'Water Supply'),
        ('electricity', 'Electricity'),
        ('sewage', 'Sewage'),
        ('lighting', 'Street Lighting'),
        ('pollution', 'Pollution'),
        ('traffic', 'Traffic'),
        ('other', 'Other'),
    ]

    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('under_review', 'Under Review'),
        ('assigned', 'Assigned'),
        ('in_progress', 'In Progress'),
        ('resolved', 'Resolved'),
        ('rejected', 'Rejected'),
    ]

    PRIORITY_CHOICES = [
        ('low', 'Low'),
        ('medium', 'Medium'),
        ('high', 'High'),
        ('urgent', 'Urgent'),
    ]

    title = models.CharField(max_length=255)
    description = models.TextField()
    category = models.CharField(max_length=50, choices=CATEGORY_CHOICES)

    # Location data
    location = models.CharField(max_length=255, blank=True, null=True)
    latitude = models.DecimalField(max_digits=9, decimal_places=6, blank=True, null=True)
    longitude = models.DecimalField(max_digits=9, decimal_places=6, blank=True, null=True)

    # Photos (main + multiple extras)
    photo = models.ImageField(upload_to="issue_photos/", blank=True, null=True)

    priority = models.CharField(max_length=10, choices=PRIORITY_CHOICES, default="medium")
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default="pending")

    # Assignments
    assigned_to = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="assigned_issues",
        limit_choices_to={'role': 'provider'}
    )

    reported_by = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name="issues"
    )

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    # Flags & moderation
    is_anonymous = models.BooleanField(default=False)
    feedback = models.TextField(blank=True, null=True)
    is_flagged = models.BooleanField(default=False)
    flag_reason = models.TextField(blank=True, null=True)

    def __str__(self):
        return f"{self.title} ({self.status})"

    class Meta:
        ordering = ["-created_at"]


class IssuePhoto(models.Model):
    """
    Allows attaching multiple photos (up to 5) per Issue.
    """
    issue = models.ForeignKey(Issue, on_delete=models.CASCADE, related_name="photos")
    image = models.ImageField(upload_to="issue_photos/extra/")
    uploaded_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Photo for {self.issue.title}"


class FlagReport(models.Model):
    REASON_CHOICES = [
        ('inappropriate', 'Inappropriate Content'),
        ('spam', 'Spam or Fake'),
        ('duplicate', 'Duplicate Issue'),
        ('other', 'Other'),
    ]

    issue = models.ForeignKey(Issue, on_delete=models.CASCADE, related_name="flags")
    reported_by = models.ForeignKey(User, on_delete=models.CASCADE)
    reason = models.CharField(max_length=50, choices=REASON_CHOICES)
    comment = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    reviewed = models.BooleanField(default=False)

    class Meta:
        unique_together = ("issue", "reported_by")

    def __str__(self):
        return f"Flag on '{self.issue.title}' by {self.reported_by.username}"
