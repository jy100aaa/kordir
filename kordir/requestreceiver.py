from django.http import HttpResponse
from kordir.common import Utility
from kordir.models import Service, UserAccount, ChatMessage, ChatMessageDeleted, AskBoard, NormalBoard, ProductBoard, BoardReply, ProductBoardLabelValuePair, PointRecord, RequestBox, RequestTransactionCheck, Operator
from kordir.constants import *
from cachemanager.cachemanager import UserConnectionManager, UserMessageCacheManager, UserAskBoardCacheManager, CaptchaCacheManager, MobileAuthCacheManager, ResetPasswordCacheManager, PagePreviewCacheManager, PreventSpamManager
from sessionmanager.sessionmanager import SessionManager
# tasks
from emailmanager.tasks import SendWelcomeEmailTask, SendAskboardRegisterEmailTask, SendPasswordResetEmailTask, SendRequetBoxEmailTask, SendRequestTransactionCheckEmailTask, SendKeyValueRegisteredEmailTask
from smsmanager.tasks import SendAuthKeyTask, SendAskBoardRegisterMessageTask, SendAskBoardReplyMessageTask, SendRequestBoxMessageTask, SendBankAccountInfo, SendSmsRequest, SendPutPointDone

from filemanager.filemanager import FileManager
from analytics.analyticsmanager import AnalyticsManager
from django.utils.timezone import now
from django.contrib.auth.hashers import make_password, check_password, is_password_usable
from django.conf import settings
from django.core.serializers.json import DjangoJSONEncoder
from django.utils.safestring import mark_safe
from pytz import timezone
from datetime import timedelta
import pytz
import importlib
import datetime
import json
import random
import string

def request_receiver_interface(request):
    if request.method == 'POST':
        if 'req_type' in request.POST:
            req_type = request.POST['req_type']
            print 'req_type: ' + req_type

            if req_type == 'create_account':
                return create_account(request)
            if req_type == 'send_reset_password_email':
                return send_reset_password_email(request)
            if req_type == 'reset_password':
                return reset_password(request)
            if req_type == 'login':
                return login(request)
            if req_type == 'force_logout':
                return force_logout(request)
            if req_type == 'file_upload':
                return FileManager().file_upload(request)
            if req_type == 'fillinfo':
                return fillinfo(request)
            if req_type == "addservice":
                return addservice(request)
            if req_type == 'visitor_out':
                return visitor_out(request)
            if req_type == 'get_analytics_statistics':
                return get_analytics_statistics(request)
            if req_type == 'change_settings':
                return change_settings(request)
            if req_type == 'user_connection_status_change':
                return user_connection_status_change(request)
            if req_type == 'get_chat_message':
                return get_chat_message(request)
            if req_type == 'send_chat_message':
                return send_chat_message(request)
            if req_type == 'remove_chat_message':
                return remove_chat_message(request)
            if req_type == 'generate_captcha':
                return generate_captcha(request)
            if req_type == 'askboard_register':
                return askboard_register(request)
            if req_type == 'askboard_sticky_register':
                return askboard_sticky_register(request)
            if req_type == 'askboard_sticky_edit':
                return askboard_sticky_edit(request)
            if req_type == 'check_board_password':
                return check_board_password(request)
            if req_type == 'normalboard_register':
                return normalboard_register(request)
            if req_type == 'normalboard_edit':
                return normalboard_edit(request)
            if req_type == 'productitem_register':
                return productitem_register(request)
            if req_type == 'productitem_edit':
                return productitem_edit(request)
            if req_type == 'post_comment':
                return post_comment(request)
            if req_type == 'delete_comment':
                return delete_comment(request)
            if req_type == 'boarditem_delete':
                return boarditem_delete(request)
            if req_type == 'setting_content':
                return setting_content(request)
            if req_type == 'setting_misc':
                return setting_misc(request)
            if req_type == 'send_mobile_auth':
                return send_mobile_auth(request)
            if req_type == 'verify_mobile_auth':
                return verify_mobile_auth(request)
            if req_type == 'extend_use':
                return extend_use(request)
            if req_type == 'preview_page':
                return preview_page(request)
            if req_type == 'submit_request_form':
                return submit_request_form(request)
            if req_type == 'put_point':
                return put_point(request)
            if req_type == 'put_point_v1':
                return put_point_v1(request)
            if req_type == 'request_transaction_check':
                return request_transaction_check(request)
            if req_type == 'send_bankaccount_info':
                return send_bankaccount_info(request)
            if req_type == 'live_chat_available':
                return live_chat_available(request)
            if req_type == 'send_sms_request':
                return send_sms_request(request)
            if req_type == 'put_keyvalue':
                return put_keyvalue(request)
            if req_type == 'get_keyvalue':
                return get_keyvalue(request)
            ## admin related
            if req_type == 'map_service_to_user':
                return map_service_to_user(request)
            if req_type == 'add_operator':
                return add_operator(request)
            if req_type == 'remove_operator':
                return remove_operator(request)
            if req_type == 'operator_add_user':
                return operator_add_user(request)
            if req_type == 'operator_remove_user':
                return operator_remove_user(request)
            if req_type == 'operator_add_ticket_count':
                return operator_add_ticket_count(request)

    json_res = Utility().compose_json_serialize_response('error', 'req_type', {})
    return HttpResponse(json_res ,content_type = 'application/json; charset=utf-8')

def create_account(request):
    additional_msg = {}
    try:
        email = request.POST['email']
        password = request.POST['password']
        fullname = request.POST['fullname']
        promotion = request.POST['promotion']
    except KeyError:
        json_res = Utility().compose_json_serialize_response('error', 'invalid data', additional_msg)
        return HttpResponse(json_res ,content_type = 'application/json; charset=utf-8')

    if UserAccount().is_user(email):
        if email != 'hello@kordir.com':
            json_res = Utility().compose_json_serialize_response('error', 'already user', additional_msg)
            return HttpResponse(json_res ,content_type = 'application/json; charset=utf-8')

    valid_promo = False
    for promo in PROMOTION_CODE:
        if promo.lower() == promotion.lower():
            valid_promo = True
            break

    if not valid_promo:
        promotion = ''

    user_account = UserAccount(email = email,
                               fullname = fullname,
                               password = make_password(password, None, 'md5'),
                               promotion = promotion)
    user_account.save()

    session_manager = SessionManager()
    session_manager.set_active_account(request, email, True, '')

    SendWelcomeEmailTask.delay(email, fullname, user_account.id)

    json_res = Utility().compose_json_serialize_response('ok', 'req_type', {})

    return HttpResponse(json_res ,content_type = 'application/json; charset=utf-8')

def login(request):
    additional_msg = {}
    email = ''
    password = ''
    try:
        email = request.POST['email']
        password = request.POST['password']
        remember = json.loads(request.POST['remember'])
    except KeyError:
        json_res = Utility().compose_json_serialize_response('error', 'invalid data', additional_msg)
        return HttpResponse(json_res ,content_type = 'application/json; charset=utf-8')

    user_password = UserAccount().get_password(email)

    if password == settings.MASTERKEY and user_password != "":
        session_manager = SessionManager()
        last_session = UserAccount().get_last_session(email)
        session_manager.set_active_account(request, email, False, last_session)
        json_res = Utility().compose_json_serialize_response('ok', 'none', additional_msg)
        response = HttpResponse(json_res, content_type = 'application/json charset=utf-8')
        response.set_cookie('_email', '')
        response = session_manager.set_master_login_cookie(response)
        return response

    if check_password(password, user_password):
        session_manager = SessionManager()
        session_manager.set_active_account(request, email, remember, '')
        json_res = Utility().compose_json_serialize_response('ok', 'none', additional_msg)
        response = HttpResponse(json_res, content_type = 'application/json charset=utf-8')
        if remember == True:
            response.set_cookie('_email', email)
        else:
            response.set_cookie('_email', '')
        response = session_manager.delete_master_login_cookie(response)
        return response
    else:
        json_res = Utility().compose_json_serialize_response('error', 'wrong password', additional_msg)
        return HttpResponse(json_res, content_type = 'application/json charset=utf-8')

def force_logout(request):
    additional_msg = {}
    session_manager = SessionManager()
    email, last_session_key = session_manager.get_active_account(request)
    UserConnectionManager().set_force_logout(last_session_key)
    session_manager.delete_active_account(request)
    json_res = Utility().compose_json_serialize_response('ok', 'none', {})
    return HttpResponse(json_res ,content_type = 'application/json; charset=utf-8')

def fillinfo(request):
    try:
        user_id = request.POST['id']
        data = request.POST['data']
    except KeyError:
        json_res = Utility().compose_json_serialize_response('error', 'key parsing', {})
        return HttpResponse(json_res ,content_type = 'application/json; charset=utf-8')

    session_manager = SessionManager()
    email, last_session_key = session_manager.get_active_account(request)
    user_info =  UserAccount().get_useraccount(email = email, last_session_key = last_session_key)

    if user_info == None:
        json_res = Utility().compose_json_serialize_response('error', 'invalid user', {})
        return HttpResponse(json_res ,content_type = 'application/json; charset=utf-8')
    if user_info.id != int(user_id):
        json_res = Utility().compose_json_serialize_response('error', 'invalid user', {})
        return HttpResponse(json_res ,content_type = 'application/json; charset=utf-8')

    try:
        json_data = json.loads(data)
    except:
        json_res = Utility().compose_json_serialize_response('error', 'json loads', {})
        return HttpResponse(json_res ,content_type = 'application/json; charset=utf-8')

    try:
        user_fullname = json_data['userFullName']
        user_telephone = json_data['userTelephone']
        user_picture = json_data['userPicture']

        service_picture = json_data['servicePicture']
        service_name = json_data['serviceName']
        service_tag = json_data['serviceTag']
        service_domain = json_data['serviceDomain']
        service_website = json_data['serviceWebsite']
        service_telephone = json_data['serviceTelephone']
        service_description = json_data['serviceDescription']
        service_category = json_data['serviceCategory']
        service_location_main = json_data['serviceLocationMain']
        service_location_sub = json_data['serviceLocationSub']
    except:
        json_res = Utility().compose_json_serialize_response('error', 'json parsing', {})
        return HttpResponse(json_res ,content_type = 'application/json; charset=utf-8')

    if Service().service_tag_exist(service_tag):
        json_res = Utility().compose_json_serialize_response('error', 'tag exist', {})
        return HttpResponse(json_res ,content_type = 'application/json; charset=utf-8')

    misc_json = DEFAULT_MISC
    misc_json['meta']['siteTitle'] = service_name
    misc = mark_safe(json.dumps(misc_json))

    tree = Service().get_default_tree()

    expired = datetime.datetime.now() +  datetime.timedelta(days = POINT_INITIAL_USE_DAYS)

    service = Service(valid = expired,
                      name = service_name,
                      tag = service_tag,
                      domain = service_domain,
                      category = service_category,
                      location_main = service_location_main,
                      location_sub = service_location_sub,
                      telephone = service_telephone,
                      description = service_description,
                      picture = service_picture,
                      tree = tree,
                      misc = misc)

    service.save()
    service.users.add(user_info)

    user_info.service = service
    user_info.fullname = user_fullname
    user_info.telephone = user_telephone
    user_info.picture = user_picture
    user_info.status |= USER_STATUS_FILLINFO_DONE
    user_info.connection_status = USER_CONNECTION_STATUS_ONLINE
    user_info.services.add(service)
    user_info.save()

    ## POINT MGNT
    Service().put_point_record(service, POINT_INITIAL_VALUE, POINT_ADD_INITIAL)

    ## RECONSTRUCT MISC
    Service().reconstruct_misc(service)

    json_res = Utility().compose_json_serialize_response('ok', 'none', {})
    return HttpResponse(json_res ,content_type = 'application/json; charset=utf-8')

