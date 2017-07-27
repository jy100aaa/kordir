from django.db import models
from kordir.common import Utility
from django.core.paginator import Paginator
from django.utils.timezone import now
import pytz
from analytics.models import ServiceUserConnectionLog, ServiceUserConnectionDuration
from kordir.constants import *
from django.conf import settings
from cachemanager.cachemanager import UserConnectionManager
import datetime
from django.utils.safestring import mark_safe
import json

# Create your models here.
class Service(models.Model):
    name = models.CharField(max_length=50, default='')
    tag = models.CharField(max_length=24, default='')
    domain = models.CharField(max_length=256, default='')
    website = models.CharField(max_length=256, default='')
    category = models.CharField(max_length=10, default='')
    location_main = models.CharField(max_length=10, default='')
    location_sub = models.CharField(max_length=10, default='')
    telephone = models.CharField(max_length=30, default='')
    picture = models.CharField(max_length=128, default='default_service.jpg')
    description = models.TextField(default='')
    timestamp = models.DateTimeField(default=now)
    created = models.DateTimeField(default=now)
    valid = models.DateTimeField(default=now)
    paid = models.BooleanField(default=False)
    point = models.IntegerField(default=0)
    tree = models.TextField(default='')
    misc = models.TextField(default='')

    # many to many
    users = models.ManyToManyField('UserAccount', related_name='service_users')
    chatmessages = models.ManyToManyField('ChatMessage', related_name='service_chatmessages')
    askboards = models.ManyToManyField('AskBoard', related_name='service_askboards')
    normalboards = models.ManyToManyField('NormalBoard', related_name='service_normalboards')
    productboards = models.ManyToManyField('ProductBoard', related_name='service_productboards')
    pointrecords = models.ManyToManyField('PointRecord', related_name='service_pointrecords')
    requestboxes = models.ManyToManyField('RequestBox', related_name='service_requestboxes')
    keyvalues = models.ManyToManyField('KeyValue', related_name='service_keyvalues')

    def get_default_tree(self):
        try:
            tree_dict = Service.objects.values('tree').get(id = 5)
            tree = tree_dict['tree']
            return tree
        except Exception as e:
            tree = []
            tree.append(DEFAULT_NODE_HOME)
            tree = json.dumps(tree)
            return tree

    def is_changable_tag(self, tag, service_id):
        try:
            service = Service.objects.get(tag=tag)
            if service.id == service_id:
                return True
            else:
                return False
        except Service.DoesNotExist:
            return True

    def service_tag_exist(self, tag):
        if not Service.objects.filter(tag=tag):
            return False
        else:
            return True

    def get_service_by_domain_tag(self, tag):
        try:
            if "xn--" in tag:
                tag = tag.split('--')[1]
                tag = tag.decode('punycode')
            return Service.objects.get(tag=tag)
        except Service.DoesNotExist:
            return None

    def get_service_by_domain_name(self, domain):
        try:
            if "xn--" in domain:
                domain_array = domain.split('--')[1].split('.')
                punycode = domain_array[0].decode('punycode')
                domain_array[0] = punycode
                domain = u'.'.join(domain_array)
            service = Service.objects.get(domain=domain)
            return service
        except Exception as e:
            return None

    def get_service_by_id(self, id):
        try:
            return Service.objects.get(id=int(id))
        except Service.DoesNotExist:
            Service.DoesNotExist;
            return None

    def get_normalboard_paginator(self, items_per_page, service, tag):
        normalboards = service.normalboards.filter(tag=tag, deleted=False).order_by('-sticky', '-seq')
        return Paginator(normalboards, items_per_page)

    def get_askboard_paginator(self, items_per_page, service, filter, tag):
        if filter == ALL_INCLUDE_DELETED:
            askboards = service.askboards.filter(tag=tag).order_by('-sticky', '-seq')
        if filter == ALL_EXCLUDE_DELETED:
            askboards = service.askboards.filter(tag=tag, deleted=False).order_by('-sticky', '-seq')
        elif filter == ANSWERED:
            askboards = service.askboards.filter(tag=tag, answered=True).order_by('-sticky', '-seq')
        elif filter == NOT_ANSWERED:
            askboards = service.askboards.filter(tag=tag, answered=False).order_by('-sticky', '-seq')
        elif filter == DELETED:
            askboards = service.askboards.filter(tag=tag, deleted=True).order_by('-sticky', '-seq')
        return Paginator(askboards, items_per_page)

    def get_requestbox_paginator(self, service, items_per_page):
        return Paginator(service.requestboxes.order_by('-id'), items_per_page)

    def get_productboard_paginator(self, items_per_page, service, tag, label=[], value=[], range_label=[], min=[], max=[]):
        if len(label) == 0 and len(range_label) == 0:
            productboards = service.productboards.filter(tag=tag, deleted=False).order_by('-seq')
        else:
            product_id_list = ProductBoardLabelValuePair().get_productboard_id(service.id, tag, label, value, range_label, min, max)
            productboards = service.productboards.filter(id__in=product_id_list, deleted=False).order_by('-seq')

        return Paginator(productboards, items_per_page)

    def get_board_next_seq(self, service, tag, board_type):
        board = None
        if board_type == NORMAL_BOARD:
            board = service.normalboards
        elif board_type == ASK_BOARD:
            board = service.askboards
        elif board_type == PRODUCT_BOARD:
            board = service.productboards
        try:
            return board.filter(tag=tag).latest('seq').seq + 1
        except Exception as e:
            return 1

    def get_boarditem(self, service, tag, board_type, seq):
        boarditem = None
        try:
            if board_type == NORMAL_BOARD:
                boarditem = service.normalboards.filter(tag=tag, seq=seq)[0]
            elif board_type == ASK_BOARD:
                boarditem = service.askboards.filter(tag=tag, seq=seq)[0]
            elif board_type == PRODUCT_BOARD:
                boarditem = service.productboards.filter(tag=tag, seq=seq)[0]
        except Exception as e:
            return None
        if not boarditem:
            return None
        else:
            return boarditem

    def put_point_record(self, service, point, type):
        balance = service.point + point
        valid = service.valid
        if type == POINT_MINUS_EXTEND_USE:
            if balance < 0:
                return (balance, False)
            added_days = (point * -1) / POINT_REQUIRE_PER_DAY
            current_time = datetime.datetime.utcnow().replace(tzinfo = pytz.utc)
            if current_time < valid:
                valid = valid + datetime.timedelta(days=added_days)
            else:
                valid = current_time + datetime.timedelta(days=added_days)
            service.valid = valid

        service.point = balance
        point_record = PointRecord(
                                   service_id=service.id,
                                   balance=balance,
                                   point=point,
                                   type=type
                                   )
        point_record.save()
        service.pointrecords.add(point_record)
        service.save()
        return (balance, valid)

    def get_point_record_list(self, service):
        try:
            point_record = service.pointrecords.all().order_by('-id')
            return point_record
        except PointRecord.DoesNotExist:
            return None

    def reconstruct_misc(self, service):
        import xml.etree.ElementTree as ET

        misc = json.loads(service.misc)
        url_prefix = ''
        if service.domain == '':
            url_prefix = 'http://' + service.tag + '.' + settings.SIMPLE_MAIN_SERVER
        else:
            url_prefix = 'http://' + service.domain

        robots = 'sitemap: ' + url_prefix + '/sitemap.xml\n\n'
        robots += 'User-Agent: *\n'
        robots += 'Allow: /'

        ET.register_namespace('', 'http://www.sitemaps.org/schemas/sitemap/0.9')

        try:
            sitemap = ET.fromstring(misc['meta']['sitemap'])
        except Exception as e:
            sitemap = ET.fromstring(DEFAULT_SITEMAP)

        for url in sitemap.findall('url'):
            sitemap.remove(url)

        node_list = []
        Utility().put_node(json.loads(service.tree), node_list, ['page', 'board', 'chat', 'landing'])

        for node in node_list:
            url = ET.SubElement(sitemap, 'url')
            loc = ET.SubElement(url, 'loc')
            loc.text = url_prefix + node['url']

        xmlstr = ET.tostring(sitemap, encoding='utf8', method='xml')

        misc['meta']['sitemap'] = xmlstr
        misc['meta']['robots'] = robots

        service.misc = mark_safe(json.dumps(misc))
        service.save()

    def put_keyvalue(self, service_id, key, value):
        try:
            service = Service.objects.get(id=int(service_id))
        except Service.DoesNotExist:
            Service.DoesNotExist;
            return None
        keyvalue = KeyValue(service_id = service.id,
                            key = key,
                            value = value)
        keyvalue.save()
        service.keyvalues.add(keyvalue)
        service.save()
        user_info = []
        for u in service.users.all():
            user_info.append((u.email, u.telephone))
        return user_info

    def get_expired_service_ids(self):
        expired_service_ids = []
        t = datetime.datetime.now() - datetime.timedelta(days=90)
        date_of_expiry = str(t.year) + '-' + str(t.month) + '-' + str(t.day)
        sql_string = 'select id from kordir_service where valid < "' + date_of_expiry + '"'
        print sql_string
        service_objects = Service.objects.raw(sql_string)
        for service in service_objects:
            expired_service_ids.append(service.id)
        return expired_service_ids

