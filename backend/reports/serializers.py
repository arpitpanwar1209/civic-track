from rest_framework import serializers
from .models import Issue, IssuePhoto, FlagReport


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
    reporter_name = serializers.CharField(source="reporter_name", read_only=True)
    photos = IssuePhotoSerializer(many=True, read_only=True)
    assigned_to_name = serializers.CharField(source="assigned_to.username", read_only=True)

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
            "likes", "likes_count", "photos"
        ]
        read_only_fields = ["reported_by", "status", "created_at", "updated_at"]

    def create(self, validated_data):
        validated_data["reported_by"] = self.context["request"].user
        return super().create(validated_data)