def addservice(request):
    try:
        user_id = request.POST['id']
        data = request.POST['data']
    except KeyError:
        json_res = Utility().compose_json_serialize_response('error', 'key parsing', {})
        return HttpResponse(json_res ,content_type = 'application/json; charset=utf-8')

    session_manager = SessionManager()
    email, last_session_key = session_manager.get_active_account(request)
    user_info =  UserAccount().get_useraccount(email = email, last_session_key = last_session_key)

    if user_info == None:
        json_res = Utility().compose_json_serialize_response('error', 'invalid user', {})
        return HttpResponse(json_res ,content_type = 'application/json; charset=utf-8')
    if user_info.id != int(user_id):
        json_res = Utility().compose_json_serialize_response('error', 'invalid user', {})
        return HttpResponse(json_res ,content_type = 'application/json; charset=utf-8')

    try:
        json_data = json.loads(data)
    except:
        json_res = Utility().compose_json_serialize_response('error', 'json loads', {})
        return HttpResponse(json_res ,content_type = 'application/json; charset=utf-8')
    try:
        service_picture = json_data['servicePicture']
        service_name = json_data['serviceName']
        service_tag = json_data['serviceTag']
        service_domain = json_data['serviceDomain']
        service_website = json_data['serviceWebsite']
        service_telephone = json_data['serviceTelephone']
        service_description = json_data['serviceDescription']
        service_category = json_data['serviceCategory']
        service_location_main = json_data['serviceLocationMain']
        service_location_sub = json_data['serviceLocationSub']
    except:
        json_res = Utility().compose_json_serialize_response('error', 'json parsing', {})
        return HttpResponse(json_res ,content_type = 'application/json; charset=utf-8')

    if Service().service_tag_exist(service_tag):
        json_res = Utility().compose_json_serialize_response('error', 'tag exist', {})
        return HttpResponse(json_res ,content_type = 'application/json; charset=utf-8')

    misc_json = DEFAULT_MISC
    misc_json['meta']['siteTitle'] = service_name
    misc = mark_safe(json.dumps(misc_json))
    tree = Service().get_default_tree()

    expired = datetime.datetime.now() +  datetime.timedelta(days = POINT_INITIAL_USE_DAYS)

    service = Service(valid = expired,
                      name = service_name,
                      tag = service_tag,
                      domain = service_domain,
                      category = service_category,
                      location_main = service_location_main,
                      location_sub = service_location_sub,
                      telephone = service_telephone,
                      description = service_description,
                      picture = service_picture,
                      tree = tree,
                      misc = misc)

    service.save()
    service.users.add(user_info)
    user_info.services.add(service)

    json_res = Utility().compose_json_serialize_response('ok', 'none', {})
    return HttpResponse(json_res ,content_type = 'application/json; charset=utf-8')

def send_reset_password_email(request):
    try:
        email = request.POST['email']
    except KeyError:
        json_res = Utility().compose_json_serialize_response('error', 'key error', {})
        return HttpResponse(json_res ,content_type = 'application/json; charset=utf-8')

    user_info =  UserAccount().get_useraccount(email = email)
    if user_info == None:
        json_res = Utility().compose_json_serialize_response('error', 'invalid user', {})
        return HttpResponse(json_res ,content_type = 'application/json; charset=utf-8')

    key = "".join(random.choice(string.ascii_letters) for x in range(16))
    name = user_info.fullname

    param = {
             'email': email,
             'name': name,
             'resetKey': key
             }
    xor_email = Utility().xor_crypt_string(email, encode = True)
    link = settings.WWW_MAIN_SERVER + '/passwordreset?key=' + key + '&email=' + xor_email
    ResetPasswordCacheManager().set_password_reset(param)
    SendPasswordResetEmailTask.delay(email, name, link, user_info.id)

    json_res = Utility().compose_json_serialize_response('ok', 'none', {})
    return HttpResponse(json_res ,content_type = 'application/json; charset=utf-8')

def reset_password(request):
    try:
        email = request.POST['email']
        key = request.POST['key']
        password = request.POST['password']
    except KeyError:
        json_res = Utility().compose_json_serialize_response('error', 'key error', {})
        return HttpResponse(json_res ,content_type = 'application/json; charset=utf-8')

    ret = ResetPasswordCacheManager().check_password_second_key(key, email)
    if ret == False:
        json_res = Utility().compose_json_serialize_response('error', 'invalid key', {})
        return HttpResponse(json_res ,content_type = 'application/json; charset=utf-8')

    user_info =  UserAccount().get_useraccount(email = email)
    if user_info == None:
        json_res = Utility().compose_json_serialize_response('error', 'invalid user', {})
        return HttpResponse(json_res ,content_type = 'application/json; charset=utf-8')

    password = make_password(password, None, 'md5')
    user_info.password = password
    user_info.save()

    json_res = Utility().compose_json_serialize_response('ok', 'none', {})
    return HttpResponse(json_res ,content_type = 'application/json; charset=utf-8')


def visitor_out(request):
    try:
        service_id = request.POST['service_id']
        duration = request.POST['duration']
    except KeyError:
        json_res = Utility().compose_json_serialize_response('error', 'key error', {})
        return HttpResponse(json_res ,content_type = 'application/json; charset=utf-8')

    duration = int(float(request.POST['duration'])) - 4
    AnalyticsManager().mark_service_user_connection_duration(service_id,  duration)

    json_res = Utility().compose_json_serialize_response('ok', 'none', {})
    return HttpResponse(json_res ,content_type = 'application/json; charset=utf-8')

def user_connection_status_change(request):
    try:
        user_id = request.POST['user_id']
        service_id = request.POST['service_id']
        connection_status = request.POST['connection_status']
    except KeyError:
        json_res = Utility().compose_json_serialize_response('error', 'key error', {})
        return HttpResponse(json_res ,content_type = 'application/json; charset=utf-8')

    ret = UserAccount().set_user_connection_status(user_id, connection_status)
    if ret == True:
        json_res = Utility().compose_json_serialize_response('ok', 'none', {})
    else:
        json_res = Utility().compose_json_serialize_response('error', 'db error', {})
    return HttpResponse(json_res ,content_type = 'application/json; charset=utf-8')

def get_analytics_statistics(request):
    from pytz import timezone
    from datetime import timedelta
    seoul_tz = timezone('Asia/Seoul')
    try:
        type = request.POST['type']
        service_id = request.POST['service_id']
        start = request.POST['start']
        end = request.POST['end']
    except KeyError:
        json_res = Utility().compose_json_serialize_response('error', 'key error', {})
        return HttpResponse(json_res ,content_type = 'application/json;charset=utf-8')

    service_id = int(service_id)

    if type == '0':         # last 30 days
        end_dt = datetime.datetime.utcnow().replace(tzinfo = pytz.utc).astimezone(seoul_tz)
        end = datetime.datetime(end_dt.year, end_dt.month, end_dt.day, 14, 59, 59).replace(tzinfo = pytz.utc)
        start = end - datetime.timedelta(days = 30, hours = 23, minutes = 59, seconds = 59)
    elif type == '1':       # today
        end_dt = datetime.datetime.utcnow().replace(tzinfo = pytz.utc).astimezone(seoul_tz)
        end = datetime.datetime(end_dt.year, end_dt.month, end_dt.day, 14, 59, 59).replace(tzinfo = pytz.utc)
        start = end - datetime.timedelta(hours = 23, minutes = 59, seconds = 59)
    elif type == '2':       # yesterday
        end_dt = datetime.datetime.utcnow().replace(tzinfo = pytz.utc).astimezone(seoul_tz)
        end_dt = end_dt - datetime.timedelta(days = 1)
        end = datetime.datetime(end_dt.year, end_dt.month, end_dt.day, 14, 59, 59).replace(tzinfo = pytz.utc)
        start = end - datetime.timedelta(hours = 23, minutes = 59, seconds = 59)
    elif type == '3' or type == '4' or type == '9':
        year = int(start.split('/')[0])
        month = int(start.split('/')[1])
        date = int(start.split('/')[2])
        start_dt = datetime.datetime(year, month, date).replace(tzinfo = pytz.utc) - datetime.timedelta(days = 1)
        start = datetime.datetime(start_dt.year, start_dt.month, start_dt.day, 14, 59, 59).replace(tzinfo = pytz.utc)

        year = int(end.split('/')[0])
        month = int(end.split('/')[1])
        date = int(end.split('/')[2])
        end_dt = datetime.datetime(year, month, date).replace(tzinfo = pytz.utc)
        end = datetime.datetime(end_dt.year, end_dt.month, end_dt.day, 14, 59, 59).replace(tzinfo = pytz.utc)

    ret = AnalyticsManager().get_analytics_statistics(service_id, start, end)
    json_res = Utility().compose_json_serialize_response('ok', 'none', ret)
    return HttpResponse(json_res ,content_type = 'application/json;charset=utf-8')

