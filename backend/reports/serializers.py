from rest_framework import serializers
from .models import Issue, IssuePhoto, FlagReport
from math import radians, cos, sin, asin, sqrt


class IssuePhotoSerializer(serializers.ModelSerializer):
    class Meta:
        model = IssuePhoto
        fields = ["id", "image", "uploaded_at"]


class FlagReportSerializer(serializers.ModelSerializer):
    reported_by = serializers.StringRelatedField()

    class Meta:
        model = FlagReport
        fields = ["id", "reason", "comment", "reported_by", "created_at", "reviewed"]


class IssueSerializer(serializers.ModelSerializer):
    # ✅ Extra fields
    likes_count = serializers.IntegerField(source="likes.count", read_only=True)
    reporter_name = serializers.SerializerMethodField()
    photos = IssuePhotoSerializer(many=True, read_only=True)
    assigned_to_name = serializers.CharField(source="assigned_to.username", read_only=True)
    distance_km = serializers.SerializerMethodField()   # ✅ New field

    class Meta:
        model = Issue
        fields = [
            "id", "title", "description", "category",
            "location", "latitude", "longitude",
            "photo", "priority", "status",
            "assigned_to", "assigned_to_name",
            "reported_by", "reporter_name",
            "created_at", "updated_at",
            "is_anonymous", "feedback", "is_flagged", "flag_reason",
            "likes", "likes_count", "photos",
            "distance_km",   # ✅ Added
        ]
        read_only_fields = ["reported_by", "status", "created_at", "updated_at"]

    def get_reporter_name(self, obj):
        if obj.is_anonymous:
            return "Anonymous"
        return obj.reported_by.username if obj.reported_by else "Unknown"

    def get_distance_km(self, obj):
        """
        Compute haversine distance between issue and ?nearby=lat,lon.
        Returns None if not requested or invalid.
        """
        request = self.context.get("request")
        if not request:
            return None

        nearby = request.query_params.get("nearby")
        if not nearby or not obj.latitude or not obj.longitude:
            return None

        try:
            lat, lon = map(float, nearby.split(","))
            return round(self._haversine(lat, lon, obj.latitude, obj.longitude), 2)
        except Exception:
            return None

    def _haversine(self, lat1, lon1, lat2, lon2):
        # Convert decimal degrees to radians
        lon1, lat1, lon2, lat2 = map(radians, [lon1, lat1, lon2, lat2])
        # Haversine formula
        dlon = lon2 - lon1
        dlat = lat2 - lat1
        a = sin(dlat / 2) ** 2 + cos(lat1) * cos(lat2) * sin(dlon / 2) ** 2
        c = 2 * asin(sqrt(a))
        r = 6371  # Radius of earth in kilometers
        return c * r

    def create(self, validated_data):
        validated_data["reported_by"] = self.context["request"].user
        return super().create(validated_data)
