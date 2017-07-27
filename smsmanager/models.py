from django.db import models
from django.utils.timezone import now
from kordir.constants import *
from django.core.paginator import Paginator


class SmsRecord(models.Model):
    service_id = models.IntegerField(default = 0)
    user_id = models.IntegerField(default = 0)
    mobile = models.CharField(max_length = 12, default = '')
    ip_address = models.BigIntegerField(default = 0)
    type = models.CharField(max_length = 10, default = '')
    msg = models.CharField(max_length = 128, default = '')
    created =  models.DateTimeField(default = now)

    def add_record(self, service_id, user_id, mobile, ip, type, msg):
        service_id = int(service_id)
        user_id = int(user_id)
        new_record = SmsRecord(
                          service_id = service_id,
                          user_id = user_id,
                          mobile = mobile,
                          ip_address = ip,
                          type = type,
                          msg = msg
                               )
        new_record.save()

    def get_paginator(self, service_id, items_per_page):
        return Paginator(SmsRecord.objects.filter(service_id = service_id).order_by('-id'), items_per_page)
