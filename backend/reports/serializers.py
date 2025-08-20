from rest_framework import serializers
from .models import Issue, IssuePhoto, FlagReport


class IssuePhotoSerializer(serializers.ModelSerializer):
    class Meta:
        model = IssuePhoto
        fields = ['id', 'image', 'uploaded_at']

class FlagReportSerializer(serializers.ModelSerializer):
    reported_by = serializers.StringRelatedField()

    class Meta:
        model = FlagReport
        fields = ['id', 'reason', 'comment', 'reported_by', 'created_at', 'reviewed']

class IssueSerializer(serializers.ModelSerializer):
    photos = IssuePhotoSerializer(many=True, read_only=True)
    flags = FlagReportSerializer(many=True, read_only=True)
    reported_by = serializers.StringRelatedField()

    class Meta:
        model = Issue
        fields = '__all__'
