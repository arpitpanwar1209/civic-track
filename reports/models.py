from django.db import models
from django.contrib.auth import get_user_model

User = get_user_model()

class Issue(models.Model):
    CATEGORY_CHOICES = [
        ('road', 'Road'),
        ('garbage', 'Garbage'),
        ('water', 'Water'),
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
    location = models.CharField(max_length=255, blank=True, null=True)
    latitude = models.DecimalField(max_digits=9, decimal_places=6, blank=True, null=True)
    longitude = models.DecimalField(max_digits=9, decimal_places=6, blank=True, null=True)

    photo = models.ImageField(upload_to='issue_photos/', blank=True, null=True)
    additional_photos = models.ImageField(upload_to='issue_photos/extra/', blank=True, null=True)

    priority = models.CharField(max_length=10, choices=PRIORITY_CHOICES, default='medium')
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')

    assigned_to = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='assigned_issues',
        limit_choices_to={'role': 'provider'}
    )

    reported_by = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='issues'
    )

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    is_anonymous = models.BooleanField(default=False)

    feedback = models.TextField(blank=True, null=True)

    def __str__(self):
        return f"{self.title} ({self.status})"

    class Meta:
        ordering = ['-created_at']
