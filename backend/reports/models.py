from django.db import models
from django.conf import settings
from django.contrib.auth import get_user_model
from ml.predict import predict_issue_category

User = get_user_model()


class Issue(models.Model):
    # Unified categories — SAME KEYS as CustomUser.PROFESSION_CHOICES
    CATEGORY_CHOICES = [
        ('road', 'Road'),
        ('garbage', 'Garbage'),
        ('water', 'Water Supply'),
        ('electricity', 'Electricity'),
        ('drainage', 'Drainage & Sewage'),
        ('street_light', 'Street Lighting'),
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

    # ---------------- Core Fields ----------------
    title = models.CharField(max_length=255)
    description = models.TextField()
    category = models.CharField(
        max_length=50, choices=CATEGORY_CHOICES, blank=True, null=True
    )

    # ---------------- Location ----------------
    location = models.CharField(max_length=255, blank=True, null=True)
    latitude = models.DecimalField(max_digits=9, decimal_places=6, blank=True, null=True)
    longitude = models.DecimalField(max_digits=9, decimal_places=6, blank=True, null=True)

    # ---------------- Images ----------------
    photo = models.ImageField(upload_to="issue_photos/", blank=True, null=True)

    # ---------------- Workflow ----------------
    priority = models.CharField(max_length=10, choices=PRIORITY_CHOICES, default="medium")
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default="pending")

    # ---------------- Assignment ----------------
    assigned_to = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="assigned_issues",
        limit_choices_to={'role': 'provider'},
        help_text="Assigned service provider",
    )

    reported_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="issues"
    )

    # ---------------- Timestamps ----------------
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    # ---------------- Moderation ----------------
    is_anonymous = models.BooleanField(default=False)
    feedback = models.TextField(blank=True, null=True)
    is_flagged = models.BooleanField(default=False)
    flag_reason = models.TextField(blank=True, null=True)

    # ---------------- Likes ----------------
    likes = models.ManyToManyField(
        settings.AUTH_USER_MODEL,
        related_name="liked_issues",
        blank=True
    )

    # Runtime variable (NOT stored in DB)
    _distance = None

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return f"{self.title} ({self.status})"

    # ---------------- Computed Properties ----------------
    @property
    def likes_count(self):
        return self.likes.count()

    @property
    def reporter_name(self):
        return "Anonymous" if self.is_anonymous else self.reported_by.username

    @property
    def distance_km(self):
        return round(self._distance, 2) if self._distance else None

    # ---------------- ML Auto Category ----------------
    def save(self, *args, **kwargs):
        # Autopredict only if category is missing
        if not self.category and self.description:
            predicted = predict_issue_category(self.description)
            if predicted in dict(self.CATEGORY_CHOICES):
                self.category = predicted
            else:
                self.category = "other"
        super().save(*args, **kwargs)


class IssuePhoto(models.Model):
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
