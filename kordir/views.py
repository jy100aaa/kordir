import datetime
import json
import os
import math
import pytz

from django.shortcuts import render_to_response, render, redirect
from django.http import HttpResponse
from django.views.decorators.cache import never_cache
from django.core import serializers
from django.conf import settings
from django.template.loader import get_template
from django.template import Context, Template, RequestContext
from django.core.serializers.json import DjangoJSONEncoder
from django.utils.safestring import mark_safe
from pytz import timezone
from datetime import timedelta

from kordir.constants import *
from kordir.common import Utility
from kordir.models import UserAccount, Service, ChatCounterpart, ChatMessage, AskBoard, NormalBoard, ProductBoard, ProductBoardLabelValuePair, BoardReply, EmailTrackRecord, Operator
from kordir.service_views import ServiceView
from cachemanager.cachemanager import UserConnectionManager, UserMessageCacheManager, UserAskBoardCacheManager, PreventViewCountManager, ResetPasswordCacheManager
from smsmanager.models import SmsRecord
from sessionmanager.sessionmanager import SessionManager
from htmlmin.decorators import minified_response

@minified_response
@never_cache
def home(request):
    session_manager = SessionManager()
    email, last_session_key = session_manager.get_active_account(request)

    ViewHelper().email_trackrecord(request)

    if email == '' or last_session_key == '':
        return landing(request)
    else:
        return dashboard(request)

@never_cache
def landing(request):
    msg = request.GET.get('msg', '')
    if msg == 'forceout':
        session_key = request.GET.get('sessionKey', '')
        ret = UserConnectionManager().get_force_logout(session_key)
        if ret is not True:
            msg = ''

    ViewHelper().email_trackrecord(request)

    return render_to_response('index.html', {
                                            'contactWidget': True,
                                            'msg': msg,
                                            'page':'index'})
@never_cache
def benefit(request):
    session_manager = SessionManager()
    email, last_session_key = session_manager.get_active_account(request)
    user_info =  UserAccount().get_useraccount(email = email, last_session_key = last_session_key)

    return render_to_response('benefit.html', {
                                            'user_info': user_info,
                                            'page':'benefit'})
@never_cache
def pricing(request):
    session_manager = SessionManager()
    email, last_session_key = session_manager.get_active_account(request)
    user_info =  UserAccount().get_useraccount(email = email, last_session_key = last_session_key)

    return render_to_response('pricing.html', {
                                            'user_info': user_info,
                                            'page':'pricing'})

@never_cache
def company(request):
    session_manager = SessionManager()
    email, last_session_key = session_manager.get_active_account(request)
    user_info =  UserAccount().get_useraccount(email = email, last_session_key = last_session_key)

    return render_to_response('company.html', {
                                            'user_info': user_info,
                                            'page':'company'})

@never_cache
def terms(request):
    session_manager = SessionManager()
    email, last_session_key = session_manager.get_active_account(request)
    user_info =  UserAccount().get_useraccount(email = email, last_session_key = last_session_key)

    return render_to_response('terms.html', {
                                            'user_info': user_info,
                                            'page':'terms'})

@never_cache
def privacy(request):
    session_manager = SessionManager()
    email, last_session_key = session_manager.get_active_account(request)
    user_info =  UserAccount().get_useraccount(email = email, last_session_key = last_session_key)

    return render_to_response('privacy.html', {
                                            'user_info': user_info,
                                            'page':'privacy'})
@never_cache
def robots(request):
    robots = "sitemap: http://kordir.com/sitemap.xml\n"
    robots += "User-Agent: *" + "\n"
    robots += "Allow: /"
    return HttpResponse(robots, content_type='text/plain; charset=utf8')

@never_cache
def sitemap(request):
    return render_to_response('sitemap.xml', content_type='text/xml')

@never_cache
def mgnt(request):
    session_manager = SessionManager()
    email, last_session_key = session_manager.get_active_account(request)

    found = False
    for user in settings.ADMINS:
        if user[1] == email:
            found = True
            break
    if not found:
        return redirect('/')

    user_info =  UserAccount().get_useraccount(email = email, last_session_key = last_session_key)

    if user_info == None:
        return redirect('/')

    operator = Operator.objects.all()
    operators = []
    for o in operator:
        operators.append({
            'email': o.user.email,
            'ticketCount': o.ticket_count
        })
    return render_to_response('admin/management.html', {
                                                        'operators': operators,
                                                        'user_info': user_info
                                                        })

