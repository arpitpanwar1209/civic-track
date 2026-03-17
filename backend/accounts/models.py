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

    # =====================================================
    # ROLE
    # =====================================================
    role = models.CharField(
        max_length=20,
        choices=ROLE_CHOICES,
        default="consumer"
    )

    # =====================================================
    # PROVIDER PROFESSION
    # =====================================================
    profession = models.CharField(
        max_length=50,
        choices=PROFESSION_CHOICES,
        blank=True,
        null=True
    )

    # =====================================================
    # PROVIDER LOCATION (for distance routing)
    # =====================================================
    latitude = models.DecimalField(
        max_digits=9,
        decimal_places=6,
        blank=True,
        null=True
    )

    longitude = models.DecimalField(
        max_digits=9,
        decimal_places=6,
        blank=True,
        null=True
    )

    service_radius_km = models.PositiveIntegerField(
        default=10,
        help_text="Maximum distance provider accepts issues from"
    )

    # =====================================================
    # PROFILE
    # =====================================================
    contact = models.CharField(
        max_length=15,
        blank=True,
        null=True
    )

    profile_pic = models.ImageField(
        upload_to="profile_pics/",
        blank=True,
        null=True
    )

    # =====================================================
    # VALIDATION
    # =====================================================
    def clean(self):
        """
        Enforce role-based rules at model level
        """

        if self.role == "provider" and not self.profession:
            raise ValidationError("Provider must have a profession.")

        if self.role == "consumer" and self.profession:
            raise ValidationError("Consumer cannot have a profession.")

        # Providers must have location
        if self.role == "provider":
            if not self.latitude or not self.longitude:
                raise ValidationError(
                    "Provider must have latitude and longitude."
                )

    def save(self, *args, **kwargs):
        self.full_clean()
        super().save(*args, **kwargs)

    # =====================================================
    # STRING REPRESENTATION
    # =====================================================
    def __str__(self):
        return f"{self.username} ({self.role})"