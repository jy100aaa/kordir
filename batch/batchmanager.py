from kordir.models import Service
from django.conf import settings
import boto
from boto.s3.key import Key

class BatchManager:
    def __init__(self):
        pass

    def clean_s3_service(self):
        print "clean s3 service"
        expired_service_ids = Service().get_expired_service_ids()
        if not expired_service_ids:
            return False
        prefixes = []
        for l in settings.FILE_LOCATION:
            p = settings.FILE_LOCATION[l][1:]
            if 'service/' in p:
                for id in expired_service_ids:
                    prefixes.append(p + str(id) + '/')
        try:
            conn = boto.connect_s3(settings.AWS_ACCESS_KEY_ID, settings.AWS_SECRET_ACCESS_KEY)
            bucket = conn.get_bucket(settings.S3_USER_DATA_BUCKET)
        except Exception, e:
            return False

        for p in prefixes:
            for key in bucket.list(prefix=p):
                key.delete()

        return True
