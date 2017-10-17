import datetime
import json
import os
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
from kordir.models import UserAccount, Service, ChatCounterpart, ChatMessage, AskBoard, NormalBoard, ProductBoard, ProductBoardLabelValuePair, BoardReply
from cachemanager.cachemanager import UserConnectionManager, PreventViewCountManager, CaptchaCacheManager, PagePreviewCacheManager, UserAskBoardCacheManager
from analytics.tasks import MarkServiceUserConnectionLogTask 
from filemanager.filemanager import FileManager
from sessionmanager.sessionmanager import SessionManager

class ServiceView:
    def __init__(self):
        pass

    @never_cache
    def interface(self, request, dir = ''):
        domain, name = Utility().process_uri(request)
        if dir is not '':
            if dir[0] != '/' and dir[-1] == '/':
                dir = dir[:-1]
                dir = '/' + dir
        
        if domain == True:
            service = Service().get_service_by_domain_name(name)
        else:
            service = Service().get_service_by_domain_tag(name)
        
        if service == None:
            return ViewHelper().service_fail(request, name)
        
        alwayson =  request.GET.get('alwayson', '')
        try:
            referer = request.META['HTTP_REFERER']
        except KeyError:
            referer = ""
        if service.valid < datetime.datetime.utcnow().replace(tzinfo = pytz.utc):
            referer = referer.replace('http://', '')
            referer = referer.replace('https://', '')
            if len(alwayson) == 0 and referer.split('/')[0].find('kordir.com') == -1:
                return ViewHelper().service_expired(request, service.name)
        
        tree = ViewHelper().get_tree(service)
        misc = ViewHelper().get_misc(service)
                
        if dir == '':
            return ServiceView().main(request, service, tree, misc) 
        
        try:
            dir =  dir.split('/')[-1]
            if '?' in dir:
                dir = dir.split('?')[0]            
            dir = '/' + dir
        except Exception as e:
            return ViewHelper().service_nopage(request, service, dir, tree, misc)
                
        if dir == '/debugview':
            page =  request.GET.get('page', '')
            page = 'service/' + page
            dict = {}
            dict['tree'] = tree
            return render_to_response(page, dict)
        
        node = Utility().tree_traverse(tree, dir)
        
        if node == None:
            return ViewHelper().service_nopage(request, service, dir, tree, misc)
        
        if node['type'] == 'chat':
             return self.chat(request, service, node, tree, misc)
         
        if node['type'] == 'board':
            seq = request.GET.get('seq', '')
            if seq == '':
                return self.board(request, service, node, tree, misc)
            else:
                return self.boarditem(request, service, node, seq, tree, misc)
        
        if node['type'] == 'page':
            return self.page(request, service, node, tree, misc)
        
        return ViewHelper().service_nopage(request, service, dir, tree, misc)
            
    @never_cache
    def main(self, request, service, tree, misc):
        session_manager = SessionManager()
        email, last_session_key = session_manager.get_active_account(request)
        user_info =  UserAccount().get_useraccount(email = email, last_session_key = last_session_key)
        connection_info = ViewHelper().incoming_service_user(request, service.id, '/', service.domain)
        
        node = tree[0]
        dict = {}
        dict['service'] = service
        dict['user_info'] = user_info
        dict['page'] = 'service'
        dict['service_page'] = '/'
        dict['tag'] = '/'
        dict['title'] = node['title']
        dict['connectionInfo'] = connection_info
        dict['tree'] = tree
        dict['misc'] = misc
        dict['mode'] = node['kv']['mode']
        dict['body'] = node['kv']['body']
        dict['type'] = node['type']
        dict['code'] = node['code']
        dict['hasActive'] = Utility().has_active_node(tree)
        dict['backgroundColor'] = node['kv']['backgroundColor']     
        dict['backgroundImageMode'] = node['kv']['backgroundImageMode']
        if node['kv']['backgroundImage'] != "":
            dict['backgroundImage'] = settings.S3_ADDRESS + settings.FILE_LOCATION["BACKGROUND"] + str(service.id) + "/" + node['kv']['backgroundImage']
        else:
            dict['backgroundImage'] = ""
        
        dict['html'] = None
        board_list = []
        ViewHelper().get_boardlist(service, tree, board_list)
        dict['board_list'] = board_list
        
        nowidget = request.GET.get('nowidget', '')
        ViewHelper().process_additional_node_dict(node, dict)
        if nowidget != '':
            dict['contactWidget'] = False
        
        if node['kv']['mode'] == 'html':
            url  = settings.S3_ADDRESS + settings.FILE_LOCATION["PAGE_HTML"] + str(service.id) + '/' + node['kv']['htmlFile']
            dict['html'] = Utility().http_request(None, url)
        
        if connection_info['uniqueKey'] == '':
            unique_key = Utility().generate_random_string(16)
            connection_info['uniqueKey'] = unique_key
            dict['connectionInfo'] = connection_info
            res = render_to_response('service/page.html', 
                                  dict)
            res = session_manager.set_unique_user_key(res, service.id, unique_key)
        else:
            res = render_to_response('service/page.html', 
                                  dict)
        return res
        
    @never_cache
    def page(self, request, service, node, tree, misc):
        session_manager = SessionManager()
        email, last_session_key = session_manager.get_active_account(request)
        user_info =  UserAccount().get_useraccount(email = email, last_session_key = last_session_key)
        connection_info = ViewHelper().incoming_service_user(request, service.id, node['url'], service.domain)
        
        tag = node['url']
        
        dict = {}
        dict['tag'] = node['url']
        dict['title'] = node['title']
        dict['service'] = service
        dict['user_info'] = user_info
        dict['page'] = 'service'
        dict['service_page'] = node['url']
        dict['mode'] = node['kv']['mode']
        dict['body'] = node['kv']['body']
        dict['html'] = None
        dict['type'] = node['type']
        dict['tree'] = tree
        dict['hasActive'] = Utility().has_active_node(tree)
        dict['misc'] = misc
        dict['code'] = node['code']
        dict['backgroundColor'] = node['kv']['backgroundColor']
        dict['backgroundImageMode'] = node['kv']['backgroundImageMode']
        if node['kv']['backgroundImage'] != "":
            dict['backgroundImage'] = settings.S3_ADDRESS + settings.FILE_LOCATION["BACKGROUND"] + str(service.id) + "/" + node['kv']['backgroundImage']
        else:
            dict['backgroundImage'] = ""
        
        if node['kv']['mode'] == 'html':
            url  = settings.S3_ADDRESS + settings.FILE_LOCATION["PAGE_HTML"] + str(service.id) + '/' + node['kv']['htmlFile']
            dict['html'] = Utility().http_request(None, url)
        
        sibling_list = []
        Utility().get_sibling(tree, node['parentId'], node['type'], sibling_list)
        dict['sibling_list'] = sibling_list
        dict['parent'] = Utility().get_parent(tree, node['parentId'])
        
        ViewHelper().process_additional_node_dict(node, dict)

        if connection_info['uniqueKey'] == '':
            unique_key = Utility().generate_random_string(16)
            connection_info['uniqueKey'] = unique_key
            dict['connectionInfo'] = connection_info
            res = render_to_response('service/page.html', 
                                  dict)
            res = session_manager.set_unique_user_key(res, service.id, unique_key)
        else:
            dict['connectionInfo'] = connection_info
            res = render_to_response('service/page.html', 
                                  dict)
        return res
        
    @never_cache
    def chat(self, request, service, node, tree, misc):
        session_manager = SessionManager()
        email, last_session_key = session_manager.get_active_account(request)
        user_info =  UserAccount().get_useraccount(email = email, last_session_key = last_session_key)
        user_id = request.GET.get('userId', None)
        
        connection_info = ViewHelper().incoming_service_user(request, service.id, node['url'], service.domain)
        counterpart = ChatCounterpart().visitor_join(connection_info)
        chat = ChatMessage().get_chatmessage(service.id, counterpart.id)
        
        dict = {}
        dict['title'] = node['title']
        dict['service'] = service
        dict['user_info'] = user_info
        dict['user_id'] = user_id
        dict['counterpart'] = counterpart
        dict['page'] = 'service'
        dict['service_page'] = node['url']
        dict['connectionInfo'] = connection_info
        dict['tree'] = tree
        dict['hasActive'] = Utility().has_active_node(tree)
        dict['misc'] = misc
        dict['showTelephone'] = node['kv']['showTelephone']
        dict['text'] = node['kv']['text']
        dict['code'] = node['code']
        dict['tag'] = node['url']
        dict['chat'] = chat
        dict['backgroundColor'] = node['kv']['backgroundColor']
        dict['backgroundImageMode'] = node['kv']['backgroundImageMode']
        if node['kv']['backgroundImage'] != "":
            dict['backgroundImage'] = settings.S3_ADDRESS + settings.FILE_LOCATION["BACKGROUND"] + str(service.id) + "/" + node['kv']['backgroundImage']
        else:
            dict['backgroundImage'] = ""
        
        ViewHelper().process_additional_node_dict(node, dict)

        if connection_info['uniqueKey'] == '':
            unique_key = Utility().generate_random_string(16)
            connection_info['uniqueKey'] = unique_key
            dict['connectionInfo'] = connection_info
            res = render_to_response('service/chat.html', 
                                  dict)
            res = session_manager.set_unique_user_key(res, service.id, unique_key)
        else:
            res = render_to_response('service/chat.html', 
                                  dict)
        return res
    
    @never_cache
    def board(self, request, service, node, tree, misc):
        session_manager = SessionManager()
        email, last_session_key = session_manager.get_active_account(request)
        user_info =  UserAccount().get_useraccount(email = email, last_session_key = last_session_key)
    
        ITEM_PER_PAGE = 16
        PAGE_LIST_SCALE = 5
        
        current_page =  request.GET.get('page', '')
                
        if current_page == '':
            current_page = 1
        else:
            try:
                current_page = int(current_page)
            except ValueError:
                current_page = 1
        tag = node['url']
        connection_info = ViewHelper().incoming_service_user(request, service.id, tag, service.domain)
        
        dict = {}
        dict['title'] = node['title']
        
        if node['kv']['boardType'] == 'ask':
            filter = request.GET.get('filter', ALL_EXCLUDE_DELETED)
            paginator = Service().get_askboard_paginator(ITEM_PER_PAGE, service, filter, tag)
            page = 'service/askboard.html'
        
        if node['kv']['boardType'] == 'normal':
            paginator = Service().get_normalboard_paginator(ITEM_PER_PAGE, service, tag)
            page = 'service/normalboard.html'
        
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
            page = 'service/productboard.html'
            
        total_pages = paginator.num_pages
        count = paginator.count
        
        if current_page > total_pages:
            return redirect(tag)
        
        item = paginator.page(current_page)
        paging_tuple = Utility().get_paging_tuple_list(PAGE_LIST_SCALE, total_pages, current_page)
                
        left_paging_nav = current_page - PAGE_LIST_SCALE
        right_paging_nav = current_page + PAGE_LIST_SCALE
        
        dict['service'] = service
        dict['user_info'] = user_info
        dict['paging_tuple'] = paging_tuple
        dict['left_paging_nav'] = left_paging_nav
        dict['right_paging_nav'] = right_paging_nav
        dict['total_pages'] = total_pages
        dict['current_page'] = current_page
        dict['item'] = item
        dict['page'] = 'service'
        dict['tag'] = tag
        dict['node'] = node
        dict['service_page'] = node['url']
        dict['connectionInfo'] = connection_info
        dict['tree'] = tree
        dict['hasActive'] = Utility().has_active_node(tree)
        dict['misc'] = misc
        dict['code'] = node['code']
        dict['backgroundColor'] = node['kv']['backgroundColor']
        dict['backgroundImageMode'] = node['kv']['backgroundImageMode']
        if node['kv']['backgroundImage'] != "":
            dict['backgroundImage'] = settings.S3_ADDRESS + settings.FILE_LOCATION["BACKGROUND"] + str(service.id) + "/" + node['kv']['backgroundImage']
        else:
            dict['backgroundImage'] = ""
        
        sibling_list = []
        Utility().get_sibling(tree, node['parentId'], node['type'], sibling_list)
        dict['sibling_list'] = sibling_list
        dict['parent'] = Utility().get_parent(tree, node['parentId'])
        
        ViewHelper().process_additional_node_dict(node, dict)
        
        if connection_info['uniqueKey'] == '':
            unique_key = Utility().generate_random_string(16)
            connection_info['uniqueKey'] = unique_key
            dict['connectionInfo'] = connection_info
            res = render_to_response(page, 
                                  dict)
            res = session_manager.set_unique_user_key(res, service.id, unique_key)
        else:
            res = render_to_response(page, 
                                  dict)
        return res
    
    @never_cache
    def boarditem(self, request, service, node, seq, tree, misc):
        session_manager = SessionManager()
        email, last_session_key = session_manager.get_active_account(request)
        user_info =  UserAccount().get_useraccount(email = email, last_session_key = last_session_key)
        ip = Utility().get_client_ip(request)
 
        page = 'service/' + node['kv']['boardType'] + 'boarditem.html'
        tag = node['url']
        dir = tag + '&seq=' + seq
        
        dict = {}
        dict['title'] = node['title']
        
        if node['kv']['boardType'] == 'ask':
            board_type = ASK_BOARD
            boarditem = Service().get_boarditem(service, tag, board_type, seq)
            temp_key = request.GET.get('tempKey', '')              
            if not boarditem:
                return ViewHelper().service_nopage(request, service, dir, tree, misc)
            access_granted = False
            if boarditem.open == False:
                if user_info != None:
                    if service.id == user_info.service.id:
                        access_granted = True
                else:
                    access_granted = UserAskBoardCacheManager().get_askboard_temporary_key(service.id, seq, tag, temp_key)
            else:
                access_granted = True
            if not access_granted:
                return redirect(node['url'])
            increase_count = PreventViewCountManager().availability(tag, service.id, seq, ip)
            if increase_count:
                boarditem.view_num += 1
            if boarditem.mark == True:
                boarditem.mark = False
            boarditem.save()
        
        if node['kv']['boardType'] == 'normal':
            board_type = NORMAL_BOARD
            boarditem = Service().get_boarditem(service, tag, board_type, seq)              
            if not boarditem:
                 return ViewHelper().service_nopage(request, service, dir, tree, misc)
            increase_count = PreventViewCountManager().availability(tag, service.id, seq, ip)
            if increase_count:
                boarditem.view_num += 1
                boarditem.save()
      
        if node['kv']['boardType'] == 'product':
            board_type = PRODUCT_BOARD
            boarditem = Service().get_boarditem(service, tag, board_type, seq)              
            if not boarditem:
                 return ViewHelper().service_nopage(request, service, dir, tree, misc) 
            increase_count = PreventViewCountManager().availability(tag, service.id, seq, ip)
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
        
        connection_info = ViewHelper().incoming_service_user(request, service.id, node['url'], service.domain)
        
        dict['service'] = service
        dict['user_info'] = user_info
        dict['seq'] = seq
        dict['tag'] = tag
        dict['page'] = 'service'
        dict['node'] = node
        dict['board_type'] = board_type
        dict['boarditem'] = boarditem
        dict['service_page'] = node['url'] + '&seq=' + seq
        dict['connectionInfo'] = connection_info
        dict['tree'] = tree
        dict['hasActive'] = Utility().has_active_node(tree)
        dict['misc'] = misc
        dict['code'] = node['code']
        dict['backgroundColor'] = node['kv']['backgroundColor']
        dict['backgroundImageMode'] = node['kv']['backgroundImageMode']
        if node['kv']['backgroundImage'] != "":
            dict['backgroundImage'] = settings.S3_ADDRESS + settings.FILE_LOCATION["BACKGROUND"] + str(service.id) + "/" + node['kv']['backgroundImage']
        else:
            dict['backgroundImage'] = ""
        
        sibling_list = []
        Utility().get_sibling(tree, node['parentId'], node['type'], sibling_list)
        dict['sibling_list'] = sibling_list
        dict['parent'] = Utility().get_parent(tree, node['parentId'])
                
        ViewHelper().process_additional_node_dict(node, dict)

        if connection_info['uniqueKey'] == '':
            unique_key = Utility().generate_random_string(16)
            connection_info['uniqueKey'] = unique_key
            dict['connectionInfo'] = connection_info
            res = render_to_response(page, 
                                  dict)
            res = session_manager.set_unique_user_key(res, service.id, unique_key)
        else:
            res = render_to_response(page, 
                                  dict)
        return res

    @never_cache
    def robots(self, request):
        domain, name = Utility().process_uri(request)
        
        if domain == True:
            service = Service().get_service_by_domain_name(name)
        else:
            service = Service().get_service_by_domain_tag(name)
        
        if service == None:
            pass
        
        misc = None
        try:
            misc = json.loads(service.misc)
        except Exception as e:
            misc = None
            
        robots = ''
        
        if misc is not None:
            robots = misc['meta']['robots']
        
        return HttpResponse(robots,  content_type="text/plain")
    
    @never_cache
    def sitemap(self, request):
        domain, name = Utility().process_uri(request)
        
        if domain == True:
            service = Service().get_service_by_domain_name(name)
        else:
            service = Service().get_service_by_domain_tag(name)
        
        if service == None:
            pass
        
        misc = None
        try:
            misc = json.loads(service.misc)
        except Exception as e:
            misc = None
        
        xml = ''
        
        if misc is not None:
            xml = misc['meta']['sitemap']
        
        return HttpResponse(xml, content_type ='text/xml')

    @never_cache
    def pagepreview(self, request, key):
        dump, tag = Utility().process_uri(request)
        service = Service().get_service_by_domain_tag(tag)
                
        if service == None:
            return redirect('/')
        
        data = PagePreviewCacheManager().get_pagepreview_data(key)
        
        try:
            node = data['node']
            misc = data['misc']
            tree = data['tree']
            if misc == None:
                misc = ViewHelper().get_misc(service)
            if tree == None:
                tree = ViewHelper().get_tree(service)
                node = tree[0]
        except Exception as e:
            node = None
            misc = ViewHelper().get_misc(service)
            tree = []
             
        dict = {}        
        dict['tag'] = '/' 
        dict['title'] = ''
        dict['service'] = service
        dict['user_info'] = None
        dict['page'] = 'service'
        dict['mode'] = 'editor'
        dict['body'] = "<div class='empty-body'></div>"
        dict['tree'] = tree
        dict['hasActive'] = Utility().has_active_node(tree)
        dict['type'] = 'page'
        dict['misc'] = misc
        dict['html'] = None
        
        if node is not None:
            dict['type'] = node['type']
            dict['body'] = node['kv']['body']
            dict['backgroundColor'] = node['kv']['backgroundColor']
            dict['backgroundImageMode'] = node['kv']['backgroundImageMode']
            if node['kv']['backgroundImage'] != "":
                dict['backgroundImage'] = settings.S3_ADDRESS + settings.FILE_LOCATION["BACKGROUND"] + str(service.id) + "/" + node['kv']['backgroundImage']
            else:
                dict['backgroundImage'] = ""
            
            if node['type'] == 'landing':
                board_list = []
                ViewHelper().get_boardlist(service, tree, board_list)
                dict['board_list'] = board_list
            
        return render_to_response('service/page.html', dict)

