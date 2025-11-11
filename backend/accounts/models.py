from django.contrib.auth.models import AbstractUser
from django.db import models

class CustomUser(AbstractUser):
    ROLE_CHOICES = [
        ('consumer', 'Consumer'),
        ('provider', 'Provider'),
    ]

    PROFESSION_CHOICES = (
        ("electricity", "Electricity"),
        ("road", "Road Maintenance"),
        ("water", "Water Supply"),
        ("garbage", "Garbage & Sanitation"),
        ("drainage", "Drainage & Sewage"),
        ("street_light", "Street Lighting"),
    )

    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default="consumer")

    profession = models.CharField(
        max_length=50,
        choices=PROFESSION_CHOICES,
        blank=True,
        null=True,
        help_text="Required only if role = provider"
    )

    # ✅ Add These Fields
    contact = models.CharField(max_length=15, blank=True, null=True)
    profile_pic = models.ImageField(upload_to="profile_pics/", blank=True, null=True)

    def __str__(self):
        return self.username