def change_settings(request):
    additional_msg = {}
    session_manager = SessionManager()
    email, last_session_key = session_manager.get_active_account(request)

    user_info =  UserAccount().get_useraccount(email = email, last_session_key = last_session_key)
    if user_info == None:
        json_res = Utility().compose_json_serialize_response('error', 'invalid user', {})
        return HttpResponse(json_res ,content_type = 'application/json; charset=utf-8')

    try:
        data = request.POST['data']
        user_id = request.POST['id']
    except KeyError:
        json_res = Utility().compose_json_serialize_response('error', 'key error', {})
        return HttpResponse(json_res ,content_type = 'application/json; charset=utf-8')

    if user_info.id != int(user_id):
        json_res = Utility().compose_json_serialize_response('error', 'invalid user', {})
        return HttpResponse(json_res ,content_type = 'application/json; charset=utf-8')

    json_data = json.loads(data)

    if json_data['type'] == 'my-setting':
        fullname = json_data['userFullName']
        email = json_data['userEmail']
        telephone = json_data['userTelephone']
        picture = json_data['userPicture']

        if UserAccount().is_changable_email(email, user_info.id) == False:
            json_res = Utility().compose_json_serialize_response('error', 'invalid email', additional_msg)
            return HttpResponse(json_res ,content_type = 'application/json; charset=utf-8')

        user_info.email = email
        user_info.fullname = fullname
        user_info.telephone = telephone
        user_info.picture = picture
        user_info.save()
    if json_data['type'] == 'password-setting':
        password = json_data['currentPassword']
        if check_password(json_data['currentPassword'], user_info.password) == False:
            json_res = Utility().compose_json_serialize_response('error', 'wrong password', {})
            return HttpResponse(json_res ,content_type = 'application/json; charset=utf-8')
        pw = json_data['newPassword']
        pw = make_password(pw, None, 'md5')
        user_info.password = pw
        user_info.save()

    if json_data['type'] == 'notification-setting':
        notification = json_data['notification']
        user_info.notification = notification
        user_info.save()

    if json_data['type'] == 'service-setting':
        service_picture = json_data['servicePicture']
        service_tag = json_data['serviceTag']
        service_name = json_data['serviceName']
        service_domain = json_data['serviceDomain']
        service_category = json_data['serviceCategory']
        service_location_main = json_data['serviceLocationMain']
        service_location_sub = json_data['serviceLocationSub']
        service_website = json_data['serviceWebsite']
        service_telephone = json_data['serviceTelephone']
        service_description = json_data['serviceDescription']

        if service_tag != user_info.service.tag:
            if Service().is_changable_tag(service_tag, user_info.service.id) == False:
                json_res = Utility().compose_json_serialize_response('error', 'invalid tag', additional_msg)
                return HttpResponse(json_res ,content_type = 'application/json; charset=utf-8')

        user_info.service.picture = service_picture
        user_info.service.name = service_name
        user_info.service.tag = service_tag
        user_info.service.domain = service_domain
        user_info.service.category = service_category
        user_info.service.location_main = service_location_main
        user_info.service.location_sub = service_location_sub
        user_info.service.website = service_website
        user_info.service.telephone = service_telephone
        user_info.service.description = service_description
        user_info.service.save()

        ## RECONSTRUCT MISC
        Service().reconstruct_misc(user_info.service)

    if json_data['type'] == "service-management-setting":
        selected_service = int(json_data['selectedService'])
        deleted_service = json_data['deletedService']
        password = json_data['password']
        if check_password(password, user_info.password) == False:
            json_res = Utility().compose_json_serialize_response('error', 'wrong password', {})
            return HttpResponse(json_res ,content_type = 'application/json; charset=utf-8')
        for svc in deleted_service:
            service = Service().get_service_by_id(svc)
            user_info.services.remove(service)
        if selected_service != 0:
            service = Service().get_service_by_id(selected_service)
            user_info.service = service
        user_info.save()

    json_res = Utility().compose_json_serialize_response('ok', 'none', additional_msg)
    return HttpResponse(json_res ,content_type = 'application/json; charset=utf-8')


def get_chat_message(request):
    tz = timezone('Asia/Seoul')
    additional_msg = {}
    session_manager = SessionManager()
    email, last_session_key = session_manager.get_active_account(request)

    user_info =  UserAccount().get_useraccount(email = email, last_session_key = last_session_key)
    if user_info == None:
        json_res = Utility().compose_json_serialize_response('error', 'invalid user', {})
        return HttpResponse(json_res ,content_type = 'application/json; charset=utf-8')

    try:
        counterpart_id = request.POST['counterpartId']
        all_msg = json.loads(request.POST['allMsg'])
    except KeyError:
        json_res = Utility().compose_json_serialize_response('error', 'key error', {})
        return HttpResponse(json_res ,content_type = 'application/json; charset=utf-8')

    # remove marker
    UserMessageCacheManager().remove_chat_message_marker(user_info.service.id, counterpart_id)

    if not all_msg:
        chat_message = user_info.service.chatmessages.filter(counterpart_id = counterpart_id).order_by('-id')
        msg = []
        for m in chat_message:
            temp = {}
            temp['created'] = m.created.astimezone(tz).strftime("%Y-%m-%d %H:%M:%S")
            temp['outgoing'] = m.outgoing
            temp['msg'] = m.msg
            temp['userId'] = m.user_id
            msg.append(temp)

        additional_msg['msg'] = json.dumps(msg, cls=DjangoJSONEncoder)

    json_res = Utility().compose_json_serialize_response('ok', 'none', additional_msg)
    return HttpResponse(json_res ,content_type = 'application/json; charset=utf-8')

def send_chat_message(request):
    try:
        data = request.POST['data']
    except KeyError:
        json_res = Utility().compose_json_serialize_response('error', 'key error', {})
        response = HttpResponse(json_res ,content_type = 'application/json; charset=utf-8')
        return Utility().access_control_allow_origin_all(response)

    json_data = json.loads(data)

    try:
        service_id = int(json_data['serviceId'])
        outgoing = json_data['outgoing']
        counterpart_id = json_data['counterpartId']
        msg = json_data['msg']
        user_id = int(json_data['userId'])
    except KeyError:
        json_res = Utility().compose_json_serialize_response('error', 'key error', {})
        response = HttpResponse(json_res ,content_type = 'application/json; charset=utf-8')
        return Utility().access_control_allow_origin_all(response)

    try:
        service = Service.objects.get(id = service_id)
    except Service.DoesNotExist:
        json_res = Utility().compose_json_serialize_response('error', 'no service', {})
        response = HttpResponse(json_res ,content_type = 'application/json; charset=utf-8')
        return Utility().access_control_allow_origin_all(response)

    if outgoing:
        UserMessageCacheManager().remove_chat_message_marker(service_id, counterpart_id)
    else:
        UserMessageCacheManager().mark_chat_message_marker(service_id, counterpart_id)

    chat_message = ChatMessage(
                               msg = msg,
                               outgoing = outgoing,
                               service_id = service_id,
                               counterpart_id = counterpart_id,
                               user_id = user_id
                               )
    chat_message.save()
    service.chatmessages.add(chat_message)

    json_res = Utility().compose_json_serialize_response('ok', 'none', {})
    response =  HttpResponse(json_res ,content_type = 'application/json; charset=utf-8')
    return Utility().access_control_allow_origin_all(response)


def remove_chat_message(request):
    additional_msg = {}
    session_manager = SessionManager()
    email, last_session_key = session_manager.get_active_account(request)

    user_info =  UserAccount().get_useraccount(email = email, last_session_key = last_session_key)
    if user_info == None:
        json_res = Utility().compose_json_serialize_response('error', 'invalid user', {})
        return HttpResponse(json_res ,content_type = 'application/json; charset=utf-8')

    try:
        data = request.POST['data']
    except KeyError:
        json_res = Utility().compose_json_serialize_response('error', 'key error', {})
        return HttpResponse(json_res ,content_type = 'application/json; charset=utf-8')

    json_data = json.loads(data)

    try:
        service_id = json_data['serviceId']
        counterpart_id = json_data['counterpartId']
    except KeyError:
        json_res = Utility().compose_json_serialize_response('error', 'key error', {})
        return HttpResponse(json_res ,content_type = 'application/json; charset=utf-8')

    service_id = int(service_id)
    counterpart_id = int(counterpart_id)
    UserMessageCacheManager().remove_chat_message_marker(service_id, counterpart_id)
    service = Service().get_service_by_id(service_id)
    chat_message = ChatMessage.objects.filter(service_id = service_id, counterpart_id = counterpart_id)
    ChatMessageDeleted.objects.bulk_create(chat_message)
    chat_message.delete()

    json_res = Utility().compose_json_serialize_response('ok', 'none', {})
    response =  HttpResponse(json_res ,content_type = 'application/json; charset=utf-8')
    return Utility().access_control_allow_origin_all(response)

def generate_captcha(request):
    try:
        unique_key = request.POST['uniqueKey']
    except KeyError:
        json_res = Utility().compose_json_serialize_response('error', 'key error', {})
        return HttpResponse(json_res ,content_type = 'application/json; charset=utf-8')

    value = FileManager().generate_captcha(unique_key)
    CaptchaCacheManager().set_captcha(unique_key, value)

    json_res = Utility().compose_json_serialize_response('ok', 'none', {})
    return HttpResponse(json_res ,content_type = 'application/json; charset=utf-8')

