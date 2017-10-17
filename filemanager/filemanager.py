from django.conf import settings
from django.http import HttpResponse, HttpResponseServerError
from kordir.common import Utility
from tasks import SlideFileDecompressTask
from shutil import copyfile
from PIL import Image, ImageDraw, ImageFont
import magic
import os
import random, string

class FileManager:
    def __init__(self):
        pass
    def file_upload(self, request):
        additional_msg = {}
        try:
            file_type = request.POST['file_type']
            additional_msg['file_type'] = file_type
            uuid = request.POST['uuid']
            id = request.POST['id']
            test = settings.FILE_LOCATION[file_type]
        except KeyError:
            json_res = Utility().compose_json_serialize_response('error', 'invalid request', additional_msg)
            return HttpResponse(json_res)

        ### FILE WRITE
        file = request.FILES.getlist('file')
        file_path = []
        file_extension = []
        filename = []

        if len(file) == 0:
            json_res = Utility().compose_json_serialize_response('error', 'emtpy file', additional_msg)
            return HttpResponse(json_res)

        try:
            for f in file:
                try:
                    ext = '.' + f.name.split('.')[-1].lower()
                except Exception as e:
                    ext = ''
                path = settings.FILE_LOCATION_WORKING_PREFIX + settings.FILE_LOCATION[file_type] + id + '_' + Utility().generate_random_string(10)
                fd = open(path, 'wd+')
                for chunk in f.chunks():
                    fd.write(chunk)
                fd.close()
                file_path.append(path)
                if file_type == "FAVICON":
                    file_extension.append('.ico')
                else:
                    file_extension.append(ext)
        except Exception as e:
            json_res = Utility().compose_json_serialize_response('error', 'unknown filetype', additional_msg)
            return HttpResponse(json_res)

        ### FILE PROCESSING

        ###  IMAGES
        if (file_type == "PAGE_PICTURE" or
            file_type == "PRODUCT_GALLERY_PICTURE" or
            file_type == "BOARD_PICTURE" or
            file_type == "USER_PICTURE" or
            file_type == "SERVICE_LOGO" or
            file_type == "BACKGROUND" or
            file_type == "FAVICON"):

            for idx, path in enumerate(file_path):
                ext = file_extension[idx]
                w, h = self.processing_picture_image(path, path + ext, file_type)
                if w == 0:
                    json_res = Utility().compose_json_serialize_response('error', 'unknown filetype', additional_msg)
                    return HttpResponse(json_res)
                new_name = Utility().generate_random_string(10) + '_' + str(w) + '_' + str(h) + ext
                thumb_key = ''
                if file_type == "PRODUCT_GALLERY_PICTURE" or file_type == "BOARD_PICTURE":
                    tag = request.POST['tag']
                    key = settings.FILE_LOCATION[file_type] + id + tag + '/' + new_name
                    thumb_key = settings.FILE_LOCATION[file_type] + id + tag + '/' + new_name.replace(ext, '_thumbnail' + ext)
                elif file_type == "USER_PICTURE" or file_type == "SERVICE_LOGO":
                    key = settings.FILE_LOCATION[file_type] + '/' + new_name
                else:
                    key = settings.FILE_LOCATION[file_type] + id + '/' + new_name


                if thumb_key != '':
                    self.put_file_to_s3_using_boto(path + '_thumbnail' + ext, thumb_key, True)

                if file_type == "FAVICON":
                    new_name = Utility().generate_random_string(10)
                    png_key = settings.FILE_LOCATION[file_type] + id + '/' + new_name + '.png'
                    ico_key = settings.FILE_LOCATION[file_type] + id + '/' + new_name + '.ico'
                    self.put_file_to_s3_using_boto(path + '.png', png_key, True)
                    self.put_file_to_s3_using_boto(path + '.ico', ico_key, True)
                else:
                    self.put_file_to_s3_using_boto(path + ext, key, True)

                filename.append(new_name)

        ### IMAGE DONE

        ### MISC
        if file_type == "BOARD_ATTACHMENT" or file_type == "PAGE_HTML":
            name = request.POST['filename']
            key = settings.FILE_LOCATION[file_type] + id + '/' + name
            if file_type == "BOARD_ATTACHMENT":
                tag = request.POST['tag']
                key = settings.FILE_LOCATION[file_type] + id + tag + '/' + name
            self.put_file_to_s3_using_boto(file_path[0], key, True)
            filename.append(name)

        if file_type == "PAGE_SLIDE":
            name = request.POST['filename']
            print 'file_path: ' + file_path[0] + ' ext: ' + file_extension[0]
            SlideFileDecompressTask.delay(file_path[0], file_extension[0], id)
            filename.append(name)
        ### MISC DONE
        additional_msg['filename'] = filename
        additional_msg['location'] = settings.S3_ADDRESS + key

        json_res = Utility().compose_json_serialize_response('ok', 'none', additional_msg)
        return HttpResponse(json_res)

    def processing_picture_image(self, src, dest, type):
        if os.path.exists(dest):
            os.remove(dest)

        img = Image.open(src)
        isanimated = False
        try:
            img.seek(1)
        except EOFError:
            isanimated = False
        else:
            isanimated = True

        transparent = False
        try:
            red, green, blue, alpha = img.split()
            transparent = True
        except Exception as e:
            pass

        longer = 0
        width, height = img.size

        if type == "BOARD_PICTURE" or type == "PAGE_PICTURE" or type == "PRODUCT_GALLERY_PICTURE":
            if width > 1600:
                img = img.resize((1600, height*1600/width), Image.ANTIALIAS)
            if isanimated:
                copyfile(src, dest)
            else:
                img.save(dest, quality=80)
            if not type == "PAGE_PICTURE":
                ext = dest.split('.')[-1]
                dest_thumb = dest.replace('.' + ext, '_thumbnail.' + ext)
                img_thumb = img.resize((400, height*400/width), Image.ANTIALIAS)
                img_thumb.save(dest_thumb, quality=80)

        if type == "BACKGROUND":
            if width > 1920:
                img = img.resize((1920, height*1920/width), Image.ANTIALIAS)
            img.save(dest, quality=70)

        if type == "FAVICON":
            from wand.image import Image as WandImage
            try:
                ico_name = dest.split('.')[0] + '.ico'
                png_name = dest.split('.')[0] + '.png'
                # ico
                with WandImage(filename = src) as img:
                    img.resize(32, 32)
                    img.save(filename = ico_name)
                # png
                with WandImage(filename = src) as img:
                    img.resize(192, 192)
                    img.save(filename = png_name)

            except Exception as e:
                print e
                return (0, 0)

        if type == "SERVICE_LOGO" or type == "USER_PICTURE":
            if width > 320:
                img = img.resize((600, height*600/width), Image.ANTIALIAS)

        if type == "SERVICE_LOGO":
            width, height = img.size
            if height > 128:
                img = img.resize((width*128/height, 128), Image.ANTIALIAS)
            img.save(dest)
        if type == "USER_PICTURE":
            width, height = img.size
            if width != height:
                if width > height:
                    x1 = (width - height) / 2
                    x2 = x1 + height
                    y1 = 0
                    y2 = height
                else:
                    x1 = 0
                    x2 = width
                    y1 = (height-  width) / 2
                    y2 = y1 + width
                img.crop((x1,y1,x2,y2)).save(dest)
            else:
                img.save(dest)

        if os.path.exists(src):
            os.remove(src)

        img_dest = Image.open(dest)
        return img_dest.size

    def put_file_to_s3_using_boto(self, src, key, remove):
        import boto
        from boto.s3.key import Key
        ext = key.split('.')[-1]
        print 'put_file_to_s3_using_boto'
        print 'key: ' + key + ' src: ' + src
        try:
            os.environ['S3_USE_SIGV4'] = 'True'
            conn = boto.connect_s3(settings.AWS_ACCESS_KEY_ID, settings.AWS_SECRET_ACCESS_KEY, host=settings.S3_REGION)
            bucket = conn.get_bucket(settings.S3_USER_DATA_BUCKET)
            k = bucket.new_key(key)
            k.size = os.stat(src).st_size
            header = {}
            if ext == 'ico':
                header['Content-Type'] = 'image/x-icon'
            k.set_contents_from_filename(src, header)
            k.set_acl('public-read')

            if os.path.exists(src) and remove == True:
                os.remove(src)
        except Exception, e:
            print str(e)
            print 'put_file_to_s3_using_boto error'
            return False;

        return True

    def generate_captcha(self, unique_key):
        FONT_FILE = settings.CAPTCHA_FONT_LOCATION
        PATH = settings.FILE_LOCATION_WORKING_PREFIX + settings.FILE_LOCATION["CAPTCHA"] + unique_key + '.jpg'
        KEY =  settings.FILE_LOCATION["CAPTCHA"] + unique_key + '.jpg'
        R = 112
        G = 128
        B = 144
        LENGTH = 5
        WIDTH = 100
        HEIGHT = 30
        POOL = '1234567890'
        FONT_SIZE = 35
        im = Image.new("RGB", (WIDTH, HEIGHT), (R, G, B))
        draw = ImageDraw.Draw(im)
        font = ImageFont.truetype(FONT_FILE, FONT_SIZE, encoding='unic')
        value = ''.join(random.sample(POOL, LENGTH))
        draw.text((5, 1), value, font=font)
        print 'path: ' + PATH
        im.save(PATH, "JPEG")
        self.put_file_to_s3_using_boto(PATH, KEY, True)
        return value