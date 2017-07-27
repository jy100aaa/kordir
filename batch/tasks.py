from celery.task import Task
from celery.registry import tasks
from batchmanager import BatchManager

class BatchTask(Task):
    def run(self):
        BatchManager().clean_s3_service()
        return True

tasks.register(BatchTask)