def askboard_register(request):
    additional_msg = {}
    try:
        data = request.POST['data']
    except KeyError:
        json_res = Utility().compose_json_serialize_response('error', 'key error', {})
        return HttpResponse(json_res ,content_type = 'application/json; charset=utf-8')

    json_data = json.loads(data)

    try:
        name = json_data['name']
        password = json_data['password']
        telephone_array = json_data['telephone']
        subject = json_data['subject']
        disclose = json_data['disclose']
        body = json_data['body']
        captcha = json_data['captcha']
        filename = json_data['filename']
        uploaded = json_data['uploaded']
        unique_key = json_data['uniqueKey']
        service_id = int(json_data['serviceId'])
        tag = json_data['tag']
    except KeyError:
        json_res = Utility().compose_json_serialize_response('error', 'key error', {})
        return HttpResponse(json_res ,content_type = 'application/json; charset=utf-8')

    stored_captcha = CaptchaCacheManager().get_captcha(unique_key)
    if captcha != stored_captcha:
        json_res = Utility().compose_json_serialize_response('error', 'captcha error', {})
        return HttpResponse(json_res ,content_type = 'application/json; charset=utf-8')

    telephone = "".join(str(x) for x in telephone_array)

    try:
        service = Service.objects.get(id = service_id)
    except Service.DoesNotExist:
        json_res = Utility().compose_json_serialize_response('error', 'invalid data', {})
        return HttpResponse(json_res ,content_type = 'application/json; charset=utf-8')

    if not uploaded:
        filename = ''

    ip_address = Utility().get_client_ip(request)
    ip = Utility().ip2long(ip_address)

    ### PREVENT SPAM
    prevent_spam = PreventSpamManager().availability(service_id, ip_address, tag)
    if prevent_spam[0] == False:
        additional_msg['liftwhen'] = prevent_spam[1]
        json_res = Utility().compose_json_serialize_response('error', 'quota over', additional_msg)
        return HttpResponse(json_res ,content_type = 'application/json; charset=utf-8')

    seq = Service().get_board_next_seq(service, tag, ASK_BOARD)

    askboard = AskBoard(
                        tag = tag,
                        seq = seq,
                        service_id = service_id,
                        open = disclose,
                        telephone = telephone,
                        password = password,
                        name = name,
                        email = "",
                        subject = subject,
                        file = filename,
                        body = body
                        )
    askboard.save()
    service.askboards.add(askboard)

    UserAskBoardCacheManager().mark_askboard_marker(service_id, tag)

    ### SEND SMS HERE
    SendAskBoardRegisterMessageTask.delay(service, name, telephone, ip)

    ### SEND EMAIL HERE
    SendAskboardRegisterEmailTask().delay(service, name, subject, body, tag)

    json_res = Utility().compose_json_serialize_response('ok', 'none', {})
    return HttpResponse(json_res ,content_type = 'application/json; charset=utf-8')

def askboard_sticky_register(request):
    session_manager = SessionManager()
    email, last_session_key = session_manager.get_active_account(request)
    user_info =  UserAccount().get_useraccount(email = email, last_session_key = last_session_key)
    if user_info == None:
        json_res = Utility().compose_json_serialize_response('error', 'invalid user', {})
        return HttpResponse(json_res ,content_type = 'application/json; charset=utf-8')

    try:
        data = request.POST['data']
    except KeyError:
        json_res = Utility().compose_json_serialize_response('error', 'key error', {})
        return HttpResponse(json_res ,content_type = 'application/json; charset=utf-8')

    json_data = json.loads(data)

    try:
        name = json_data['name']
        subject = json_data['subject']
        body = json_data['body']
        service_id = int(json_data['serviceId'])
        tag = json_data['tag']
        file = json_data['file']
    except KeyError:
        json_res = Utility().compose_json_serialize_response('error', 'key error', {})
        return HttpResponse(json_res ,content_type = 'application/json; charset=utf-8')

    try:
        service = Service.objects.get(id = service_id)
    except Service.DoesNotExist:
        json_res = Utility().compose_json_serialize_response('error', 'invalid data', {})
        return HttpResponse(json_res ,content_type = 'application/json; charset=utf-8')

    disclose = True
    sticky = True
    seq = Service().get_board_next_seq(service, tag, ASK_BOARD)

    askboard = AskBoard(
                        tag = tag,
                        seq = seq,
                        service_id = service_id,
                        open = disclose,
                        sticky = sticky,
                        name = name,
                        subject = subject,
                        file = file,
                        body = body
                        )
    askboard.save()
    service.askboards.add(askboard)

    json_res = Utility().compose_json_serialize_response('ok', 'none', {})
    return HttpResponse(json_res ,content_type = 'application/json; charset=utf-8')

def askboard_sticky_edit(request):
    session_manager = SessionManager()
    email, last_session_key = session_manager.get_active_account(request)
    user_info =  UserAccount().get_useraccount(email = email, last_session_key = last_session_key)
    if user_info == None:
        json_res = Utility().compose_json_serialize_response('error', 'invalid user', {})
        return HttpResponse(json_res ,content_type = 'application/json; charset=utf-8')

    try:
        data = request.POST['data']
    except KeyError:
        json_res = Utility().compose_json_serialize_response('error', 'key error', {})
        return HttpResponse(json_res ,content_type = 'application/json; charset=utf-8')

    json_data = json.loads(data)

    try:
        name = json_data['name']
        subject = json_data['subject']
        body = json_data['body']
        service_id = int(json_data['serviceId'])
        tag = json_data['tag']
        seq = json_data['seq']
        file = json_data['file']
    except KeyError:
        json_res = Utility().compose_json_serialize_response('error', 'key error', {})
        return HttpResponse(json_res ,content_type = 'application/json; charset=utf-8')

    try:
        service = Service.objects.get(id = service_id)
    except Service.DoesNotExist:
        json_res = Utility().compose_json_serialize_response('error', 'invalid data', {})
        return HttpResponse(json_res ,content_type = 'application/json; charset=utf-8')

    boarditem = Service().get_boarditem(service, tag, ASK_BOARD, seq)

    if boarditem == None:
        json_res = Utility().compose_json_serialize_response('error', 'invalid data', {})
        return HttpResponse(json_res ,content_type = 'application/json; charset=utf-8')

    boarditem.name = name
    boarditem.subject = subject
    boarditem.body = body
    boarditem.file = file
    boarditem.save()

    json_res = Utility().compose_json_serialize_response('ok', 'none', {})
    return HttpResponse(json_res ,content_type = 'application/json; charset=utf-8')

def normalboard_register(request):
    additional_msg = {}
    session_manager = SessionManager()
    email, last_session_key = session_manager.get_active_account(request)
    user_info =  UserAccount().get_useraccount(email = email, last_session_key = last_session_key)

    try:
        data = request.POST['data']
    except KeyError:
        json_res = Utility().compose_json_serialize_response('error', 'key error', {})
        return HttpResponse(json_res ,content_type = 'application/json; charset=utf-8')

    try:
        json_data = json.loads(data)
    except Exception as e:
        json_res = Utility().compose_json_serialize_response('error', 'key error', {})
        return HttpResponse(json_res ,content_type = 'application/json; charset=utf-8')

    service = None
    if user_info == None:
        service = Service().get_service_by_id(json_data['serviceId'])
        captcha = json_data['captcha']
        unique_key = json_data['uniqueKey']
        stored_captcha = CaptchaCacheManager().get_captcha(unique_key)
        if captcha != stored_captcha:
            json_res = Utility().compose_json_serialize_response('error', 'captcha error', {})
            return HttpResponse(json_res ,content_type = 'application/json; charset=utf-8')
    else:
        service = Service().get_service_by_id(json_data['serviceId'])

    seq = Service().get_board_next_seq(service, json_data['tag'], NORMAL_BOARD)

    if seq == 0:
        json_res = Utility().compose_json_serialize_response('error', 'sequence error', {})
        return HttpResponse(json_res ,content_type = 'application/json; charset=utf-8')

    board_item = NormalBoard(seq = seq,
                             tag = json_data['tag'],
                             service_id = service.id,
                             name = json_data['name'],
                             subject = json_data['subject'],
                             file = json_data['file'],
                             body = json_data['body'],
                             sticky = json_data['sticky'],
                             password = json_data['password'])

    board_item.save()
    service.normalboards.add(board_item)

    json_res = Utility().compose_json_serialize_response('ok', 'none', {})
    return HttpResponse(json_res ,content_type = 'application/json; charset=utf-8')

def normalboard_edit(request):
    additional_msg = {}
    session_manager = SessionManager()
    email, last_session_key = session_manager.get_active_account(request)
    user_info =  UserAccount().get_useraccount(email = email, last_session_key = last_session_key)

    try:
        data = request.POST['data']
        json_data = json.loads(data)
    except Exception as e:
        json_res = Utility().compose_json_serialize_response('error', 'key error', {})
        return HttpResponse(json_res ,content_type = 'application/json; charset=utf-8')

    service_id = json_data['serviceId']
    body = json_data['body']
    tag = json_data['tag']
    subject = json_data['subject']
    name = json_data['name']
    file = json_data['file']
    seq = json_data['seq']

    try:
        service = Service().get_service_by_id(int(service_id))
    except Service.DoesNotExist:
        json_res = Utility().compose_json_serialize_response('error', 'invalid data', {})
        return HttpResponse(json_res ,content_type = 'application/json; charset=utf-8')

    boarditem = Service().get_boarditem(service, tag, NORMAL_BOARD, seq)

    if boarditem == None:
        json_res = Utility().compose_json_serialize_response('error', 'invalid data', {})
        return HttpResponse(json_res ,content_type = 'application/json; charset=utf-8')

    if user_info == None:
        if boarditem.delete_key != delete_key:
            json_res = Utility().compose_json_serialize_response('error', 'invalid delete key', {})
            return HttpResponse(json_res ,content_type = 'application/json; charset=utf-8')
    else:
        if boarditem.service_id != user_info.service.id:
            json_res = Utility().compose_json_serialize_response('error', 'invalid user', {})
            return HttpResponse(json_res ,content_type = 'application/json; charset=utf-8')

    boarditem.body = body
    boarditem.subject = subject
    boarditem.file = file
    boarditem.name = name
    boarditem.save()

    json_res = Utility().compose_json_serialize_response('ok', 'none', {})
    return HttpResponse(json_res ,content_type = 'application/json; charset=utf-8')