class UserAccount(models.Model):
    fullname = models.CharField(max_length=64, default='')
    email = models.CharField(max_length=128, default='')
    telephone = models.CharField(max_length=30, default='')
    password = models.CharField(max_length=64, default='')
    picture = models.CharField(max_length=128, default='default_user.jpg')
    promotion = models.CharField(max_length = 10, default = '')
    device_android = models.CharField(max_length=256, default='')
    device_ios = models.CharField(max_length=256, default='')
    created = models.DateTimeField(default=now)
    timestamp = models.DateTimeField(default=now)
    lastsession = models.CharField(max_length=32, default='')

    # foreignkey
    service = models.ForeignKey(Service, null=True, blank=True)

    ## MTM
    services = models.ManyToManyField('Service', related_name='useraccount_services')

    # status
    connection_status = models.CharField(max_length=1, default=USER_CONNECTION_STATUS_OFFLINE)
    status = models.IntegerField(default=USER_STATUS_DEFAULT)
    notification = models.IntegerField(default=NOTIFICATION_ALLOW_DEFAULT)

    def is_changable_email(self, email, user_id):
        try:
            user = UserAccount.objects.get(email=email)
            if user_id == user.id:
                return True
            else:
                return False
        except UserAccount.DoesNotExist:
            return True

    def is_user(self, email):
        if not UserAccount.objects.filter(email=email):
            return False
        else:
            return True

    def get_password(self, email):
        try:
            user_info = UserAccount.objects.get(email=email)
            return user_info.password
        except UserAccount.DoesNotExist:
            return ''

    def get_last_session(self, email):
        try:
            user_info = UserAccount.objects.get(email=email)
            return user_info.lastsession
        except UserAccount.DoesNotExist:
            return ''

    def write_session_key(self, email, last_session_key):
        try:
            user = UserAccount.objects.get(email=email)
        except UserAccount.DoesNotExist:
            return False
        if user.lastsession != last_session_key:
            user.timestamp = now()
        user.lastsession = last_session_key
        user.connection_status = USER_CONNECTION_STATUS_ONLINE
        user.save()
        return True

    def get_useraccount(self, email='', last_session_key=''):
        if email == '':
            return None
        try:
            user = UserAccount.objects.get(email=email)
            if last_session_key == '':
                return user
            if user.lastsession != last_session_key:
                return None
            return user
        except UserAccount.DoesNotExist:
            return None

    def get_user_connection_status(self, user_id):
        user_id = int(user_id)
        try:
            user = UserAccount.objects.get(id=user_id)
        except UserAccount.DoesNotExist:
            return None
        return user.connection_status

    def set_user_connection_status(self, user_id, status):
        user_id = int(user_id)
        try:
            user = UserAccount.objects.get(id=user_id)
        except UserAccount.DoesNotExist:
            return False
        user.connection_status = status
        user.save()
        return True

