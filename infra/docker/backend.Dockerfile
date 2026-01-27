# -------------------------------
# Base image
# -------------------------------
FROM python:3.11-slim

# -------------------------------
# Environment
# -------------------------------
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

# -------------------------------
# System dependencies
# -------------------------------
RUN apt-get update && apt-get install -y \
    build-essential \
    libpq-dev \
    curl \
    && rm -rf /var/lib/apt/lists/*

# -------------------------------
# Create non-root user
# -------------------------------
RUN adduser --disabled-password --no-create-home appuser

# -------------------------------
# Work directory
# -------------------------------
WORKDIR /app

# -------------------------------
# Install Python dependencies
# -------------------------------
COPY requirements/ /app/requirements/

RUN pip install --upgrade pip && \
    pip install -r requirements/base.txt

# -------------------------------
# Copy application code
# -------------------------------
COPY . /app

# -------------------------------
# Gunicorn entrypoint
# -------------------------------
COPY entrypoints/gunicorn.sh /gunicorn.sh
RUN chmod +x /gunicorn.sh && chown appuser /gunicorn.sh

# -------------------------------
# Permissions
# -------------------------------
RUN chown -R appuser:appuser /app

# -------------------------------
# Switch user
# -------------------------------
USER appuser

# -------------------------------
# Expose port
# -------------------------------
EXPOSE 8000

# -------------------------------
# Default command
# -------------------------------
CMD ["/gunicorn.sh"]