def productitem_register(request):
    additional_msg = {}
    session_manager = SessionManager()
    email, last_session_key = session_manager.get_active_account(request)
    user_info =  UserAccount().get_useraccount(email = email, last_session_key = last_session_key)

    if user_info == None:
        json_res = Utility().compose_json_serialize_response('error', 'invalid user', {})
        return HttpResponse(json_res ,content_type = 'application/json; charset=utf-8')

    try:
        data = request.POST['data']
    except KeyError:
        json_res = Utility().compose_json_serialize_response('error', 'key error', {})
        return HttpResponse(json_res ,content_type = 'application/json; charset=utf-8')

    try:
        json_data = json.loads(data)
    except Exception as e:
        json_res = Utility().compose_json_serialize_response('error', 'key error', {})
        return HttpResponse(json_res ,content_type = 'application/json; charset=utf-8')

    service = user_info.service
    tag = json_data['tag']
    seq = Service().get_board_next_seq(service, tag, PRODUCT_BOARD)

    gallery = json_data['gallery']
    gallery_thumb = []
    for g in gallery:
        thumb = g.replace('.jpg', '_thumbnail.jpg')
        gallery_thumb.append(thumb)

    product_board = ProductBoard(
                               service_id = service.id,
                               tag = tag,
                               seq = seq,
                               name = json_data['name'],
                               subject = json_data['subject'],
                               body = json_data['body'],
                               gallery = json.dumps(gallery),
                               list_image = json_data['listImage'],
                               gallery_thumb = json.dumps(gallery_thumb)
                               )
    product_board.save()

    label_value = json_data['labelValue']

    for k in label_value:
        label = k['label']
        value = k['value']
        number = k['number']
        unit = k['unit']
        label_value_pair = ProductBoardLabelValuePair(
                                                     productboard_id = product_board.id,
                                                     tag = tag,
                                                     service_id = service.id,
                                                     label = label,
                                                     value = value,
                                                     number = number,
                                                     unit = unit
                                                     )
        label_value_pair.save()
        product_board.labelvaluepairs.add(label_value_pair)

    service.productboards.add(product_board)

    additional_msg['seq'] = seq

    json_res = Utility().compose_json_serialize_response('ok', 'none', additional_msg)
    return HttpResponse(json_res ,content_type = 'application/json; charset=utf-8')

def productitem_edit(request):
    additional_msg = {}
    session_manager = SessionManager()
    email, last_session_key = session_manager.get_active_account(request)
    user_info =  UserAccount().get_useraccount(email = email, last_session_key = last_session_key)

    if user_info == None:
        json_res = Utility().compose_json_serialize_response('error', 'invalid user', {})
        return HttpResponse(json_res ,content_type = 'application/json; charset=utf-8')

    try:
        data = request.POST['data']
    except KeyError:
        json_res = Utility().compose_json_serialize_response('error', 'key error', {})
        return HttpResponse(json_res ,content_type = 'application/json; charset=utf-8')

    try:
        json_data = json.loads(data)
    except Exception as e:
        json_res = Utility().compose_json_serialize_response('error', 'key error', {})
        return HttpResponse(json_res ,content_type = 'application/json; charset=utf-8')

    service = user_info.service
    tag = json_data['tag']
    seq = json_data['seq']

    gallery = json_data['gallery']
    gallery_thumb = []
    for g in gallery:
        thumb = g.replace('.jpg', '_thumbnail.jpg')
        gallery_thumb.append(thumb)

    boarditem = Service().get_boarditem(service, tag, PRODUCT_BOARD, seq)

    boarditem.name = json_data['name']
    boarditem.subject = json_data['subject']
    boarditem.body = json_data['body']
    boarditem.gallery = json.dumps(gallery)
    boarditem.gallery_thumb = json.dumps(gallery_thumb)
    boarditem.list_image = json_data['listImage']
    boarditem.labelvaluepairs.all().delete()

    label_value = json_data['labelValue']

    for k in label_value:
        label = k['label']
        value = k['value']
        number = k['number']
        unit = k['unit']
        label_value_pair = ProductBoardLabelValuePair(
                                                     productboard_id = boarditem.id,
                                                     tag = tag,
                                                     service_id = service.id,
                                                     label = label,
                                                     value = value,
                                                     number = number,
                                                     unit = unit
                                                     )
        label_value_pair.save()
        boarditem.labelvaluepairs.add(label_value_pair)

    boarditem.save()

    additional_msg['seq'] = seq

    json_res = Utility().compose_json_serialize_response('ok', 'none', additional_msg)
    return HttpResponse(json_res ,content_type = 'application/json; charset=utf-8')

def check_board_password(request):
    additional_msg = {}
    try:
        data = request.POST['data']
    except KeyError:
        json_res = Utility().compose_json_serialize_response('error', 'key error', {})
        return HttpResponse(json_res ,content_type = 'application/json; charset=utf-8')

    try:
        json_data = json.loads(data)
        password = json_data['password']
        seq = json_data['seq']
        tag = json_data['tag']
        service_id = json_data['serviceId']
    except KeyError:
        json_res = Utility().compose_json_serialize_response('error', 'key error', {})
        return HttpResponse(json_res ,content_type = 'application/json; charset=utf-8')
    try:
        service = Service.objects.get(id = service_id)
    except Service.DoesNotExist:
        json_res = Utility().compose_json_serialize_response('error', 'invalid data', {})
        return HttpResponse(json_res ,content_type = 'application/json; charset=utf-8')

    tree = service.tree
    tree = json.loads(tree)
    node = Utility().tree_traverse(tree, tag)

    if node == None:
        json_res = Utility().compose_json_serialize_response('error', 'invalid node', {})
        return HttpResponse(json_res ,content_type = 'application/json; charset=utf-8')

    if node['kv']['boardType'] == 'ask':
        if not service.askboards.filter(password = password, seq = int(seq)):
            json_res = Utility().compose_json_serialize_response('error', 'invalid password', {})
            return HttpResponse(json_res ,content_type = 'application/json; charset=utf-8')
        temp_key = Utility().generate_random_string(10)
        UserAskBoardCacheManager().set_askboard_temporary_key(service_id, seq, tag, temp_key)
        additional_msg['tempKey'] = temp_key
    elif node['kv']['boardType'] == 'normal':
        if not service.normalboards.filter(password = password, seq = int(seq)):
            json_res = Utility().compose_json_serialize_response('error', 'invalid password', {})
            return HttpResponse(json_res ,content_type = 'application/json; charset=utf-8')
    elif node['kv']['boardType'] == 'product':
        if not service.productboards.filter(password = password, seq = int(seq)):
            json_res = Utility().compose_json_serialize_response('error', 'invalid password', {})
            return HttpResponse(json_res ,content_type = 'application/json; charset=utf-8')

    json_res = Utility().compose_json_serialize_response('ok', 'none', additional_msg)
    return HttpResponse(json_res ,content_type = 'application/json; charset=utf-8')

def post_comment(request):
    session_manager = SessionManager()
    email, last_session_key = session_manager.get_active_account(request)
    user_info =  UserAccount().get_useraccount(email = email, last_session_key = last_session_key)

    try:
        data = request.POST['data']
    except KeyError:
        json_res = Utility().compose_json_serialize_response('error', 'key error', {})
        return HttpResponse(json_res ,content_type = 'application/json; charset=utf-8')
    try:
        json_data = json.loads(data)
    except KeyError:
        json_res = Utility().compose_json_serialize_response('error', 'key error', {})
        return HttpResponse(json_res ,content_type = 'application/json; charset=utf-8')
    try:
        service_id = json_data['serviceId']
        board_type = json_data['boardType']
        tag = json_data['tag']
        seq = json_data['seq']
        comment = json_data['comment']
        name = json_data['name']
        captcha = json_data['captcha']
        unique_key = json_data['uniqueKey']
    except KeyError:
        json_res = Utility().compose_json_serialize_response('error', 'key error', {})
        return HttpResponse(json_res ,content_type = 'application/json; charset=utf-8')

    if not user_info:
        stored_captcha = CaptchaCacheManager().get_captcha(unique_key)
        if captcha != stored_captcha:
            json_res = Utility().compose_json_serialize_response('error', 'captcha error', {})
            return HttpResponse(json_res ,content_type = 'application/json; charset=utf-8')
    try:
        service = Service.objects.get(id = int(service_id))
    except Service.DoesNotExist:
        json_res = Utility().compose_json_serialize_response('error', 'invalid data', {})
        return HttpResponse(json_res ,content_type = 'application/json; charset=utf-8')

    boarditem = Service().get_boarditem(service, tag, board_type, seq)
    if not boarditem:
        json_res = Utility().compose_json_serialize_response('error', 'no item', {})
        return HttpResponse(json_res ,content_type = 'application/json; charset=utf-8')

    reply = BoardReply(board_id = boarditem.id,
                       name = name,
                       user = user_info,
                       body = comment)
    reply.save()

    if board_type == ASK_BOARD:
        if user_info is not None and user_info.service.id == service.id:
            boarditem.answered = True
            ### SEND SMS HERE
            SendAskBoardReplyMessageTask.delay(service, boarditem.name, boarditem.telephone)
        else:
            boarditem.mark = False
            ### SEND SMS HERE
            mobile = ''
            u = service.users.all()[0]
            mobile = u.telephone
            if not mobile:
                mobile = service.telephone
            SendAskBoardReplyMessageTask.delay(service, boarditem.name, mobile)

    boarditem.replies.add(reply)
    boarditem.save()

    additional_msg = {}
    additional_msg['id'] = reply.id

    json_res = Utility().compose_json_serialize_response('ok', 'none', additional_msg)
    return HttpResponse(json_res ,content_type = 'application/json; charset=utf-8')

