"""
Development settings
"""

from .base import *
from dotenv import load_dotenv
import os

load_dotenv(BASE_DIR / ".env.development")

# =====================================================
# Debug
# =====================================================
DEBUG = True


# =====================================================
# Allowed Hosts
# =====================================================
ALLOWED_HOSTS = [
    "localhost",
    "127.0.0.1",
    "civic-track-v2k5.onrender.com",  # optional for testing prod API locally
]


# =====================================================
# CORS Configuration
# =====================================================
CORS_ALLOWED_ORIGINS = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "https://civic-track-phi.vercel.app",
]

CORS_ALLOW_CREDENTIALS = True


# =====================================================
# CSRF Configuration
# =====================================================
CSRF_TRUSTED_ORIGINS = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "https://civic-track-phi.vercel.app",
]


# =====================================================
# Database (Local / Docker)
# =====================================================
DATABASES = {
    "default": {
        "ENGINE": "django.db.backends.postgresql",
        "NAME": os.getenv("DB_NAME"),
        "USER": os.getenv("DB_USER"),
        "PASSWORD": os.getenv("DB_PASSWORD"),
        "HOST": os.getenv("DB_HOST", "localhost"),
        "PORT": os.getenv("DB_PORT", "5432"),
    }
}
