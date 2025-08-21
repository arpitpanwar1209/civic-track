from rest_framework import generics, permissions
from rest_framework.response import Response
from .models import CustomUser
from .serializers import RegisterSerializer, UserSerializer
from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer


# ----------------------------
# Signup
# ----------------------------
class RegisterView(generics.CreateAPIView):
    queryset = CustomUser.objects.all()
    serializer_class = RegisterSerializer
    permission_classes = [permissions.AllowAny]


# ----------------------------
# User Profile (must be logged in)
# ----------------------------
class UserProfileView(generics.RetrieveAPIView):
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_object(self):
        return self.request.user


# ----------------------------
# Custom JWT Login
# ----------------------------
class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)
        # ✅ Add extra fields to JWT
        token['username'] = user.username
        token['role'] = user.role
        return token


class LoginView(TokenObtainPairView):
    serializer_class = CustomTokenObtainPairSerializer