class Operator(models.Model):
    # foreignkey
    user = models.ForeignKey(UserAccount, null=True, blank=True)
    ticket_count = models.IntegerField(default = 0)
    # many to many
    users = models.ManyToManyField('UserAccount', related_name='operator_users')

    def remove_operator(self, _user):
        try:
            operator = Operator.objects.get(user=_user)
            operator.users.all().delete()
            operator.delete()
        except Operator.DoesNotExist:
            return False

        return True

    def get_operator(self, _user):
        try:
            operator = Operator.objects.get(user=_user)
        except Operator.DoesNotExist:
            return False
        return operator

    def does_service_exist(self, operator, service_id):
        for u in operator.users.all():
            for s in u.services.all():
                if s.id == service_id:
                    return True

        return False

    def get_email_recipient(self, service_id):
        recipient = []
        service_id = int(service_id)
        found = False
        try:
            for o in Operator.objects.all():
                if found:
                    break
                for u in o.users.all():
                    if found:
                        break
                    for s in u.services.all():
                        if s.id == service_id:
                            operator = UserAccount.objects.get(id=o.user_id)
                            recipient.append(operator.email)
                            found = True
                            break
        except UserAccount.DoesNotExist:
            print 'UserAccount Does Not Exist'
            pass

        return recipient

class KeyValue(models.Model):
    service_id = models.IntegerField(default = 0)
    key = models.CharField(max_length = 32, default = '')
    value = models.TextField(default='')
    created = models.DateTimeField(default=now)

