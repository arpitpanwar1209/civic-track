from rest_framework import serializers
from .models import Issue, IssuePhoto, FlagReport
from math import radians, cos, sin, asin, sqrt
  # ✅ ML integration


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
    distance_km = serializers.SerializerMethodField()  # ✅ New field
    predicted_category = serializers.SerializerMethodField(read_only=True)  # ✅ AI output

    class Meta:
        model = Issue
        fields = [
            "id", "title", "description", "category", "predicted_category",
            "location", "latitude", "longitude",
            "photo", "priority", "status",
            "assigned_to", "assigned_to_name",
            "reported_by", "reporter_name",
            "created_at", "updated_at",
            "is_anonymous", "feedback", "is_flagged", "flag_reason",
            "likes", "likes_count", "photos",
            "distance_km",
        ]
        read_only_fields = [
            "reported_by", "status", "created_at", "updated_at", "predicted_category"
        ]

    # ✅ Compute human-readable name
    def get_reporter_name(self, obj):
        if obj.is_anonymous:
            return "Anonymous"
        return obj.reported_by.username if obj.reported_by else "Unknown"

    # ✅ Haversine distance calculation
    def get_distance_km(self, obj):
        request = self.context.get("request")
        if not request:
            return None

        nearby = request.query_params.get("nearby")
        if not nearby or not obj.latitude or not obj.longitude:
            return None

        try:
            lat, lon = map(float, nearby.split(","))
            return round(self._haversine(lat, lon, float(obj.latitude), float(obj.longitude)), 2)
        except Exception:
            return None

    def _haversine(self, lat1, lon1, lat2, lon2):
        lon1, lat1, lon2, lat2 = map(radians, [lon1, lat1, lon2, lat2])
        dlon = lon2 - lon1
        dlat = lat2 - lat1
        a = sin(dlat / 2) ** 2 + cos(lat1) * cos(lat2) * sin(dlon / 2) ** 2
        c = 2 * asin(sqrt(a))
        r = 6371
        return c * r

    # ✅ ML integration for predicted category
    def get_predicted_category(self, obj):
        """Return predicted category using ML model (non-persistent)."""
        if obj.description:
            return predict_issue_category(obj.description)
        return None

    # ✅ Override create() to attach user + auto-category prediction
    def create(self, validated_data):
        user = self.context["request"].user
        validated_data["reported_by"] = user

        # Auto-predict category if not provided
        if not validated_data.get("category") and validated_data.get("description"):
            predicted = predict_issue_category(validated_data["description"])
            validated_data["category"] = predicted or "other"

        return super().create(validated_data)
