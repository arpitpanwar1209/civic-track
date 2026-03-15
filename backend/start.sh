#!/usr/bin/env bash

set -o errexit
set -o pipefail
set -o nounset

echo "Starting CivicTrack services..."

# ===============================
# Start Celery Worker
# ===============================
echo "Starting Celery Worker..."
celery -A config worker \
  --loglevel=info \
  --concurrency=2 \
  --without-gossip \
  --without-mingle \
  --without-heartbeat &

CELERY_PID=$!

echo "Celery started with PID $CELERY_PID"

# ===============================
# Start Gunicorn
# ===============================
echo "Starting Gunicorn..."

exec gunicorn config.wsgi:application \
    --bind 0.0.0.0:${PORT:-8000} \
    --workers 3 \
    --timeout 120 \
    --log-level info