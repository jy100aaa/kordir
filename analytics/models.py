from django.db import models
from django.utils.timezone import now
from kordir.constants import *

# Create your models here.
class ServiceUserConnectionLog(models.Model):
    service_id = models.IntegerField(default = 0, db_index = True)
    ip_address = models.BigIntegerField(default = 0)
    page = models.CharField(max_length = 20, default = '')
    country_code = models.CharField(max_length = 3, default = '')
    city = models.CharField(max_length = 30, default = '')
    timestamp = models.DateTimeField(default = now, db_index = True)
    device_type = models.CharField(max_length = 1, default = '')
    ref = models.CharField(max_length = 30, default = '')
    keyword = models.CharField(max_length = 30, default = '')
    new_visitor = models.BooleanField(default = True)
    
    def get_user_connection_log(self, service_id, start, end):    
        log = ServiceUserConnectionLog.objects.filter(service_id = service_id, timestamp__gte = start, timestamp__lte = end)
        return log
    
class ServiceUserConnectionDuration(models.Model):
    service_id = models.IntegerField(default = 0, db_index = True)
    duration = models.IntegerField(default = 0)
    timestamp = models.DateTimeField(default = now, db_index = True)

    def get_user_connection_duration_log(self, service_id, start, end):
        duration_log = ServiceUserConnectionDuration.objects.filter(service_id = service_id, timestamp__gte = start, timestamp__lte = end)
        return duration_log
