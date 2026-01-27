"""
Production settings
"""

from .base import *
import os
import dj_database_url

DEBUG = False

ALLOWED_HOSTS = [
    "civic-track-v2k5.onrender.com",
    ".onrender.com",
]

VERCEL_FRONTEND_URL = "https://civic-track-phi.vercel.app"
RENDER_BACKEND_URL = "https://civic-track-v2k5.onrender.com"

# ---------------- CORS ----------------
CORS_ALLOWED_ORIGINS = [
    VERCEL_FRONTEND_URL,
]

CORS_ALLOW_CREDENTIALS = True

CSRF_TRUSTED_ORIGINS = [
    VERCEL_FRONTEND_URL,
    RENDER_BACKEND_URL,
]

# ---------------- Database ----------------
DATABASE_URL = os.getenv("DATABASE_URL")
if not DATABASE_URL:
    raise RuntimeError("DATABASE_URL is not set")

DATABASES = {
    "default": dj_database_url.parse(
        DATABASE_URL,
        conn_max_age=600,
        ssl_require=False,
    )
}

# ---------------- Security ----------------
SECURE_PROXY_SSL_HEADER = ("HTTP_X_FORWARDED_PROTO", "https")
SECURE_SSL_REDIRECT = True

SESSION_COOKIE_SECURE = True
CSRF_COOKIE_SECURE = True

# ---------------- Static ----------------
STATIC_ROOT = BASE_DIR / "staticfiles"
