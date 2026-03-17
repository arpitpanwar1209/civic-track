"""
Production settings for civictrack
"""

from .base import *
import os
import dj_database_url


# =====================================================
# Core
# =====================================================
DEBUG = False


# =====================================================
# Hosts
# =====================================================
ALLOWED_HOSTS = [
    ".onrender.com",
]


# =====================================================
# Frontend URL
# =====================================================
VERCEL_FRONTEND_URL = "https://civic-track-phi.vercel.app"


# =====================================================
# CORS
# =====================================================
CORS_ALLOWED_ORIGINS = [
    VERCEL_FRONTEND_URL,
]

CORS_ALLOW_CREDENTIALS = True


# =====================================================
# CSRF
# =====================================================
CSRF_TRUSTED_ORIGINS = [
    VERCEL_FRONTEND_URL,
]


# =====================================================
# Database
# =====================================================
DATABASE_URL = os.environ.get("DATABASE_URL")

if not DATABASE_URL:
    raise RuntimeError("DATABASE_URL is not set")

DATABASES = {
    "default": dj_database_url.config(
        default=DATABASE_URL,
        conn_max_age=600,
        ssl_require=True,
    )
}


# =====================================================
# Security
# =====================================================
SECURE_PROXY_SSL_HEADER = ("HTTP_X_FORWARDED_PROTO", "https")

SECURE_SSL_REDIRECT = True

SESSION_COOKIE_SECURE = True
CSRF_COOKIE_SECURE = True

SECURE_BROWSER_XSS_FILTER = True
SECURE_CONTENT_TYPE_NOSNIFF = True
X_FRAME_OPTIONS = "DENY"

SECURE_HSTS_SECONDS = 31536000
SECURE_HSTS_INCLUDE_SUBDOMAINS = True
SECURE_HSTS_PRELOAD = True


# =====================================================
# Static Files
# =====================================================
STATIC_ROOT = BASE_DIR / "staticfiles"


# =====================================================
# WhiteNoise
# =====================================================
MIDDLEWARE = [
    "django.middleware.security.SecurityMiddleware",
    "whitenoise.middleware.WhiteNoiseMiddleware",
] + MIDDLEWARE

STATICFILES_STORAGE = "whitenoise.storage.CompressedManifestStaticFilesStorage"