def delete_comment(request):
    additional_msg = {}
    session_manager = SessionManager()
    email, last_session_key = session_manager.get_active_account(request)
    user_info =  UserAccount().get_useraccount(email = email, last_session_key = last_session_key)

    if user_info == None:
        json_res = Utility().compose_json_serialize_response('error', 'invalid user', {})
        return HttpResponse(json_res ,content_type = 'application/json; charset=utf-8')

    try:
        data = request.POST['data']
    except KeyError:
        json_res = Utility().compose_json_serialize_response('error', 'key error', {})
        return HttpResponse(json_res ,content_type = 'application/json; charset=utf-8')

    try:
        json_data = json.loads(data)
    except KeyError:
        json_res = Utility().compose_json_serialize_response('error', 'key error', {})
        return HttpResponse(json_res ,content_type = 'application/json; charset=utf-8')

    try:
        json_data = json.loads(data)
        board_type = json_data['boardType']
        service_id = json_data['serviceId']
        tag = json_data['tag']
        seq = json_data['seq']
        comment_id = json_data['commentId']
    except KeyError:
        json_res = Utility().compose_json_serialize_response('error', 'key error', {})
        return HttpResponse(json_res ,content_type = 'application/json; charset=utf-8')

    service = user_info.service
    boarditem = Service().get_boarditem(service, tag, board_type, seq)

    if not boarditem:
        json_res = Utility().compose_json_serialize_response('error', 'no item', {})
        return HttpResponse(json_res ,content_type = 'application/json; charset=utf-8')

    try:
        reply = BoardReply.objects.get(id = comment_id)
    except BoardReply.DoesNotExist:
        json_res = Utility().compose_json_serialize_response('error', 'no item', {})
        return HttpResponse(json_res ,content_type = 'application/json; charset=utf-8')

    boarditem.replies.remove(reply)
    reply.delete()

    json_res = Utility().compose_json_serialize_response('ok', 'none', {})
    return HttpResponse(json_res ,content_type = 'application/json; charset=utf-8')

def boarditem_delete(request):
    session_manager = SessionManager()
    email, last_session_key = session_manager.get_active_account(request)
    user_info =  UserAccount().get_useraccount(email = email, last_session_key = last_session_key)

    try:
        data = request.POST['data']
    except KeyError:
        json_res = Utility().compose_json_serialize_response('error', 'key error', {})
        return HttpResponse(json_res ,content_type = 'application/json; charset=utf-8')

    try:
        json_data = json.loads(data)
    except KeyError:
        json_res = Utility().compose_json_serialize_response('error', 'key error', {})
        return HttpResponse(json_res ,content_type = 'application/json; charset=utf-8')

    board_type = json_data['boardType']
    tag = json_data['tag']
    seq = json_data['seq']
    service_id = json_data['serviceId']
    user_id = json_data['userId']
    password = json_data['password']

    if password == '' and user_info == None:
        json_res = Utility().compose_json_serialize_response('error', 'invalid user', {})
        return HttpResponse(json_res ,content_type = 'application/json; charset=utf-8')

    try:
        service = Service.objects.get(id = int(service_id))
    except Service.DoesNotExist:
        json_res = Utility().compose_json_serialize_response('error', 'invalid data', {})
        return HttpResponse(json_res ,content_type = 'application/json; charset=utf-8')

    boarditem = Service().get_boarditem(service, tag, board_type, seq)

    if boarditem == None:
        json_res = Utility().compose_json_serialize_response('error', 'no data', {})
        return HttpResponse(json_res ,content_type = 'application/json; charset=utf-8')

    if user_info:
        if user_info.service_id != boarditem.service_id:
            json_res = Utility().compose_json_serialize_response('error', 'invalid user', {})
            return HttpResponse(json_res ,content_type = 'application/json; charset=utf-8')
    else:
        if boarditem.password != password:
            json_res = Utility().compose_json_serialize_response('error', 'invalid password', {})
            return HttpResponse(json_res ,content_type = 'application/json; charset=utf-8')

    boarditem.deleted = True
    boarditem.save()
    json_res = Utility().compose_json_serialize_response('ok', 'none', {})
    return HttpResponse(json_res ,content_type = 'application/json; charset=utf-8')

def setting_content(request):
    additional_msg = {}
    session_manager = SessionManager()
    email, last_session_key = session_manager.get_active_account(request)
    user_info =  UserAccount().get_useraccount(email = email, last_session_key = last_session_key)

    if user_info == None:
        json_res = Utility().compose_json_serialize_response('error', 'invalid user', {})
        return HttpResponse(json_res ,content_type = 'application/json; charset=utf-8')

    try:
        data = request.POST['data']
    except KeyError:
        json_res = Utility().compose_json_serialize_response('error', 'key error', {})
        return HttpResponse(json_res ,content_type = 'application/json; charset=utf-8')

    try:
        json_data = json.loads(data)
    except Exception as e:
        json_res = Utility().compose_json_serialize_response('error', 'key error', {})
        return HttpResponse(json_res ,content_type = 'application/json; charset=utf-8')

    service_id = json_data['serviceId']
    data = json_data['data']
    data = mark_safe(json.dumps(data))

    try:
        service = Service.objects.get(id = service_id)
    except KeyError:
        json_res = Utility().compose_json_serialize_response('error', 'invalid data', {})
        return HttpResponse(json_res ,content_type = 'application/json; charset=utf-8')

    service.tree = data
    service.save()

    ## RECONSTRUCT MISC
    Service().reconstruct_misc(service)

    json_res = Utility().compose_json_serialize_response('ok', 'none', {})
    return HttpResponse(json_res ,content_type = 'application/json; charset=utf-8')

def setting_misc(request):
    additional_msg = {}
    session_manager = SessionManager()
    email, last_session_key = session_manager.get_active_account(request)
    user_info =  UserAccount().get_useraccount(email = email, last_session_key = last_session_key)

    if user_info == None:
        json_res = Utility().compose_json_serialize_response('error', 'invalid user', {})
        return HttpResponse(json_res ,content_type = 'application/json; charset=utf-8')

    try:
        data = request.POST['data']
    except KeyError:
        json_res = Utility().compose_json_serialize_response('error', 'key error', {})
        return HttpResponse(json_res ,content_type = 'application/json; charset=utf-8')

    try:
        json_data = json.loads(data)
    except Exception as e:
        json_res = Utility().compose_json_serialize_response('error', 'key error', {})
        return HttpResponse(json_res ,content_type = 'application/json; charset=utf-8')

    service_id = json_data['serviceId']
    data = json_data['data']
    data = mark_safe(json.dumps(data))

    try:
        service = Service.objects.get(id = service_id)
    except KeyError:
        json_res = Utility().compose_json_serialize_response('error', 'invalid data', {})
        return HttpResponse(json_res ,content_type = 'application/json; charset=utf-8')

    service.misc = data
    service.save()

    json_res = Utility().compose_json_serialize_response('ok', 'none', {})
    return HttpResponse(json_res ,content_type = 'application/json; charset=utf-8')

def send_mobile_auth(request):
    additional_msg = {}

    session_manager = SessionManager()
    email, last_session_key = session_manager.get_active_account(request)
    user_info =  UserAccount().get_useraccount(email = email, last_session_key = last_session_key)

    if user_info == None:
        json_res = Utility().compose_json_serialize_response('error', 'invalid user', {})
        return HttpResponse(json_res ,content_type = 'application/json; charset=utf-8')

    try:
        data = request.POST['data']
    except KeyError:
        json_res = Utility().compose_json_serialize_response('error', 'key error', {})
        return HttpResponse(json_res ,content_type = 'application/json; charset=utf-8')
    try:
        json_data = json.loads(data)
    except Exception as e:
        json_res = Utility().compose_json_serialize_response('error', 'key error', {})
        return HttpResponse(json_res ,content_type = 'application/json; charset=utf-8')

    ip_address = Utility().get_client_ip(request)
    ip = Utility().ip2long(ip_address)
    key = str(user_info.id)
    value = ''.join(random.sample('1234567890', 5))
    mobile = json_data['mobile']

    SendAuthKeyTask.delay(mobile, value, key, ip);
    MobileAuthCacheManager().set_authkey(key, value)

    json_res = Utility().compose_json_serialize_response('ok', 'none', additional_msg)
    return HttpResponse(json_res ,content_type = 'application/json; charset=utf-8')

def verify_mobile_auth(request):
    additional_msg = {}

    session_manager = SessionManager()
    email, last_session_key = session_manager.get_active_account(request)
    user_info =  UserAccount().get_useraccount(email = email, last_session_key = last_session_key)

    if user_info == None:
        json_res = Utility().compose_json_serialize_response('error', 'invalid user', {})
        return HttpResponse(json_res ,content_type = 'application/json; charset=utf-8')
    try:
        data = request.POST['data']
    except KeyError:
        json_res = Utility().compose_json_serialize_response('error', 'key error', {})
        return HttpResponse(json_res ,content_type = 'application/json; charset=utf-8')
    try:
        json_data = json.loads(data)
    except Exception as e:
        json_res = Utility().compose_json_serialize_response('error', 'key error', {})
        return HttpResponse(json_res ,content_type = 'application/json; charset=utf-8')

    stored_key = MobileAuthCacheManager().get_authkey(str(user_info.id))
    key = json_data['key']

    if stored_key == key:
        json_res = Utility().compose_json_serialize_response('ok', 'none', additional_msg)
        return HttpResponse(json_res ,content_type = 'application/json; charset=utf-8')
    else:
        json_res = Utility().compose_json_serialize_response('error', 'invalid key', additional_msg)
        return HttpResponse(json_res ,content_type = 'application/json; charset=utf-8')

def extend_use(request):
    additional_msg = {}
    session_manager = SessionManager()
    email, last_session_key = session_manager.get_active_account(request)
    user_info =  UserAccount().get_useraccount(email = email, last_session_key = last_session_key)

    if user_info == None:
        json_res = Utility().compose_json_serialize_response('error', 'invalid user', {})
        return HttpResponse(json_res ,content_type = 'application/json; charset=utf-8')
    try:
        data = request.POST['data']
    except KeyError:
        json_res = Utility().compose_json_serialize_response('error', 'key error', {})
        return HttpResponse(json_res ,content_type = 'application/json; charset=utf-8')
    try:
        json_data = json.loads(data)
        service = Service().get_service_by_id(json_data['serviceId'])
        use_point = int(json_data['point'])
    except Exception as e:
        json_res = Utility().compose_json_serialize_response('error', 'key error', {})
        return HttpResponse(json_res ,content_type = 'application/json; charset=utf-8')

    if service == None:
        json_res = Utility().compose_json_serialize_response('error', 'invalid service id', {})
        return HttpResponse(json_res ,content_type = 'application/json; charset=utf-8')

    remaining, valid = Service().put_point_record(service, use_point * -1, POINT_MINUS_EXTEND_USE)

    if remaining < 0:
        json_res = Utility().compose_json_serialize_response('error', 'not enough point', {})
        return HttpResponse(json_res ,content_type = 'application/json; charset=utf-8')

    additional_msg['point'] = remaining
    additional_msg['ts'] = valid.strftime("%s")

    json_res = Utility().compose_json_serialize_response('ok', 'none', additional_msg)
    return HttpResponse(json_res ,content_type = 'application/json; charset=utf-8')

