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
RUN adduser --disabled-password --no-create-home appuser

# ======================================================
# Set Work Directory
# ======================================================
WORKDIR /app

# ======================================================
# Install Python Dependencies
# ======================================================
COPY requirements/ ./requirements/

RUN pip install --upgrade pip && \
    pip install --no-cache-dir -r requirements/production.txt

# ======================================================
# Copy Backend Code
# ======================================================
COPY . .

# ======================================================
# Gunicorn Entrypoint
# ======================================================
COPY entrypoints/gunicorn.sh /gunicorn.sh
RUN chmod +x /gunicorn.sh

# ======================================================
# Set Permissions
# ======================================================
RUN chown -R appuser:appuser /app /gunicorn.sh

# ======================================================
# Switch to Non-Root User
# ======================================================
USER appuser

# ======================================================
# Expose Port (Render injects $PORT)
# ======================================================
EXPOSE 8000

# ======================================================
# Default Command (Web Service)
# ======================================================
CMD ["/gunicorn.sh"]
