from celery.task import Task
from celery.registry import tasks
from kordir.common import Utility
from django.conf import settings

class SlideFileDecompressTask(Task):
    def run(self, location, ext, service_id):
        self.slide_file_decompress(location, ext, service_id)
        return True
    
    def slide_file_decompress(self, location, ext, service_id):
        service_id = str(service_id)
        import subprocess
        import os
        from wand.image import Image
        from filemanager import FileManager
        success = True
        try:
            if ext.lower() == '.ppt' or ext.lower() == '.pptx':
                ppt = location + '.' + 'ppt'
                os.rename(location, ppt)
                cmd = 'unoconv -f pdf ' + ppt
                subprocess.call(cmd, shell=True)
                os.rename(location + '.pdf', location)
                os.remove(ppt)
            
            with Image(filename = location) as img:
                img.save(filename = location + '.jpg')
                imagesize = img.size
                name = location.split('/').pop()
                
                if len(img.sequence) > 1:
                    images = [name + '-{0.index}.jpg'.format(x) for x in img.sequence]
                else:
                    images = [name + '.jpg']
                    
                if len(img.sequence) > 1:
                    keyimages = [name + '-{0.index}'.format(x) + '_' + str(imagesize[0]) + '_' + str(imagesize[1]) + '.jpg' for x in img.sequence]
                else:
                    keyimages = [name + '-0_' + str(imagesize[0]) + '_' + str(imagesize[1]) +  '.jpg']
            
                print 'keyimages: ' + str(keyimages) + ' images: ' + str(images)
                
        except Exception as e:
            success = False
            keyimages = []
            imagesize = (0, 0)
            print e
 
        msg = {}
        msg['type'] = 'slideprocess-done'
        msg['data'] = {}
        msg['data']['slidePicture'] = keyimages
        msg['data']['serviceId'] = service_id
        msg['data']['slidePictureSize'] = imagesize
        if success == True:
            msg['data']['status'] = 'success'
        else:
            msg['data']['status'] = 'fail'
        url = settings.NODE_SERVER + '/relaytodashboard'
        Utility().send_http_request(url, msg)
        
        if success:
            suffix = '/'.join(location.split('/')[:-1])
            for idx, i in enumerate(images):
                path = suffix + '/' + i
                key = settings.FILE_LOCATION["PAGE_PICTURE"] + service_id + '/' + keyimages[idx]
                FileManager().put_file_to_s3_using_boto(path, key, True)
                      
        os.remove(location)      
        return True

tasks.register(SlideFileDecompressTask)    