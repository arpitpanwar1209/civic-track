from rest_framework import serializers
from django.contrib.auth import get_user_model
from django.contrib.auth.password_validation import validate_password
from .models import CustomUser

User = get_user_model()

class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, validators=[validate_password])
    role = serializers.ChoiceField(choices=User.ROLE_CHOICES)

    class Meta:
        model = User
        fields = ("id", "username", "email", "password", "role", "profession")

    def create(self, validated_data):
        user = User.objects.create_user(
            username=validated_data["username"],
            email=validated_data.get("email", ""),
            password=validated_data["password"],
            role=validated_data.get("role", "consumer"),
            profession=validated_data.get("profession", None),
        )
        return user


class UserSerializer(serializers.ModelSerializer):
    """Used when returning logged-in profile to frontend"""
    class Meta:
        model = CustomUser
        fields = [
            "id",
            "username",
            "email",
            "contact",
            "profile_pic",
            "role",
            "profession",
        ]
        read_only_fields = ["id", "role"]


class UserProfileSerializer(serializers.ModelSerializer):
    """Used for profile update settings page"""
    class Meta:
        model = CustomUser
        fields = [
            "id",
            "username",
            "email",
            "first_name",
            "last_name",
            "contact",
            "profile_pic",
            "profession",   # ✅ NOW EDITABLE
        ]
        read_only_fields = ["id", "email"]
