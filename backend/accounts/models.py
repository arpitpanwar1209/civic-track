from django.contrib.auth.models import AbstractUser
from django.db import models

class CustomUser(AbstractUser):
    # Unified category/profession keys (match Issue.CATEGORY_CHOICES)
    PROFESSION_CHOICES = [
        ("road", "Road Maintenance"),
        ("garbage", "Garbage & Sanitation"),
        ("water", "Water Supply"),
        ("electricity", "Electricity"),
        ("drainage", "Drainage & Sewage"),
        ("street_light", "Street Lighting"),
        ("pollution", "Pollution"),
        ("traffic", "Traffic"),
        ("other", "Other"),
    ]

    ROLE_CHOICES = [
        ("consumer", "Consumer"),
        ("provider", "Provider"),
    ]

    # ---------------------- Role & Profession ----------------------
    role = models.CharField(
        max_length=20,
        choices=ROLE_CHOICES,
        default="consumer",
        help_text="User role: consumer or provider"
    )

    profession = models.CharField(
        max_length=50,
        choices=PROFESSION_CHOICES,
        blank=True,
        null=True,
        help_text="Required only if role = provider"
    )

    # ---------------------- User Profile Extras --------------------
    contact = models.CharField(max_length=15, blank=True, null=True)
    profile_pic = models.ImageField(upload_to="profile_pics/", blank=True, null=True)

    def __str__(self):
        return self.username
