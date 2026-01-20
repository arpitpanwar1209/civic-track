from rest_framework.permissions import BasePermission


class IsProvider(BasePermission):
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.role == "provider"


class IsConsumer(BasePermission):
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.role == "consumer"
