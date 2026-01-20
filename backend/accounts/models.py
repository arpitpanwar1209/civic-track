from django.contrib.auth.models import AbstractUser
from django.core.exceptions import ValidationError
from django.db import models


class CustomUser(AbstractUser):

    ROLE_CHOICES = [
        ("consumer", "Consumer"),
        ("provider", "Provider"),
    ]

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

    # ---------------- Role ----------------
    role = models.CharField(
        max_length=20,
        choices=ROLE_CHOICES,
        default="consumer"
    )

    # ---------------- Provider-only field ----------------
    profession = models.CharField(
        max_length=50,
        choices=PROFESSION_CHOICES,
        blank=True,
        null=True
    )

    # ---------------- Profile ----------------
    contact = models.CharField(max_length=15, blank=True, null=True)
    profile_pic = models.ImageField(upload_to="profile_pics/", blank=True, null=True)

    def clean(self):
        """
        Enforce role-based rules at model level
        """
        if self.role == "provider" and not self.profession:
            raise ValidationError("Provider must have a profession.")

        if self.role == "consumer" and self.profession:
            raise ValidationError("Consumer cannot have a profession.")

    def save(self, *args, **kwargs):
        self.full_clean()  # enforce clean()
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.username} ({self.role})"
