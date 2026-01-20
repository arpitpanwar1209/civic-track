from rest_framework import serializers
from math import radians, cos, sin, asin, sqrt

from .models import Issue, IssuePhoto, FlagReport


# =========================================================
# Issue Extra Photos
# =========================================================
class IssuePhotoSerializer(serializers.ModelSerializer):
    class Meta:
        model = IssuePhoto
        fields = ["id", "image", "uploaded_at"]


# =========================================================
# Flag Report Serializer
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
        read_only_fields = ["created_at", "reviewed"]


# =========================================================
# CONSUMER ISSUE SERIALIZER
# =========================================================
class ConsumerIssueSerializer(serializers.ModelSerializer):
    likes_count = serializers.IntegerField(source="likes.count", read_only=True)
    reporter_name = serializers.SerializerMethodField()
    photos = IssuePhotoSerializer(many=True, read_only=True)
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
        return "Anonymous" if obj.is_anonymous else obj.reported_by.username

    # ---------------- Distance Logic ----------------
    def get_distance_km(self, obj):
        request = self.context.get("request")
        if not request:
            return None

        nearby = request.query_params.get("nearby")
        if not nearby or not obj.latitude or not obj.longitude:
            return None

        try:
            lat, lon = map(float, nearby.split(","))
            return round(
                self._haversine(
                    lat,
                    lon,
                    float(obj.latitude),
                    float(obj.longitude),
                ),
                2,
            )
        except Exception:
            return None

    def _haversine(self, lat1, lon1, lat2, lon2):
        lon1, lat1, lon2, lat2 = map(
            radians, [lon1, lat1, lon2, lat2]
        )
        dlon = lon2 - lon1
        dlat = lat2 - lat1
        a = (
            sin(dlat / 2) ** 2
            + cos(lat1) * cos(lat2) * sin(dlon / 2) ** 2
        )
        c = 2 * asin(sqrt(a))
        return 6371 * c  # km

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
        return "Anonymous" if obj.is_anonymous else obj.reported_by.username

    # ---------------- Safe Distance ----------------
    def get_distance_km(self, obj):
        return getattr(obj, "_distance", None)
