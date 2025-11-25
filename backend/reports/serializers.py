from rest_framework import serializers
from .models import Issue, IssuePhoto, FlagReport
from math import radians, cos, sin, asin, sqrt
from ml.predict import predict_issue_category


# ---------------------------------------------------------
# Extra Issue Photos (Multiple Images)
# ---------------------------------------------------------
class IssuePhotoSerializer(serializers.ModelSerializer):
    class Meta:
        model = IssuePhoto
        fields = ["id", "image", "uploaded_at"]


# ---------------------------------------------------------
# Flag Report Serializer
# ---------------------------------------------------------
class FlagReportSerializer(serializers.ModelSerializer):
    reported_by = serializers.StringRelatedField(read_only=True)

    class Meta:
        model = FlagReport
        fields = ["id", "reason", "comment", "reported_by", "created_at", "reviewed"]
        read_only_fields = ["created_at", "reviewed"]


# ---------------------------------------------------------
# Issue Serializer (Main)
# ---------------------------------------------------------
class IssueSerializer(serializers.ModelSerializer):
    likes_count = serializers.IntegerField(source="likes.count", read_only=True)
    reporter_name = serializers.SerializerMethodField()
    photos = IssuePhotoSerializer(many=True, read_only=True)
    assigned_to_name = serializers.CharField(source="assigned_to.username", read_only=True)
    distance_km = serializers.SerializerMethodField()
    predicted_category = serializers.SerializerMethodField(read_only=True)

    class Meta:
        model = Issue
        fields = [
            "id", "title", "description", "category", "predicted_category",
            "location", "latitude", "longitude",
            "photo", "priority", "status",
            "assigned_to", "assigned_to_name",
            "reported_by", "reporter_name",
            "created_at", "updated_at",
            "is_anonymous", "feedback",
            "is_flagged", "flag_reason",
            "likes", "likes_count",
            "photos",
            "distance_km",
        ]

        read_only_fields = [
            "id", "reported_by", "status",
            "created_at", "updated_at",
            "likes", "predicted_category"
        ]

    # -----------------------------------------------------
    # Reporter Name
    # -----------------------------------------------------
    def get_reporter_name(self, obj):
        if obj.is_anonymous:
            return "Anonymous"
        return obj.reported_by.username if obj.reported_by else "Unknown"

    # -----------------------------------------------------
    # Distance from ?nearby=lat,lon
    # -----------------------------------------------------
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
        except:
            return None

    def _haversine(self, lat1, lon1, lat2, lon2):
        lon1, lat1, lon2, lat2 = map(radians, [lon1, lat1, lon2, lat2])
        dlon = lon2 - lon1
        dlat = lat2 - lat1
        a = sin(dlat / 2) ** 2 + cos(lat1) * cos(lat2) * sin(dlon / 2) ** 2
        c = 2 * asin(sqrt(a))
        return 6371 * c  # Earth radius

    # -----------------------------------------------------
    # ML Category Prediction (non-persistent)
    # -----------------------------------------------------
    def get_predicted_category(self, obj):
        if obj.description:
            return predict_issue_category(obj.description)
        return None

    # -----------------------------------------------------
    # Override Create: Auto-Assign Reporter + Category
    # -----------------------------------------------------
    def create(self, validated_data):
        user = self.context["request"].user
        validated_data["reported_by"] = user

        # Auto-categorize with ML if missing
        if not validated_data.get("category"):
            desc = validated_data.get("description")
            validated_data["category"] = (
                predict_issue_category(desc) if desc else "other"
            )

        return super().create(validated_data)
