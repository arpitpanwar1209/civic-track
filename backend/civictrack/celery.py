import os
import django
from celery import Celery

# Use environment settings
os.environ.setdefault(
    "DJANGO_SETTINGS_MODULE",
    os.getenv("DJANGO_SETTINGS_MODULE", "civictrack.settings.prod")
)

django.setup()

app = Celery("civictrack")

# Load settings from Django
app.config_from_object(
    "django.conf:settings",
    namespace="CELERY"
)

# Auto discover tasks from apps
app.autodiscover_tasks()