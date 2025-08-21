from django.http import JsonResponse
from rest_framework.decorators import api_view
from rest_framework.response import Response
from accounts.models import CustomUser  # ✅ import your user model


# Home endpoint
def home(request):
    return JsonResponse({"message": "CivicTrack API is running"})


# Add a user (test API)
def add_user(request):
    # For demo, we create a static user (you can modify later for POST data)
    user = CustomUser.objects.create_user(
        username="johndoe",
        password="test123",   # ⚠️ default password, just for demo
        role="consumer"
    )
    return JsonResponse({"message": f"User {user.username} added successfully"})


# List users from DB
def list_users(request):
    users = CustomUser.objects.all().values("id", "username", "role", "email")

    return JsonResponse(list(users), safe=False)


# Example DRF endpoint (just for testing)
@api_view(["GET"])
def product_list(request):
    products = [
        {"id": 1, "name": "Laptop", "price": 50000},
        {"id": 2, "name": "Mouse", "price": 500},
    ]
    return Response(products)