class ViewHelper:
    def __init__(self):
        pass
    
    def service_nopage(self, request, service, link, tree, misc):
        session_manager = SessionManager()
        email, last_session_key = session_manager.get_active_account(request)
        user_info = UserAccount().get_useraccount(email = email, last_session_key = last_session_key)
        return render_to_response('service/error/servicenopage.html', {
                                                         'service': service,
                                                         'tree': tree,
                                                         'misc': misc,
                                                         'link': link,
                                                         'user_info': user_info,
                                                         'tag': '/',
                                                         'page': 'servicenopage'
                                                        })
    
    def service_fail(self, request, service_name):
        session_manager = SessionManager()
        email, last_session_key = session_manager.get_active_account(request)    
        user_info =  UserAccount().get_useraccount(email = email, last_session_key = last_session_key)
        return render_to_response('service/error/servicefail.html', {
                                                         'service_name': service_name,
                                                         'user_info': user_info,
                                                         'page': 'servicefail',
                                                         'tag': '/',
                                                        })
        
    def service_expired(self, request, service_name):
        session_manager = SessionManager()
        email, last_session_key = session_manager.get_active_account(request)    
        user_info =  UserAccount().get_useraccount(email = email, last_session_key = last_session_key)
        return render_to_response('service/error/serviceexpired.html', {
                                                         'service_name': service_name,
                                                         'user_info': user_info,
                                                         'page': 'serviceexpired',
                                                         'tag': '/',
                                                        })

    def incoming_service_user(self, request, service_id, page, domain):
        from mobileesp import mdetectinterface
        utility = Utility()
        session_manager = SessionManager()
        ret = {}
        ret['deviceType'] = ''
        ret['ip'] = ''
        ret['ipInfo'] = {}
        ret['uniqueKey'] = ''
        ret['newVisitor'] = ''
        ret['ref'] = ''
        ret['human'] = False
        ret['serviceId'] = service_id
        keyword = ret['keyword'] = ''
        ret['pageViewNum'] = 0
        unique_key = ''
                
        if utility.cookie_available(request) == True and utility.is_human_request(request) == True:
            ref = utility.get_referral(request, domain)
            try:
                if ref.find('kordir.com') != -1:
                    ref = ''
            except Exception as e:
                pass
            ret['ref'] = ref
            keyword = ret['keyword'] = utility.get_keyword(request)
    
            ret['ip'] = ip = utility.get_client_ip(request)
            ret['deviceType'] = device_type = mdetectinterface.process_request(request)
            ret['ipInfo'] = ip_info = UserConnectionManager().get_ip_information(ip)
            unique_key = session_manager.get_unique_user_key(request, service_id)
                                
            page_view_num = UserConnectionManager().get_page_view_number(service_id, unique_key)
            ret['pageViewNum'] = page_view_num
            if page_view_num > 1:
                new_visitor = False
            else:
                new_visitor = True
            MarkServiceUserConnectionLogTask.delay(service_id, page, ip, device_type, ref, keyword, new_visitor)
            ret['human'] = True
            ret['newVisitor'] = new_visitor
            ret['uniqueKey'] = unique_key
    
        return ret
    
    def get_tree(self, service):
        try:
            tree = json.loads(service.tree)
        except Exception as e:
            tree = []
        return tree
    
    def get_misc(self, service):
        try:
            misc = json.loads(service.misc)
        except Exception as e:
            misc = {}
        return misc
    
    def process_additional_node_dict(self, node, dict):
        contact_widget = False
        try:
            contact_widget = node['contactWidget']
        except KeyError:
            pass
        dict['contactWidget'] = contact_widget
        return
        
    def get_boardlist(self, service, tree, board_list):
        board_node = []
        Utility().put_node(tree, board_node, ['board'])
        
        width = 0
        for counter, n in enumerate(board_node):
            if n['kv']['showboard'] == True:
                boardinfo = {}
                board_type = n['kv']['boardType']
                
                if board_type == 'ask':
                    board_type = ASK_BOARD
                    width = width + 480
                elif board_type == 'product':
                    board_type = PRODUCT_BOARD
                    width = 960
                elif board_type == 'normal':
                    board_type = NORMAL_BOARD
                    width = width + 480
                
                if board_type == PRODUCT_BOARD:
                    boardinfo['margin'] = False
                    width = 0
                else:
                    if width == 480:
                        boardinfo['margin'] = False
                    else:
                        width = 0 
                        boardinfo['margin'] = True 
                try:
                    boardinfo['displayType'] = n['kv']['displayType']
                except KeyError:
                    boardinfo['displayType'] = 0
                
                boardinfo['name'] = n['nodeName']
                boardinfo['type'] = board_type
                boardinfo['tag'] = n['url']
                if board_type == ASK_BOARD:
                    paginator = Service().get_askboard_paginator(5, service, ALL_EXCLUDE_DELETED ,boardinfo['tag'])
                elif board_type == PRODUCT_BOARD:
                    paginator = Service().get_productboard_paginator(8, service, boardinfo['tag'])
                elif board_type == NORMAL_BOARD:
                    paginator = Service().get_normalboard_paginator(5, service, boardinfo['tag'])
                boardinfo['item'] =  paginator.page(1)        
                board_list.append(boardinfo)
              
        
@never_cache
def handler404(request):
    return render(request, 'service/error/service404.html', {
                                              'page': '404',
                                              'user_info': None
                                              })
@never_cache
def handler500(request):
    return render(request, 'service/error/service500.html', {
                                              'page': '500',
                                              'user_info': None
                                              })
