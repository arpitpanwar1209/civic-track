"""
Development settings
"""

from .base import *
from dotenv import load_dotenv

load_dotenv(BASE_DIR / ".env.development")

DEBUG = True

ALLOWED_HOSTS = ["localhost", "127.0.0.1"]

# ---------------- CORS ----------------
CORS_ALLOWED_ORIGINS = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
]

CORS_ALLOW_CREDENTIALS = True
CORS_ALLOW_HEADERS = ["*"]
CORS_ALLOW_METHODS = ["*"]

CSRF_TRUSTED_ORIGINS = [
    "http://localhost:3000",
]

# ---------------- Database (Local / Docker) ----------------
DATABASES = {
    "default": {
        "ENGINE": "django.db.backends.postgresql",
        "NAME": os.getenv("POSTGRES_DB", "civictrack"),
        "USER": os.getenv("POSTGRES_USER", "postgres"),
        "PASSWORD": os.getenv("POSTGRES_PASSWORD", "postgres"),
        "HOST": os.getenv("POSTGRES_HOST", "localhost"),
        "PORT": os.getenv("POSTGRES_PORT", "5432"),
    }
}
