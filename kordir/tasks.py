from celery.decorators import task
from celery.task import Task
from celery.registry import tasks
import json, datetime, time

@task(name="kordir.tasks.notify_remaining_days")
def notify_remaining_days():
    'print test'
    return
