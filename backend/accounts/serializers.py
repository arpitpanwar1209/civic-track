from rest_framework import serializers
from django.contrib.auth import get_user_model
from django.contrib.auth.password_validation import validate_password
from .models import CustomUser

User = get_user_model()


# ---------------------------------------------------------
# Secure Registration Serializer
# ---------------------------------------------------------
class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(
        write_only=True,
        validators=[validate_password]
    )

    class Meta:
        model = User
        fields = ("id", "username", "email", "password")

    def create(self, validated_data):
        # Users ALWAYS register as consumers
        user = User.objects.create_user(
            username=validated_data["username"],
            email=validated_data.get("email", ""),
            password=validated_data["password"],
            role="consumer",
            profession=None,
        )
        return user


# ---------------------------------------------------------
# Public Profile Read Serializer
# ---------------------------------------------------------
class UserSerializer(serializers.ModelSerializer):
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
        read_only_fields = ["id", "role", "profession"]


# ---------------------------------------------------------
# Profile Update Serializer
# ---------------------------------------------------------
class UserProfileSerializer(serializers.ModelSerializer):
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
            "profession",
        ]
        read_only_fields = ["id", "email"]

    def validate(self, attrs):
        user = self.instance

        # Consumers cannot have profession
        if user.role == "consumer":
            attrs["profession"] = None

        # Providers must have profession
        if user.role == "provider" and not attrs.get("profession", user.profession):
            raise serializers.ValidationError(
                {"profession": "Profession is required for providers."}
            )

        return attrs
