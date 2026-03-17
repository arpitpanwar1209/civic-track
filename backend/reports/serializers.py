from rest_framework import serializers

from .models import Issue, IssuePhoto, FlagReport


# =========================================================
# ISSUE EXTRA PHOTOS
# =========================================================
class IssuePhotoSerializer(serializers.ModelSerializer):

    class Meta:
        model = IssuePhoto
        fields = ["id", "image", "uploaded_at"]


# =========================================================
# FLAG REPORT SERIALIZER
# =========================================================
class FlagReportSerializer(serializers.ModelSerializer):

    reported_by = serializers.StringRelatedField(read_only=True)

    class Meta:
        model = FlagReport
        fields = [
            "id",
            "reason",
            "comment",
            "reported_by",
            "created_at",
            "reviewed",
        ]

        read_only_fields = [
            "created_at",
            "reviewed",
        ]


# =========================================================
# CONSUMER ISSUE SERIALIZER
# =========================================================
class ConsumerIssueSerializer(serializers.ModelSerializer):

    likes_count = serializers.IntegerField(
        source="likes.count",
        read_only=True
    )

    reporter_name = serializers.SerializerMethodField()

    photos = IssuePhotoSerializer(
        many=True,
        read_only=True
    )

    distance_km = serializers.SerializerMethodField()

    class Meta:
        model = Issue

        fields = [
            "id",
            "title",
            "description",
            "category",
            "location",
            "latitude",
            "longitude",
            "photo",
            "priority",
            "status",
            "reporter_name",
            "created_at",
            "updated_at",
            "is_anonymous",
            "likes_count",
            "photos",
            "distance_km",
        ]

        read_only_fields = [
            "id",
            "status",
            "created_at",
            "updated_at",
            "likes_count",
            "distance_km",
        ]

    # ---------------- Reporter Name ----------------
    def get_reporter_name(self, obj):

        if obj.is_anonymous:
            return "Anonymous"

        return obj.reported_by.username

    # ---------------- Distance ----------------
    def get_distance_km(self, obj):
        return getattr(obj, "_distance", None)

    # ---------------- Auto Assign Reporter ----------------
    def create(self, validated_data):

        validated_data["reported_by"] = self.context["request"].user

        return super().create(validated_data)


# =========================================================
# PROVIDER ISSUE SERIALIZER
# =========================================================
class ProviderIssueSerializer(serializers.ModelSerializer):

    reporter_name = serializers.SerializerMethodField()

    assigned_provider_name = serializers.CharField(
        source="assigned_provider.username",
        read_only=True,
    )

    distance_km = serializers.SerializerMethodField()

    class Meta:
        model = Issue

        fields = [
            "id",
            "title",
            "description",
            "category",
            "priority",
            "status",
            "assigned_provider",
            "assigned_provider_name",
            "reporter_name",
            "latitude",
            "longitude",
            "created_at",
            "updated_at",
            "distance_km",
        ]

        read_only_fields = [
            "id",
            "created_at",
            "updated_at",
        ]

    # ---------------- Reporter Name ----------------
    def get_reporter_name(self, obj):

        if obj.is_anonymous:
            return "Anonymous"

        return obj.reported_by.username

    # ---------------- Distance ----------------
    def get_distance_km(self, obj):

        return getattr(obj, "_distance", None)