@never_cache
def extend(request):
    session_manager = SessionManager()
    email, last_session_key = session_manager.get_active_account(request)
    user_info =  UserAccount().get_useraccount(email = email, last_session_key = last_session_key)
    if user_info == None:
        return redirect('/')
    operator = Operator().get_operator(user_info)
    if not operator:
        return redirect('/')

    return render_to_response('admin/extend.html', {
        'user_info': user_info,
        'operator': operator
    })

@never_cache
def handler404(request):
    return render(request, 'common/error/404.html', {
                                              'page': '404',
                                              'user_info': None
                                              })

@never_cache
def handler500(request):
    return render(request, 'common/error/500.html', {
                                              'page': '500',
                                              'user_info': None
                                              })

@never_cache
def testview(request):
    page = request.GET.get('page', '')
    return render_to_response(page)

@never_cache
def logout(request):
    session_manager = SessionManager()
    email, last_session_key = session_manager.get_active_account(request)
    if email == '':
        return redirect('/')
    user_info =  UserAccount().get_useraccount(email = email)
    user_info.connection_status = USER_CONNECTION_STATUS_OFFLINE
    user_info.save()
    session_manager.delete_active_account(request)
    return redirect('/')

@minified_response
@never_cache
def login(request):
    session_manager = SessionManager()
    email, last_session_key = session_manager.get_active_account(request)

    if email != '':
        return redirect('/')

    then = request.GET.get('then', '')
    param = request.GET.get('param', '')

    if request.COOKIES.has_key('_email'):
        email = request.COOKIES['_email']
    else:
        email = ''

    return render_to_response('login.html', {
                                             'page':'login',
                                             'then': then,
                                             'param': param,
                                             'email': email
                                               })

@never_cache
def passwordreset(request):
    key = request.GET.get('key', '')
    email = request.GET.get('email', '')
    email = Utility().xor_crypt_string(email, decode = True)
    data = ResetPasswordCacheManager().get_password_reset(key, email)
    expired = False
    email = ''
    key = key
    if data == None:
        expired = True
    else:
        email = data['email']
        ResetPasswordCacheManager().set_password_second_key(key, email)

    return render_to_response('passwordreset.html', {
                                             'page':'passwordreset',
                                             'email': email,
                                             'key': key,
                                             'expired': expired
                                               })

@minified_response
@never_cache
def signup(request):
    session_manager = SessionManager()
    email, last_session_key = session_manager.get_active_account(request)

    if email != '':
        return redirect('/')

    return render_to_response('signup.html', {
                                              'page': 'signup'
                                              })
@minified_response
@never_cache
def signupdone(request):
    session_manager = SessionManager()
    email, last_session_key = session_manager.get_active_account(request)
    user_info =  UserAccount().get_useraccount(email = email, last_session_key = last_session_key)
    if user_info == None:
        return redirect('/')

    from django.utils.timezone import utc
    now = datetime.datetime.utcnow().replace(tzinfo=utc)
    delta = now - user_info.created
    if delta.seconds > 60:
         return redirect('/')

    return render_to_response('signupdone.html', {
                                               'user_info': user_info,
                                              'page': 'signup'
                                              })
@minified_response
@never_cache
def fillinfo(request):
    session_manager = SessionManager()
    email, last_session_key = session_manager.get_active_account(request)

    if email == '':
        return redirect('/')

    user_info =  UserAccount().get_useraccount(email = email, last_session_key = last_session_key)

    if user_info == None:
        return redirect('/')

    if user_info.status & USER_STATUS_FILLINFO_DONE:
        return redirect('/')

    return render_to_response('fillinfo.html', {
                                                'user_info': user_info,
                                                'page': 'fillinfo'
                                                })

@never_cache
def addservice(request):
    session_manager = SessionManager()
    email, last_session_key = session_manager.get_active_account(request)

    if email == '':
        return redirect('/')

    user_info =  UserAccount().get_useraccount(email = email, last_session_key = last_session_key)
    if user_info == None:
        return redirect('/')

    return render_to_response('addservice.html', {
                                                'user_info': user_info,
                                                'page': 'addservice'
                                                })

@never_cache
def settings_page(request):
    session_manager = SessionManager()
    email, last_session_key = session_manager.get_active_account(request)

    nav = request.GET.get('nav', 'my')

    user_info =  UserAccount().get_useraccount(email = email, last_session_key = last_session_key)
    if user_info == None:
        return redirect('/')

    service = user_info.service
    point_record = Service().get_point_record_list(service)

    return render_to_response('settings.html', {
                                                'user_info': user_info,
                                                'page': 'settings',
                                                'service': service,
                                                'point_record': point_record,
                                                'nav': nav
                                                })

