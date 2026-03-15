#!/bin/sh
set -e

: "${PORT:=8000}"

echo "Starting Celery worker..."
celery -A civictrack worker --loglevel=info &

echo "Starting Gunicorn..."
exec gunicorn civictrack.wsgi:application \
  --bind 0.0.0.0:${PORT} \
  --workers 3 \
  --threads 2 \
  --timeout 120