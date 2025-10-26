"""
Django settings for civictrack project (Deployment Ready)
"""

from pathlib import Path
from datetime import timedelta
import os
import dj_database_url

# --- BASE SETTINGS ---
BASE_DIR = Path(__file__).resolve().parent.parent

# --- SECURITY & HOSTS (FOR RENDER + VERCEL) ---

# Secret key is read from the environment variable 'DJANGO_SECRET_KEY'
SECRET_KEY = os.environ.get('DJANGO_SECRET_KEY', 'django-insecure-7iwuu^)nr@1jih2)(wt(xkb!q%bm#gw)$3lkndu&2xd7xh12dz')

# DEBUG is False by default, or True if 'DJANGO_DEBUG' is set to 'true'
DEBUG = os.environ.get('DJANGO_DEBUG', 'False').lower() == 'true'

# --- SECURITY & HOSTS (FOR RENDER + VERCEL) ---

# Your Vercel frontend URL (no slash at the end)
VERCEL_FRONTEND_URL = "https://civic-track-phi.vercel.app"

# Your Render backend URL
RENDER_BACKEND_URL = "https://civic-track-v2k5.onrender.com"

ALLOWED_HOSTS = [
    "civic-track-v2k5.onrender.com",  # Your Render backend
    "civic-track-phi.vercel.app",   # Your Vercel frontend
    "localhost",
    "127.0.0.1",
]

CORS_ALLOWED_ORIGINS = [
    VERCEL_FRONTEND_URL,
    "http://localhost:3000",        # For local React dev
    "http://127.0.0.1:3000",
]

CSRF_TRUSTED_ORIGINS = [
    RENDER_BACKEND_URL,
    VERCEL_FRONTEND_URL,
    "http://localhost:3000",
    "http://127.0.0.1:3000",
]

CORS_ALLOW_CREDENTIALS = True
# --- APPLICATIONS ---
INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',

    # Local apps
    'accounts',
    'moderation',
    'reports',
    'ml_api',
    'ml',

    # Third-party
    'rest_framework',
    'rest_framework_simplejwt',
    'corsheaders',
]

# --- MIDDLEWARE ---
MIDDLEWARE = [
    'django.middleware.security.SecurityMiddleware',
    "corsheaders.middleware.CorsMiddleware",        # CORS must be high up
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]

# --- URL / WSGI ---
ROOT_URLCONF = 'civictrack.urls'
WSGI_APPLICATION = 'civictrack.wsgi.application'

# --- TEMPLATES ---
TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [BASE_DIR / 'civictrack' / 'theme' / 'templates'],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]

# --- DATABASE CONFIGURATION ---
# Default to a local PostgreSQL database
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.postgresql',
        'NAME': os.environ.get('POSTGRES_DB', 'civictrack'),
        'USER': os.environ.get('POSTGRES_USER', 'arpit'),
        'PASSWORD': os.environ.get('POSTGRES_PASSWORD', 'Gurjar@1209'),
        'HOST': os.environ.get('POSTGRES_HOST', 'localhost'),
        'PORT': os.environ.get('POSTGRES_PORT', '5432'),
    }
}

# Check for the 'DATABASE_URL' environment variable (used by Render)
# This will override the local settings above if the variable exists
db_from_env = dj_database_url.config(
    default=None, # Do not use a default, only use if var exists
    conn_max_age=600,
    ssl_require=not DEBUG # Require SSL when not in DEBUG mode
)
if db_from_env:
    DATABASES['default'].update(db_from_env)

# --- PASSWORD VALIDATORS ---
AUTH_PASSWORD_VALIDATORS = [
    {'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator'},
    {'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator'},
    {'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator'},
    {'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator'},
]

# --- JWT / REST FRAMEWORK ---
REST_FRAMEWORK = {
    "DEFAULT_AUTHENTICATION_CLASSES": (
        "rest_framework_simplejwt.authentication.JWTAuthentication",
    ),
    "EXCEPTION_HANDLER": "rest_framework.views.exception_handler",
}

SIMPLE_JWT = {
    "ACCESS_TOKEN_LIFETIME": timedelta(minutes=30),
    "REFRESH_TOKEN_LIFETIME": timedelta(days=7),
    "ROTATE_REFRESH_TOKENS": True,
    "BLACKLIST_AFTER_ROTATION": True,
    "AUTH_HEADER_TYPES": ("Bearer",),
}

# --- INTERNATIONALIZATION ---
LANGUAGE_CODE = 'en-us'
TIME_ZONE = 'UTC'
USE_I18N = True
USE_TZ = True

# --- STATIC & MEDIA ---
STATIC_URL = '/static/'
STATICFILES_DIRS = [BASE_DIR / 'static']
STATIC_ROOT = BASE_DIR / 'staticfiles' # For Render's 'collectstatic'

MEDIA_URL = '/media/'
MEDIA_ROOT = BASE_DIR / 'media'

# --- CUSTOM USER ---
AUTH_USER_MODEL = 'accounts.CustomUser'

# --- REDIRECTS ---
LOGIN_REDIRECT_URL = 'accounts/dashboard'
LOGOUT_REDIRECT_URL = 'home'

# --- SECURITY (Production) ---
# These settings apply when DEBUG is False
if not DEBUG:
    SECURE_HSTS_SECONDS = 31536000
    SECURE_HSTS_INCLUDE_SUBDOMAINS = True
    SECURE_SSL_REDIRECT = True
    SESSION_COOKIE_SECURE = True
    CSRF_COOKIE_SECURE = True
    SECURE_BROWSER_XSS_FILTER = True
    SECURE_CONTENT_TYPE_NOSNIFF = True

# --- TAILWIND / INTERNAL ---
TAILWIND_APP_NAME = 'theme'
INTERNAL_IPS = ["127.0.0.1"]