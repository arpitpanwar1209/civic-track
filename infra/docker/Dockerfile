# ======================================================
# Base Image
# ======================================================
FROM python:3.11-slim

# ======================================================
# Environment Variables
# ======================================================
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

# ======================================================
# System Dependencies
# ======================================================
RUN apt-get update && apt-get install -y \
    build-essential \
    libpq-dev \
    curl \
    && rm -rf /var/lib/apt/lists/*

# ======================================================
# Create Non-Root User
# ======================================================
RUN adduser --disabled-password --gecos "" appuser

# ======================================================
# Set Work Directory
# ======================================================
WORKDIR /app

# ======================================================
# Install Python Dependencies
# ======================================================
COPY backend/requirements.txt .

RUN pip install --upgrade pip && \
    pip install --no-cache-dir -r requirements.txt

# ======================================================
# Copy Backend Code
# ======================================================
COPY backend /app

# ======================================================
# Copy Gunicorn Entrypoint
# ======================================================
COPY backend/gunicorn.sh /gunicorn.sh

# ======================================================
# Fix Permissions
# ======================================================
RUN chmod +x /gunicorn.sh && \
    chmod +x /app/start.sh

RUN chown -R appuser:appuser /app /gunicorn.sh

# ======================================================
# Switch to Non-Root User
# ======================================================
USER appuser

# ======================================================
# Expose Port
# ======================================================
EXPOSE 8000

# ======================================================
# Start Container
# ======================================================
CMD ["/gunicorn.sh"]