@never_cache
def test(request):
    session_manager = SessionManager()
    email, last_session_key = session_manager.get_active_account(request)

    user_info = UserAccount().get_useraccount(email = email, last_session_key = last_session_key)

    return render_to_response('testview.html', {
                                                'user_info': user_info,
                                                'page': 'test'
                                                })
@never_cache
def dashboard(request):
    reqtype = request.GET.get('reqtype', '')
    session_manager = SessionManager()
    email, last_session_key = session_manager.get_active_account(request)
    mstrlgn = session_manager.is_master_login(request)

    user_info =  UserAccount().get_useraccount(email = email, last_session_key = last_session_key)

    if user_info == None:
        if reqtype == 'dashboard':
            user_info = UserAccount().get_useraccount('trial@kordir.com', '')
        elif reqtype == 'dashnav':
            nav = request.GET.get('nav', '')
            return dashnav(request, nav)
        else:
            session_manager.delete_active_account(request)
            return redirect('/')

    expired = False
    if user_info.status & USER_STATUS_FILLINFO_DONE:
        chat_message_marker = UserMessageCacheManager().get_chat_message_marker(user_info.service.id)
        askboard_marker = UserAskBoardCacheManager().get_askboard_marker(user_info.service.id)
        timediff = user_info.service.valid - datetime.datetime.utcnow().replace(tzinfo = pytz.utc)
        days = timediff.days
        hours = int(timediff.seconds/3600)
        point = user_info.service.point
        if user_info.service.valid < datetime.datetime.utcnow().replace(tzinfo = pytz.utc):
            days = 0
            hours = 0
            expired = True
    else:
        chat_message_marker = {}
        askboard_marker = {}
        days = 0
        hours = 0
        point = 0

    if user_info.connection_status == USER_CONNECTION_STATUS_OFFLINE:
        from django.utils.timezone import now
        n = now()
        user_info.service.timestamp = n
        user_info.timestamp = n
        user_info.connection_status = USER_CONNECTION_STATUS_ONLINE
        user_info.save()
        user_info.service.save()

    try:
        tree = json.loads(user_info.service.tree)
    except Exception as e:
        print 'tree parsing error'
        tree = []

    board_node = []
    chat_node = []
    Utility().put_node(tree, board_node, ['board'])
    Utility().put_node(tree, chat_node, ['chat'])

    board_node_length = len(board_node)
    chat_node_length = len(chat_node)

    return render_to_response('dashboard.html',{
                                                'page': 'dashboard',
                                                'user_info': user_info,
                                                'session': last_session_key,
                                                'tree': tree,
                                                'days': days,
                                                'hours': hours,
                                                'point': point,
                                                'expired': expired,
                                                'mstrlgn': mstrlgn,
                                                'board_node_length': board_node_length,
                                                'chat_node_length': chat_node_length,
                                                'askboard_marker': askboard_marker,
                                                'chat_message_marker': chat_message_marker
                                                })
