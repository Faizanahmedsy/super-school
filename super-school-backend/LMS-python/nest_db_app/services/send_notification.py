from asgiref.sync import async_to_sync
from LMS.asgi import sio
from celery import shared_task


def send_notification(school_id,async_mode=False):
    """
    Generic function to send notifications via WebSocket.

    Parameters:
    - message (str): The notification message to send.
    - user_id (str, optional): Send notification to a specific user (if provided).
    - async_mode (bool, default=False): If True, uses Celery to send the notification asynchronously.
    """
    if async_mode:
        send_notification_task.delay(school_id)  # Call Celery task
    else:
        _send_notification(school_id)  # Call directly from view


@shared_task
def send_notification_task(school_id):
    """Celery task to send notifications asynchronously."""
    _send_notification(school_id)


def _send_notification(school_id):
        async_to_sync(sio.emit)("notification_test", {"school_id": school_id})