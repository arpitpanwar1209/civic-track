from rest_framework.permissions import BasePermission


class IsConsumer(BasePermission):
    """
    Allows access only to authenticated consumer users.
    """

    def has_permission(self, request, view):
        user = request.user

        if not user or not user.is_authenticated:
            return False

        # Defensive check: role must exist and match exactly
        return getattr(user, "role", None) == "consumer"


class IsProvider(BasePermission):
    """
    Allows access only to authenticated provider users.
    """

    def has_permission(self, request, view):
        user = request.user

        if not user or not user.is_authenticated:
            return False

        # Defensive check: role must exist and match exactly
        return getattr(user, "role", None) == "provider"
