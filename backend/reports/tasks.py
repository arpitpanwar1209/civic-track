from celery import shared_task
import time

@shared_task
def test_task():
    time.sleep(3)
    return "Celery is working"
