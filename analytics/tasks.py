from celery.task import Task
from celery.registry import tasks
from analyticsmanager import AnalyticsManager

class MarkServiceUserConnectionLogTask(Task):
    def run(self, service_id, page, ip_address, device_type, ref, keyword, new_visitor):
        analytics_manager = AnalyticsManager()
        analytics_manager.mark_service_user_connection_log(service_id, page, ip_address, device_type, ref, keyword, new_visitor)
        return True

tasks.register(MarkServiceUserConnectionLogTask)