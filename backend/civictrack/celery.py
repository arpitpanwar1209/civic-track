import os
from celery import Celery

# Set default Django settings module
os.environ.setdefault(
    "DJANGO_SETTINGS_MODULE",
    os.getenv("DJANGO_SETTINGS_MODULE", "civictrack.settings.prod")
)

# Create Celery app
app = Celery("civictrack")

# Load Celery settings from Django settings
app.config_from_object("django.conf:settings", namespace="CELERY")

# Auto-discover tasks from installed apps
app.autodiscover_tasks()