class ChatCounterpart(models.Model):
    unique_key = models.CharField(max_length=32, default='')
    returning = models.BooleanField(default=True)
    city = models.CharField(max_length=6, default='')
    device_type = models.CharField(max_length=1, default='')
    country_code = models.CharField(max_length=2, default='')
    page_view = models.IntegerField(default=1)
    name = models.CharField(max_length=32, default='')
    contact = models.CharField(max_length=64, default='')
    service = models.IntegerField(default=0)
    created = models.DateTimeField(default=now)

    def visitor_join(self, data):
        try:
            counterpart = ChatCounterpart.objects.get(unique_key=data['uniqueKey'], service=int(data['serviceId']))
            counterpart.page_view = data['pageViewNum']
            counterpart.save()
            return counterpart
        except ChatCounterpart.DoesNotExist:
            if data['ipInfo'] == None:
                city = ''
                country_code = ''
            else:
                try:
                    city = data['ipInfo']['city']
                    country_code = data['ipInfo']['countryCode']
                except KeyError:
                    city = ''
                    country_code = ''

            counterpart = ChatCounterpart(
                                          unique_key=data['uniqueKey'],
                                          returning=(not data['newVisitor']),
                                          device_type=data['deviceType'],
                                          city=city,
                                          country_code=country_code,
                                          page_view=data['pageViewNum'],
                                          service=int(data['serviceId']))

            counterpart.save()

            return counterpart

class ChatMessage(models.Model):
    msg = models.TextField(null=True, blank=True)
    created = models.DateTimeField(default=now)
    outgoing = models.BooleanField(default=True)
    user_id = models.IntegerField(default=0)
    service_id = models.IntegerField(default=0)
    counterpart_id = models.IntegerField(default=0)
    created = models.DateTimeField(default=now)

    def get_chatmessage(self, service_id, counterpart_id):
        return ChatMessage.objects.filter(service_id=service_id, counterpart_id=counterpart_id)

class ChatMessageDeleted(models.Model):
    msg = models.TextField(null=True, blank=True)
    created = models.DateTimeField(default=now)
    outgoing = models.BooleanField(default=True)
    user_id = models.IntegerField(default=0)
    service_id = models.IntegerField(default=0)
    counterpart_id = models.IntegerField(default=0)
    created = models.DateTimeField(default=now)

class AskBoard(models.Model):
    tag = models.CharField(max_length=16, default='')
    seq = models.IntegerField(default=0)
    service_id = models.IntegerField(default=0)
    open = models.BooleanField(default=False)
    telephone = models.CharField(max_length=30, default='')
    name = models.CharField(max_length=16, default='')
    email = models.CharField(max_length=128, default='')
    created = models.DateTimeField(default=now)
    view_num = models.IntegerField(default=0)
    answered = models.BooleanField(default=False)
    mark = models.BooleanField(default=True)
    subject = models.CharField(max_length=128, default='')
    file = models.CharField(max_length=32, default='')
    body = models.TextField(null=True, blank=True)
    deleted = models.BooleanField(default=False)
    password = models.CharField(max_length=64, default='')
    sticky = models.BooleanField(default=False)

    # MTM
    replies = models.ManyToManyField('BoardReply', related_name='askboard_replies')

class NormalBoard(models.Model):
    tag = models.CharField(max_length=16, default='')
    seq = models.IntegerField(default=0)
    service_id = models.IntegerField(default=0)
    name = models.CharField(max_length=16, default='')
    subject = models.CharField(max_length=128, default='')
    file = models.CharField(max_length=32, default='')
    body = models.TextField(null=True, blank=True)
    created = models.DateTimeField(default=now)
    view_num = models.IntegerField(default=0)
    deleted = models.BooleanField(default=False)
    password = models.CharField(max_length=64, default='')
    sticky = models.BooleanField(default=False)

    # MTM
    replies = models.ManyToManyField('BoardReply', related_name='normalboard_replies')

class ProductBoard(models.Model):
    tag = models.CharField(max_length=16, default='')
    seq = models.IntegerField(default=0)
    service_id = models.IntegerField(default=0)
    subject = models.CharField(max_length=128, default='')
    name = models.CharField(max_length=16, default='')
    gallery = models.TextField(null=True, blank=True)
    gallery_thumb = models.TextField(null=True, blank=True)
    list_image = models.CharField(max_length=64, default='')
    body = models.TextField(null=True, blank=True)
    created = models.DateTimeField(default=now)
    view_num = models.IntegerField(default=0)
    deleted = models.BooleanField(default=False)
    password = models.CharField(max_length=64, default='')

    # MTM
    labelvaluepairs = models.ManyToManyField('ProductBoardLabelValuePair', related_name='productboard_labelvaluepairs')
    replies = models.ManyToManyField('BoardReply', related_name='productboard_replies')