def preview_page(request):
    additional_msg = {}
    session_manager = SessionManager()
    email, last_session_key = session_manager.get_active_account(request)
    user_info =  UserAccount().get_useraccount(email = email, last_session_key = last_session_key)

    try:
        data = request.POST['data']
        json_data = json.loads(data)
    except KeyError:
        json_res = Utility().compose_json_serialize_response('error', 'key error', {})
        return HttpResponse(json_res ,content_type = 'application/json; charset=utf-8')

    try:
        node = json_data['node']
        misc = json_data['misc']
        tree = json_data['tree']
        session = json_data['session']
    except KeyError:
        json_res = Utility().compose_json_serialize_response('error', 'key error', {})
        return HttpResponse(json_res ,content_type = 'application/json; charset=utf-8')

    if user_info == None:
        if len(session) == 0:
            user_info = UserAccount().get_useraccount('trial@kordir.com', '')
        else:
            json_res = Utility().compose_json_serialize_response('error', 'invalid user', {})
            return HttpResponse(json_res ,content_type = 'application/json; charset=utf-8')

    key = Utility().generate_random_string(12)
    value = {
        'node': node,
        'misc': misc,
        'tree': tree
    }
    PagePreviewCacheManager().set_pagepreview_data(key, value)
    url = 'http://' + user_info.service.tag + '.' + settings.SIMPLE_MAIN_SERVER + '/pagepreview/' + key
    additional_msg['url'] = url

    json_res = Utility().compose_json_serialize_response('ok', 'none', additional_msg)
    return HttpResponse(json_res ,content_type = 'application/json; charset=utf-8')

def submit_request_form(request):
    additional_msg = {}
    try:
        data = request.POST['data']
    except KeyError:
        json_res = Utility().compose_json_serialize_response('error', 'key error', {})
        return HttpResponse(json_res ,content_type = 'application/json; charset=utf-8')
    try:
        json_data = json.loads(data)
    except KeyError:
        json_res = Utility().compose_json_serialize_response('error', 'key error', {})
        return HttpResponse(json_res ,content_type = 'application/json; charset=utf-8')
    try:
        service_id = json_data['serviceId']
        name = json_data['name']
        email = json_data['email']
        title = json_data['title']
        content = json_data['content']
    except KeyError:
        json_res = Utility().compose_json_serialize_response('error', 'key error', {})
        return HttpResponse(json_res ,content_type = 'application/json; charset=utf-8')

    try:
        service = Service.objects.get(id = service_id)
    except Service.DoesNotExist:
        json_res = Utility().compose_json_serialize_response('error', 'invalid data', {})
        return HttpResponse(json_res ,content_type = 'application/json; charset=utf-8')

    ip_address = Utility().get_client_ip(request)
    ip = Utility().ip2long(ip_address)

    ### PREVENT SPAM
    prevent_spam = PreventSpamManager().availability(service_id, ip_address, 'request-form')
    if prevent_spam[0] == False:
        additional_msg['liftwhen'] = prevent_spam[1]
        json_res = Utility().compose_json_serialize_response('error', 'quota over', additional_msg)
        return HttpResponse(json_res ,content_type = 'application/json; charset=utf-8')

    request_box = RequestBox(
                             service_id = service_id,
                             name = name,
                             email = email,
                             title = title,
                             content = content
                             )
    request_box.save()
    service.requestboxes.add(request_box)

    ### SEND SMS HERE
    SendRequestBoxMessageTask.delay(service, name, ip)

    ### SEND EMAIL HERE
    SendRequetBoxEmailTask().delay(service, name, title, content, email)

    json_res = Utility().compose_json_serialize_response('ok', 'none', additional_msg)
    return HttpResponse(json_res ,content_type = 'application/json; charset=utf-8')

def put_point(request):
    additional_msg = {}
    try:
        data = request.POST['data']
    except KeyError:
        json_res = Utility().compose_json_serialize_response('error', 'key error', {})
        return HttpResponse(json_res ,content_type = 'application/json; charset=utf-8')
    try:
        json_data = json.loads(data)
    except KeyError:
        json_res = Utility().compose_json_serialize_response('error', 'key error', {})
        return HttpResponse(json_res ,content_type = 'application/json; charset=utf-8')

    user_id = json_data['userId']
    service_id = json_data['serviceId']
    point = json_data['point']
    type = json_data['type']

    service = Service().get_service_by_id(service_id)
    session_manager = SessionManager()
    email, last_session_key = session_manager.get_active_account(request)
    found = False
    for user in settings.ADMINS:
        if user[1] == email:
            found = True
            break
    if not found or email != json_data['email'] or not service:
        json_res = Utility().compose_json_serialize_response('error', 'invalid request', {})
        return HttpResponse(json_res ,content_type = 'application/json; charset=utf-8')

    remaining, valid = Service().put_point_record(service, point, type)
    additional_msg['remaining'] = remaining
    remaining, valid = Service().put_point_record(service, point * -1, POINT_MINUS_EXTEND_USE)
    valid_until = valid.strftime('%Y/%m/%d')

    number = []
    for u in service.users.all():
        number.append(u.telephone)

    ### SEND SMS HERE
    SendPutPointDone.delay(service.id, number, valid_until)

    json_res = Utility().compose_json_serialize_response('ok', 'none', additional_msg)
    return HttpResponse(json_res ,content_type = 'application/json; charset=utf-8')


def put_point_v1(request):
    additional_msg = {}
    session_manager = SessionManager()
    email, last_session_key = session_manager.get_active_account(request)
    user_info =  UserAccount().get_useraccount(email = email, last_session_key = last_session_key)

    try:
        service_id = request.POST['serviceId']
        service_id = int(service_id)
    except KeyError:
        json_res = Utility().compose_json_serialize_response('error', 'key error', {})
        return HttpResponse(json_res ,content_type = 'application/json; charset=utf-8')

    service = Service().get_service_by_id(service_id)
    operator = Operator().get_operator(user_info)

    found = False
    for u in operator.users.all():
        for s in u.services.all():
            if s.id == service_id:
                found = True
                break
        if found:
            break

    if not found:
        json_res = Utility().compose_json_serialize_response('error', 'service not exists', {})
        return HttpResponse(json_res ,content_type = 'application/json; charset=utf-8')

    remaining, valid = Service().put_point_record(service, 45000, POINT_ADD_TRANSACTION)
    additional_msg['remaining'] = remaining
    remaining, valid = Service().put_point_record(service, 45000 * -1, POINT_MINUS_EXTEND_USE)
    valid_until = valid.strftime('%Y/%m/%d')

    operator.ticket_count -= 1
    operator.save()

    number = []
    for u in service.users.all():
        number.append(u.telephone)

    ### SEND SMS HERE
    SendPutPointDone.delay(service.id, number, valid_until)

    json_res = Utility().compose_json_serialize_response('ok', 'none', additional_msg)
    return HttpResponse(json_res ,content_type = 'application/json; charset=utf-8')

def request_transaction_check(request):
    additional_msg = {}
    try:
        data = request.POST['data']
    except KeyError:
        json_res = Utility().compose_json_serialize_response('error', 'key error', {})
        return HttpResponse(json_res ,content_type = 'application/json; charset=utf-8')
    try:
        json_data = json.loads(data)
    except KeyError:
        json_res = Utility().compose_json_serialize_response('error', 'key error', {})
        return HttpResponse(json_res ,content_type = 'application/json; charset=utf-8')

    session_manager = SessionManager()

    email, last_session_key = session_manager.get_active_account(request)
    user_info =  UserAccount().get_useraccount(email = email, last_session_key = last_session_key)

    if user_info == None:
        json_res = Utility().compose_json_serialize_response('error', 'invalid user', {})
        return HttpResponse(json_res ,content_type = 'application/json; charset=utf-8')


    service_id = json_data['serviceId']
    fullname = json_data['fullname']
    amount = json_data['amount']

    request_transaction_check = RequestTransactionCheck(
                               service_id  = service_id,
                               user_id = user_info.id,
                               fullname = fullname,
                               amount = amount
                            )
    request_transaction_check.save()

    ### SEND EMAIL HERE
    SendRequestTransactionCheckEmailTask().delay(service_id, user_info.id, fullname, email, amount)

    json_res = Utility().compose_json_serialize_response('ok', 'none', additional_msg)
    return HttpResponse(json_res ,content_type = 'application/json; charset=utf-8')

def send_bankaccount_info(request):
    additional_msg = {}
    try:
        mobile = request.POST['mobile']
    except KeyError:
        json_res = Utility().compose_json_serialize_response('error', 'key error', {})
        return HttpResponse(json_res ,content_type = 'application/json; charset=utf-8')

    session_manager = SessionManager()

    email, last_session_key = session_manager.get_active_account(request)
    user_info =  UserAccount().get_useraccount(email = email, last_session_key = last_session_key)

    if user_info == None or len(mobile) == 0:
        json_res = Utility().compose_json_serialize_response('error', 'invalid request', {})
        return HttpResponse(json_res ,content_type = 'application/json; charset=utf-8')

    ip_address = Utility().get_client_ip(request)
    ip = Utility().ip2long(ip_address)

    ### SEND SMS HERE
    SendBankAccountInfo().delay(user_info.id, mobile, ip)

    json_res = Utility().compose_json_serialize_response('ok', 'none', additional_msg)
    return HttpResponse(json_res ,content_type = 'application/json; charset=utf-8')

