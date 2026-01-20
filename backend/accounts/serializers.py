from rest_framework import serializers
from django.contrib.auth.password_validation import validate_password
from .models import CustomUser


# =========================================================
# REGISTER SERIALIZER (CONSUMER / PROVIDER)
# =========================================================
class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(
        write_only=True,
        validators=[validate_password],
    )

    role = serializers.ChoiceField(
        choices=CustomUser.ROLE_CHOICES
    )

    profession = serializers.CharField(
        required=False,
        allow_null=True,
        allow_blank=True,
    )

    class Meta:
        model = CustomUser
        fields = (
            "id",
            "username",
            "email",
            "password",
            "role",
            "profession",
        )

    def validate(self, attrs):
        role = attrs.get("role")
        profession = attrs.get("profession")

        # Consumers must NOT have profession
        if role == "consumer":
            attrs["profession"] = None

        # Providers MUST have profession
        if role == "provider" and not profession:
            raise serializers.ValidationError(
                {"profession": "Profession is required for providers."}
            )

        return attrs

    def create(self, validated_data):
        password = validated_data.pop("password")
        user = CustomUser.objects.create_user(
            password=password,
            **validated_data
        )
        return user


# =========================================================
# USER PROFILE READ SERIALIZER (GET /profile/)
# =========================================================
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
        read_only_fields = [
            "id",
            "username",
            "email",
            "role",
            "profession",
        ]


# =========================================================
# USER PROFILE UPDATE SERIALIZER (PATCH /profile/update/)
# =========================================================
class UserProfileUpdateSerializer(serializers.ModelSerializer):
    """
    STRICT PATCH serializer.
    Only fields that are allowed to change.
    NO cross-field validation.
    NO role/profession logic.
    """

    class Meta:
        model = CustomUser
        fields = [
            "contact",
            "profile_pic",
        ]