class BoardReply(models.Model):
    board_id = models.IntegerField(default=0)
    name = models.CharField(max_length=16, default='')
    user = models.ForeignKey(UserAccount, null=True, blank=True)
    body = models.TextField(null=True, blank=True)
    created = models.DateTimeField(default=now)

class ProductBoardLabelValuePair(models.Model):
    productboard_id = models.IntegerField(default=0)
    service_id = models.IntegerField(default=0)
    tag = models.CharField(max_length=16, default='')
    number = models.BooleanField(default=False)
    label = models.CharField(max_length=32, default='')
    value = models.CharField(max_length=32, default='')
    unit = models.CharField(max_length=32, default='')

    def get_productboard_id(self, service_id, tag, label=[], value=[], range_label=[], min=[], max=[]):
        where_clause = "1 = 1 "

        id_list = []
        if len(range_label) > 0:
            idx = 0
            for k in range_label:
                where_clause += ' and value >= ' + str(min[idx]) + ' and value <= ' + str(max[idx]) + ' and number = 1 '
                idx += 1
            qs = ProductBoardLabelValuePair.objects.filter(service_id=service_id, tag=tag, label__in=range_label).extra(where=[where_clause])
            for r in qs:
                id_list.append(r.productboard_id)

        if len(label) > 0:
            qs = ProductBoardLabelValuePair.objects.filter(service_id=service_id, tag=tag, label__in=label, value__in=value)
            for r in qs:
                id_list.append(r.productboard_id)

        return id_list

    def get_label_value_pair_by_seq(self, service_id, tag, seq):
        lvp_list = []
        items = ProductBoardLabelValuePair.objects.filter(service_id=service_id , tag=tag, productboard_id=seq)
        for i in items:
            lvp = {}
            lvp['number'] = i.number
            lvp['label'] = i.label
            lvp['value'] = i.value
            lvp['unit'] = i.unit
            lvp_list.append(lvp)
        return lvp_list

    def get_label_value_pair(self, service_id, tag):
        lvp = {}
        items = ProductBoardLabelValuePair.objects.filter(service_id=service_id, tag=tag)
        for i in items:
            if not i.label in lvp:
               lvp[i.label] = {}
               lvp[i.label]['unit'] = i.unit
               lvp[i.label]['number'] = i.number
               lvp[i.label]['value'] = []
               lvp[i.label]['value'].append(i.value)
            else:
                if not i.value in lvp[i.label]['value']:
                    lvp[i.label]['value'].append(i.value)

        return lvp

class PointRecord(models.Model):
    service_id = models.IntegerField(default=0)
    balance = models.IntegerField(default=0)
    point = models.FloatField(default=0)
    type = models.CharField(max_length=2, default='')
    created = models.DateTimeField(default=now)

class RequestTransactionCheck(models.Model):
    service_id = models.IntegerField(default = 0)
    user_id = models.IntegerField(default = 0)
    fullname = models.CharField(max_length=64, default='')
    amount = models.CharField(max_length=32, default = '')
    checked = models.BooleanField(default=False)
    created = models.DateTimeField(default=now)

class RequestBox(models.Model):
    service_id = models.IntegerField(default=0)
    name = models.CharField(max_length=32, default='')
    email = models.CharField(max_length=128, default='')
    title = models.CharField(max_length=256, default='')
    content = models.TextField(default='')
    read = models.BooleanField(default=False)
    created = models.DateTimeField(default=now)

class EmailTrackRecord(models.Model):
    user_id = models.IntegerField(default=0)
    type = models.CharField(max_length=16, default='')
    code = models.CharField(max_length=16, default='')
    visit = models.IntegerField(default=0)
    created = models.DateTimeField(default=now)
    last_visit = models.DateTimeField(default=now)

    def create_email_track_record(self, user_id, type, code):
        track_record = EmailTrackRecord(user_id=user_id,
                                        type=type,
                                        code=code)
        track_record.save()
        return True

    def increase_visit(self, type, code):
        try:
            from datetime import datetime
            track_record = EmailTrackRecord.objects.get(type=type, code=code)
            track_record.visit = track_record.visit + 1
            track_record.last_visit = datetime.now()
            track_record.save()
            return True
        except EmailTrackRecord.DoesNotExist:
            return False
