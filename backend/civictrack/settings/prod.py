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
    "civic-track-v2k5.onrender.com",
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
# Database (Neon / Render)
# =====================================================
DATABASE_URL = os.getenv("DATABASE_URL")

if not DATABASE_URL:
    raise RuntimeError("DATABASE_URL is not set")

DATABASES = {
    "default": dj_database_url.parse(
        DATABASE_URL,
        conn_max_age=600,
        ssl_require=True,
    )
}


# =====================================================
# Security (Render HTTPS)
# =====================================================
SECURE_PROXY_SSL_HEADER = ("HTTP_X_FORWARDED_PROTO", "https")
SECURE_SSL_REDIRECT = True

SESSION_COOKIE_SECURE = True
CSRF_COOKIE_SECURE = True

SECURE_BROWSER_XSS_FILTER = True
SECURE_CONTENT_TYPE_NOSNIFF = True
X_FRAME_OPTIONS = "DENY"


# =====================================================
# Static files
# =====================================================
STATIC_ROOT = BASE_DIR / "staticfiles"