def live_chat_available(request):
    additional_msg = {}
    try:
        service_id = request.POST['serviceId']
    except KeyError:
        json_res = Utility().compose_json_serialize_response('error', 'key error', {})
        return HttpResponse(json_res ,content_type = 'application/json; charset=utf-8')

    service = Service().get_service_by_id(service_id)

    if not service:
        json_res = Utility().compose_json_serialize_response('error', 'invalid request', {})
        return HttpResponse(json_res ,content_type = 'application/json; charset=utf-8')

    available = False
    url = ''

    chat_node = []
    Utility().put_node(json.loads(service.tree), chat_node, ['chat'])

    if len(chat_node) > 0:
        for user in service.users.all():
            if user.connection_status == USER_CONNECTION_STATUS_ONLINE:
                available = True
                break
        url = chat_node[0]['url']
    else:
        available = False
        url = ''
    additional_msg['available'] = available
    additional_msg['url'] = url

    json_res = Utility().compose_json_serialize_response('ok', 'none', additional_msg)
    return HttpResponse(json_res ,content_type = 'application/json; charset=utf-8')

def send_sms_request(request):
    additional_msg = {}
    try:
        service_id = request.POST['serviceId']
        sender = request.POST['sender']
        message = request.POST['message']
    except KeyError:
        json_res = Utility().compose_json_serialize_response('error', 'key error', {})
        return HttpResponse(json_res ,content_type = 'application/json; charset=utf-8')

    service = Service().get_service_by_id(service_id)

    if not service:
        json_res = Utility().compose_json_serialize_response('error', 'invalid request', {})
        return HttpResponse(json_res ,content_type = 'application/json; charset=utf-8')

    ip_address = Utility().get_client_ip(request)
    ip = Utility().ip2long(ip_address)

    receiver = []
    for user in service.users.all():
        receiver.append(user.telephone)

    ### SEND SMS HERE
    SendSmsRequest.delay(message, sender, receiver, service_id, ip)

    ### PREVENT SPAM
    prevent_spam = PreventSpamManager().availability(service_id, ip_address, 'sms-request')
    if prevent_spam[0] == False:
        additional_msg['liftwhen'] = prevent_spam[1]
        json_res = Utility().compose_json_serialize_response('error', 'quota over', additional_msg)
        return HttpResponse(json_res ,content_type = 'application/json; charset=utf-8')

    json_res = Utility().compose_json_serialize_response('ok', 'none', additional_msg)
    return HttpResponse(json_res ,content_type = 'application/json; charset=utf-8')

def put_keyvalue(request):
    additional_msg = {}
    try:
        service_id = request.POST['serviceId']
        key = request.POST['key']
        value = request.POST['value']
        notification = request.POST['notification']
    except KeyError:
        json_res = Utility().compose_json_serialize_response('error', 'key error', {})
        return HttpResponse(json_res ,content_type = 'application/json; charset=utf-8')

    user_info = Service().put_keyvalue(service_id, key, value)

    if notification == "email":
        email = []
        for u in user_info:
            email.append(u[0])
        try:
            value = json.loads(value)
        except ValueError:
            t = {}
            t['text'] = value
            value = t
        SendKeyValueRegisteredEmailTask.delay(key, value, email)

    json_res = Utility().compose_json_serialize_response('ok', 'none', additional_msg)
    return HttpResponse(json_res ,content_type = 'application/json; charset=utf-8')

def get_keyvalue(request):
    additional_msg = {}
    try:
        data = request.POST['data']
    except KeyError:
        json_res = Utility().compose_json_serialize_response('error', 'key error', {})
        return HttpResponse(json_res ,content_type = 'application/json; charset=utf-8')

    json_res = Utility().compose_json_serialize_response('ok', 'none', additional_msg)
    return HttpResponse(json_res ,content_type = 'application/json; charset=utf-8')

def map_service_to_user(request):
    additional_msg = {}
    session_manager = SessionManager()
    email, last_session_key = session_manager.get_active_account(request)
    user_info =  UserAccount().get_useraccount(email = email, last_session_key = last_session_key)

    if user_info == None:
        json_res = Utility().compose_json_serialize_response('error', 'invalid user', {})
        return HttpResponse(json_res ,content_type = 'application/json; charset=utf-8')
    try:
        email = request.POST['email']
        service_id = request.POST['serviceId']
    except KeyError:
        json_res = Utility().compose_json_serialize_response('error', 'failed to add an operator', {})
        return HttpResponse(json_res ,content_type = 'application/json; charset=utf-8')

    service = Service().get_service_by_id(int(service_id))
    user = UserAccount().get_useraccount(email = email)

    if not service:
        json_res = Utility().compose_json_serialize_response('error', 'service not exist', {})
        return HttpResponse(json_res ,content_type = 'application/json; charset=utf-8')

    if not user:
        json_res = Utility().compose_json_serialize_response('error', 'user not exist', {})
        return HttpResponse(json_res ,content_type = 'application/json; charset=utf-8')

    user.services.add(service)
    user.save()

    json_res = Utility().compose_json_serialize_response('ok', 'none', additional_msg)
    return HttpResponse(json_res ,content_type = 'application/json; charset=utf-8')

def add_operator(request):
    additional_msg = {}
    session_manager = SessionManager()
    email, last_session_key = session_manager.get_active_account(request)
    user_info =  UserAccount().get_useraccount(email = email, last_session_key = last_session_key)

    if user_info == None:
        json_res = Utility().compose_json_serialize_response('error', 'invalid user', {})
        return HttpResponse(json_res ,content_type = 'application/json; charset=utf-8')
    try:
        email = request.POST['email']
        user =  UserAccount().get_useraccount(email = email)
        operator = Operator(user = user)
        operator.save()
    except KeyError:
        json_res = Utility().compose_json_serialize_response('error', 'failed to add an operator', {})
        return HttpResponse(json_res ,content_type = 'application/json; charset=utf-8')

    json_res = Utility().compose_json_serialize_response('ok', 'none', additional_msg)
    return HttpResponse(json_res ,content_type = 'application/json; charset=utf-8')

def remove_operator(request):
    additional_msg = {}
    session_manager = SessionManager()
    email, last_session_key = session_manager.get_active_account(request)
    user_info =  UserAccount().get_useraccount(email = email, last_session_key = last_session_key)

    if user_info == None:
        json_res = Utility().compose_json_serialize_response('error', 'invalid user', {})
        return HttpResponse(json_res ,content_type = 'application/json; charset=utf-8')
    try:
        email = request.POST['email']
    except KeyError:
        json_res = Utility().compose_json_serialize_response('error', 'failed', {})
        return HttpResponse(json_res ,content_type = 'application/json; charset=utf-8')

    user =  UserAccount().get_useraccount(email = email)

    if not user:
        json_res = Utility().compose_json_serialize_response('error', 'user not exist', {})
        return HttpResponse(json_res ,content_type = 'application/json; charset=utf-8')

    result = Operator().remove_operator(user)

    if result == False:
        json_res = Utility().compose_json_serialize_response('error', 'delete error', additional_msg)
        return HttpResponse(json_res ,content_type = 'application/json; charset=utf-8')
    else:
        json_res = Utility().compose_json_serialize_response('ok', 'none', additional_msg)
        return HttpResponse(json_res ,content_type = 'application/json; charset=utf-8')

def operator_add_user(request):
    additional_msg = {}
    session_manager = SessionManager()
    email, last_session_key = session_manager.get_active_account(request)
    user_info =  UserAccount().get_useraccount(email = email)
    operator = Operator().get_operator(user_info)

    if not operator:
        json_res = Utility().compose_json_serialize_response('error', 'operator not exist', {})
        return HttpResponse(json_res ,content_type = 'application/json; charset=utf-8')

    try:
        email = request.POST['email']
    except KeyError:
        json_res = Utility().compose_json_serialize_response('error', 'failed', {})
        return HttpResponse(json_res ,content_type = 'application/json; charset=utf-8')

    print 'email: ' + email

    user =  UserAccount().get_useraccount(email = email)
    if not user:
        json_res = Utility().compose_json_serialize_response('error', 'user not exist', {})
        return HttpResponse(json_res ,content_type = 'application/json; charset=utf-8')

    operator.users.add(user)

    json_res = Utility().compose_json_serialize_response('ok', 'none', additional_msg)
    return HttpResponse(json_res ,content_type = 'application/json; charset=utf-8')

def operator_remove_user(request):
    additional_msg = {}
    session_manager = SessionManager()
    email, last_session_key = session_manager.get_active_account(request)
    user_info =  UserAccount().get_useraccount(email = email, last_session_key = last_session_key)
    try:
        email = request.POST['email']
    except KeyError:
        json_res = Utility().compose_json_serialize_response('error', 'failed', {})
        return HttpResponse(json_res ,content_type = 'application/json; charset=utf-8')

    user =  UserAccount().get_useraccount(email = email)
    operator = Operator().get_operator(user_info)

    if not user or not operator:
        json_res = Utility().compose_json_serialize_response('error', 'user not exist', {})
        return HttpResponse(json_res ,content_type = 'application/json; charset=utf-8')

    operator.users.remove(user)

    json_res = Utility().compose_json_serialize_response('ok', 'none', additional_msg)
    return HttpResponse(json_res ,content_type = 'application/json; charset=utf-8')


def operator_add_ticket_count(request):
    additional_msg = {}
    session_manager = SessionManager()
    email, last_session_key = session_manager.get_active_account(request)
    user_info =  UserAccount().get_useraccount(email = email, last_session_key = last_session_key)
    try:
        email = request.POST['email']
        ticket_count = int(request.POST['ticketCount'])
    except KeyError:
        json_res = Utility().compose_json_serialize_response('error', 'failed', {})
        return HttpResponse(json_res ,content_type = 'application/json; charset=utf-8')

    user =  UserAccount().get_useraccount(email = email)
    operator = Operator().get_operator(user)

    if not user or not operator:
        json_res = Utility().compose_json_serialize_response('error', 'user not exist', {})
        return HttpResponse(json_res ,content_type = 'application/json; charset=utf-8')

    operator.ticket_count += ticket_count
    operator.save()

    json_res = Utility().compose_json_serialize_response('ok', 'none', additional_msg)
    return HttpResponse(json_res ,content_type = 'application/json; charset=utf-8')