@never_cache
def dashnav(request, nav):
    reqtype = request.GET.get('reqtype', '')
    tz = timezone('Asia/Seoul')
    ITEM_PER_PAGE = 16
    PAGE_LIST_SCALE = 5
    seq = ''
    session_manager = SessionManager()
    email, last_session_key = session_manager.get_active_account(request)

    user_info = UserAccount().get_useraccount(email = email, last_session_key = last_session_key)

    if user_info is None:
        if reqtype.find('dashboard') != -1:
            user_info = UserAccount().get_useraccount('trial@kordir.com', '')
        else:
            return render_to_response('dashboard_endsession.html')

    service = user_info.service

    dict = {}
    dict['user_info'] = user_info
    dict['service'] = service

    try:
        tree = json.loads(user_info.service.tree)
    except Exception as e:
        print 'tree parsing error'
        tree = []

    dict['tree'] = tree

    ip = Utility().get_client_ip(request)

    seq = request.GET.get('seq', '')

    if nav == 'realtime':
        chat_list = []
        Utility().put_node(tree, chat_list, ['chat'])
        if len(chat_list) == 0:
            dict['chat'] = ''
        else:
            dict['chat'] = chat_list[0]['url']

    if nav == 'chat':
        chat_message_marker = UserMessageCacheManager().get_chat_message_marker(user_info.service.id)
        raw_sql = "select * from kordir_chatmessage where id in (select max(id) from kordir_chatmessage where service_id = "+ str(user_info.service.id) +" group by counterpart_id) order by id desc"

        msgs = user_info.service.chatmessages.raw(raw_sql)
        counterpart = None
        msg_list = []
        try:
            counterpart_list = []
            for m in msgs:
                counterpart_list.append(m.counterpart_id)
            counterpart = ChatCounterpart.objects.filter(id__in = counterpart_list)

            for m in msgs:
                msg = {}
                cp = {}
                found = False
                for k in counterpart:
                    if k.id == m.counterpart_id:
                        found = True
                        cp = k
                        break
                if found == False:
                    break

                key = str(m.counterpart_id)
                msg['counterpartId'] = m.counterpart_id
                msg['msg'] = []
                temp = {}
                temp['msg'] = m.msg
                temp['created'] = m.created.astimezone(tz).strftime("%Y-%m-%d %H:%M:%S")
                temp['outgoing'] = m.outgoing
                temp['userId'] = m.user_id
                msg['msg'].append(temp)
                msg['timestamp'] = m.created.astimezone(tz).strftime("%Y-%m-%d %H:%M:%S")
                try:
                    msg['unread'] = chat_message_marker[key]
                except KeyError:
                    msg['unread'] = False
                msg['uniqueKey'] = cp.unique_key
                msg['returning'] = cp.returning
                msg['city'] = cp.city
                msg['countryCode'] = cp.country_code
                msg['deviceType'] = cp.device_type
                msg['pageView'] = cp.page_view
                msg['name'] = cp.name
                msg['contact'] = cp.contact
                msg_list.append(msg)
        except IndexError:
           pass
        from django.core.serializers.json import DjangoJSONEncoder
        dict['msg_list'] = json.dumps(msg_list, cls=DjangoJSONEncoder)
        chat_list = []
        chat_url = []
        Utility().put_node(tree, chat_list, ['chat'])
        for k in chat_list:
            chat_url.append(k['url'])
        dict['chatUrl'] = chat_url

    if nav == "board" and seq == '':
        url = request.GET.get('url', '')
        current_page = request.GET.get('page', '')

        if current_page == '':
            current_page = 1
        else:
            try:
                current_page = int(current_page)
            except ValueError:
                current_page = 1

        filter = request.GET.get('filter', ALL_EXCLUDE_DELETED)
        filter = int(filter)

        tree = service.tree
        tree = json.loads(tree)
        node = Utility().tree_traverse(tree, url)

        if node == None or node['type'] != 'board':
            return render_to_response('dashboard_wrong_page.html', dict)

        tag = node['url']
        if node['kv']['boardType'] == 'ask':
            paginator = Service().get_askboard_paginator(ITEM_PER_PAGE, service, filter, tag)
            nav = 'askboard'
            UserAskBoardCacheManager().remove_askboard_marker(service.id, tag)

        if node['kv']['boardType'] == 'normal':
            paginator = Service().get_normalboard_paginator(ITEM_PER_PAGE, service, tag)
            nav = 'normalboard'
        if node['kv']['boardType'] == 'product':
            ITEM_PER_PAGE = 12
            action = request.GET.get('action', '')
            label = request.GET.getlist('label')
            value = request.GET.getlist('value', '')
            range_label = request.GET.getlist('rangelabel')
            min = request.GET.getlist('min')
            max = request.GET.getlist('max')

            if action == '':
                paginator = Service().get_productboard_paginator(ITEM_PER_PAGE, service, tag)
            else:
                paginator = Service().get_productboard_paginator(ITEM_PER_PAGE, service, tag, label, value, range_label, min, max)

            dict['lvp'] = ProductBoardLabelValuePair().get_label_value_pair(service.id, tag)
            nav = 'productboard'

        total_pages = paginator.num_pages
        count = paginator.count

        if current_page > total_pages:
            return render_to_response('dashboard_wrong_page.html', dict)

        item = paginator.page(current_page)
        paging_tuple = Utility().get_paging_tuple_list(PAGE_LIST_SCALE, total_pages, current_page)

        left_paging_nav = current_page - PAGE_LIST_SCALE
        right_paging_nav = current_page + PAGE_LIST_SCALE

        dict['tag'] = node['url']
        dict['item'] = item
        dict['paging_tuple'] = paging_tuple
        dict['left_paging_nav'] = left_paging_nav
        dict['right_paging_nav'] = right_paging_nav
        dict['total_pages'] = total_pages
        dict['current_page'] = current_page
        dict['filter'] = filter
        dict['title'] = node['title']

    if nav == 'board' and seq is not '':
        url = request.GET.get('url', '')
        service = user_info.service
        tree = service.tree
        tree = json.loads(tree)
        node = Utility().tree_traverse(tree, url)

        if node == None:
            return render_to_response('dashboard_wrong_page.html', dict)

        tag = node['url']

        if node == None:
            return render_to_response('dashboard_wrong_page.html', dict)

        nav = node['kv']['boardType'] + 'boarditem'
        if node['kv']['boardType'] == 'ask':
            boarditem = Service().get_boarditem(service, tag, ASK_BOARD, seq)
            if not boarditem:
                return render_to_response('dashboard_wrong_page.html', dict)
            increase_count = PreventViewCountManager().availability(tag, user_info.service.id, seq, ip)
            if increase_count:
                boarditem.view_num += 1
            if boarditem.mark == True:
                boarditem.mark = False
            boarditem.save()
            dict['board_type'] = ASK_BOARD
        if node['kv']['boardType'] == 'normal':
            boarditem = Service().get_boarditem(service, tag, NORMAL_BOARD, seq)
            if not boarditem:
                return render_to_response('dashboard_wrong_page.html', dict)
            increase_count = PreventViewCountManager().availability(tag, user_info.service.id, seq, ip)
            if increase_count:
                boarditem.view_num += 1
                boarditem.save()
            dict['board_type'] = NORMAL_BOARD
        if node['kv']['boardType'] == 'product':
            boarditem = Service().get_boarditem(service, tag, PRODUCT_BOARD, seq)
            if not boarditem:
                return render_to_response('dashboard_wrong_page.html', dict)
            increase_count = PreventViewCountManager().availability(tag, user_info.service.id, seq, ip)
            if increase_count:
                boarditem.view_num += 1
                boarditem.save()
            slide_picture = []
            gallery = json.loads(boarditem.gallery)
            gallery_thumb = json.loads(boarditem.gallery_thumb)
            idx = 0
            for g in gallery:
                t = (g, gallery_thumb[idx])
                slide_picture.append(t)
                idx += 1
            dict['slide_picture'] = slide_picture
            dict['board_type'] = PRODUCT_BOARD

        dict['seq'] = seq
        dict['boarditem'] = boarditem
        dict['tag'] = node['url']

    if nav == 'productboardedit':
        tag = request.GET.get('url', '')
        seq = request.GET.get('seq', '')
        boarditem = Service().get_boarditem(service, tag, PRODUCT_BOARD, seq)
        slide_picture = []
        gallery = json.loads(boarditem.gallery)
        gallery_thumb = json.loads(boarditem.gallery_thumb)
        idx = 0
        for g in gallery:
            t = (g, gallery_thumb[idx])
            slide_picture.append(t)
            idx += 1
        dict['slide_picture'] = slide_picture
        dict['lvp'] = ProductBoardLabelValuePair().get_label_value_pair(user_info.service.id, tag)
        dict['boarditem'] = boarditem
        dict['tag'] = tag
        dict['seq'] = seq

    if nav == 'productboardwrite':
        tag = request.GET.get('url', '')
        dict['tag'] = tag
        dict['lvp'] = ProductBoardLabelValuePair().get_label_value_pair(user_info.service.id, tag)

    if nav == 'settingmisc':
        misc = json.loads(service.misc)
        dict['misc'] = misc

    if nav == 'smsrecord' or nav == 'requestbox':
        paginator = None
        if nav == 'smsrecord':
            paginator = SmsRecord().get_paginator(service.id, ITEM_PER_PAGE)
        if nav == 'requestbox':
            paginator = Service().get_requestbox_paginator(service, ITEM_PER_PAGE)
        current_page = request.GET.get('page', '')
        if current_page == '':
            current_page = 1
        else:
            try:
                current_page = int(current_page)
            except ValueError:
                current_page = 1
        total_pages = paginator.num_pages
        item = paginator.page(current_page)
        paging_tuple = Utility().get_paging_tuple_list(PAGE_LIST_SCALE, total_pages, current_page)
        left_paging_nav = current_page - PAGE_LIST_SCALE
        right_paging_nav = current_page + PAGE_LIST_SCALE
        dict['item'] = item
        dict['paging_tuple'] = paging_tuple
        dict['left_paging_nav'] = left_paging_nav
        dict['right_paging_nav'] = right_paging_nav
        dict['total_pages'] = total_pages
        dict['current_page'] = current_page

    return render_to_response('dashboard_' + nav + '.html', dict)

class ViewHelper:
    def __init__(self):
        pass

    def email_trackrecord(self, request):
        trackcode = request.GET.get('trackcode', '')
        tracktype = request.GET.get('tracktype', '')
        if trackcode != "":
            EmailTrackRecord().increase_visit(tracktype, trackcode)
