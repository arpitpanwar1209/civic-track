import os
from celery import Celery

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "civictrack.settings.prod")

app = Celery("civictrack")

app.config_from_object("django.conf:settings", namespace="CELERY")

app.autodiscover_tasks()

