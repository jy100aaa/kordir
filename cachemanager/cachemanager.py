from django.core.cache import cache, get_cache
from django.utils.timezone import now
import datetime
import json

def get_remote_cache():
    try:
        return get_cache('remote')
    except Exception as e:
        print e
        return cache

class ResetPasswordCacheManager:
    PASSWORD_RESET = "PASSWORD_RESET"
    PASSWORD_RESET_TIME = 60 * 60 * 12
    PASSWORD_RESET_SECOND = "PASSWORD_RESET_SECOND"
    PASSWORD_RESET_SECOND_TIME = 60 * 30
    
    def __init__(self):
        pass
    def set_password_reset(self, param):
        cache = get_remote_cache()
        key = self.PASSWORD_RESET + '-' + param['email']
        cache.set(key, param, self.PASSWORD_RESET_TIME)
        
    def get_password_reset(self, stored_key, email):
        cache = get_remote_cache()
        key = self.PASSWORD_RESET + '-' + email
        r = cache.get(key)
        try:
            if r['resetKey'] == stored_key and r['email'] == email:
                cache.delete(key)
                return r
        except Exception as e:
            return None
    
    def set_password_second_key(self, key, email):
        cache = get_remote_cache()
        key =  self.PASSWORD_RESET_SECOND + '-' + key
        cache.set(key, email, self.PASSWORD_RESET_SECOND_TIME)
        
    def check_password_second_key(self, key, email):
        cache = get_remote_cache()
        key =  self.PASSWORD_RESET_SECOND + '-' + key
        r = cache.get(key)
        if r == None:
            return False
        else:
            if r == email:
                return True
            else:
                return False

class UserConnectionManager:  
     ## 30 days 
    SERVICE_USER_IP_INFORMATION = 'SERVICE_USER_IP_INFORMATION'
    SERVICE_USER_IP_INFORMATION_TIME = 60 * 60 * 24 * 30
    PAGE_VIEW_NUMBER = 'PAGE_VIEW_NUMBER'
    PAGE_VIEW_NUMBER_TIME = 60 * 60 * 24 * 30
    FORCE_LOGOUT = "FORCE_LOGOUT"
    FORCE_LOGOUT_TIME = 10
       
    def __init(self):
        pass
   
    ## distinguish between forced logged out and other
    def set_force_logout(self, session_key):
        cache = get_remote_cache()
        key = self.FORCE_LOGOUT + '-' + session_key
        cache.set(key, True, self.FORCE_LOGOUT_TIME)
        
    def get_force_logout(self, session_key):
        cache = get_remote_cache()
        key = self.FORCE_LOGOUT + '-' + session_key
        fl = cache.get(key)
        if fl == True:
            cache.delete(key)
            return True
        else:
            return False    
    
    def set_ip_information(self, ip, param):
        cache = get_remote_cache()
        key = self.SERVICE_USER_IP_INFORMATION + '-' +ip
        cache.set(key, param, self.SERVICE_USER_IP_INFORMATION_TIME)
        print 'set_ip_information'
        
    def get_ip_information(self, ip):
        cache = get_remote_cache()
        key = self.SERVICE_USER_IP_INFORMATION + '-' + ip
        print 'get_ip_information'
        return cache.get(key)
    
    def get_page_view_number(self, service_id, unique_key):
        cache = get_remote_cache()
        key = self.PAGE_VIEW_NUMBER + '-' + str(service_id) + '-' +unique_key
        number = cache.get(key)
        self.set_page_view_number(service_id, unique_key)
        if number == None:
            return 1
        else:
            return number
        
    def set_page_view_number(self, service_id, unique_key):
        cache = get_remote_cache()
        key = self.PAGE_VIEW_NUMBER + '-' + str(service_id) + '-' +unique_key
        number = cache.get(key)
        if number == None:
            cache.set(key, 1, self.PAGE_VIEW_NUMBER_TIME)
        else:
            cache.set(key, number + 1, self.PAGE_VIEW_NUMBER_TIME)
    
class CaptchaCacheManager:
    CAPTCHA = "CAPTCHA"
    CAPTCHA_TIME = 60*60*6
    
    def set_captcha(self, unique_key, value):
        cache = get_remote_cache()
        key = self.CAPTCHA + '-' + unique_key
        cache.set(key, value, self.CAPTCHA_TIME)
    
    def get_captcha(self, unique_key):
        cache = get_remote_cache()
        key = self.CAPTCHA + '-' + unique_key
        return cache.get(key)


class UserAskBoardCacheManager:
    ASKBOARD_MARKER = 'ASK_BOARD_NEW_MESSAGE_MARKER'
    ASKBOARD_MARKER_TIME = 0
    
    ASKBOARD_TEMPORARY_KEY = 'ASK_BOARD_TEMPORARY_KEY'
    ASKBOARD_TEMPORARY_KEY_TIME = 60 * 3
    
    def __init__(self):
        pass
    
    def mark_askboard_marker(self, service_id, url):
        cache = get_remote_cache()
        marker_key = self.ASKBOARD_MARKER + '-' + str(service_id)
        marker = cache.get(marker_key)
        if marker == None:
            cache.set(marker_key, {url: True}, self.ASKBOARD_MARKER_TIME)
        else:
            marker[url] = True
            cache.set(marker_key, marker, self.ASKBOARD_MARKER_TIME)
    
    def remove_askboard_marker(self, service_id, url):
        cache = get_remote_cache()
        marker_key = self.ASKBOARD_MARKER + '-' + str(service_id)
        marker = cache.get(marker_key)
        if marker != None:
            try:
                del marker[url]
                if marker:
                    cache.set(marker_key, marker, self.ASKBOARD_MARKER_TIME)
                else:
                    cache.delete(marker_key)
            except keyError:
                cache.delete(marker_key)
    
    def get_askboard_marker(self, service_id):
        cache = get_remote_cache()
        marker_key = self.ASKBOARD_MARKER + '-' + str(service_id)
        marker_list = cache.get(marker_key)
        if marker_list == None:
            marker_list = {}
        return marker_list

    def set_askboard_temporary_key(self, service_id, seq, tag, temp_key):
        cache = get_remote_cache()
        key = self.ASKBOARD_TEMPORARY_KEY + '-' + str(service_id) + '-' + str(seq) + '-' + tag + '-' + temp_key
        cache.set(key, True, self.ASKBOARD_TEMPORARY_KEY_TIME)
    
    def get_askboard_temporary_key(self, service_id, seq, tag, temp_key):
        cache = get_remote_cache()
        key = self.ASKBOARD_TEMPORARY_KEY + '-' + str(service_id) + '-' + str(seq) + '-' + tag + '-' + temp_key
        value = cache.get(key)
        if value == None:
            return False
        else:
            return True
        
class UserMessageCacheManager:
    CHAT_MESSAGE_MARKER = 'CHAT_MESSAGE_MARKER'
    CHAT_MESSAGE_MARKER_TIME = 0
   
    def __init(self):
        pass
    
    def mark_chat_message_marker(self, service_id, counterpart_id):
        cache = get_remote_cache()
        marker_key = self.CHAT_MESSAGE_MARKER + '-' + str(service_id)
        marker = cache.get(marker_key)
        if marker == None:
            cache.set(marker_key, {str(counterpart_id): True}, self.CHAT_MESSAGE_MARKER_TIME)
        else:
            marker[str(counterpart_id)] = True
            cache.set(marker_key, marker, self.CHAT_MESSAGE_MARKER_TIME)
            
    def remove_chat_message_marker(self, service_id, counterpart_id):
        cache = get_remote_cache()
        marker_key = self.CHAT_MESSAGE_MARKER + '-' + str(service_id)
        marker = cache.get(marker_key)
        if marker != None:
            try:
                del marker[str(counterpart_id)]
                if marker:
                    cache.set(marker_key, marker, self.CHAT_MESSAGE_MARKER_TIME)
                else:
                    cache.delete(marker_key)
            except KeyError:
                cache.delete(marker_key)
            
    def get_chat_message_marker(self, service_id):
        cache = get_remote_cache()
        marker_key = self.CHAT_MESSAGE_MARKER + '-' + str(service_id)
        marker_list = cache.get(marker_key)
        if marker_list == None:
            marker_list = {}
        return marker_list

class PreventViewCountManager:
    PREVENT_VIEW_COUNT_KEY = 'PREVENT-VIEW-COUNT'
    PREVENT_VIEW_COUNT_TIME = 60 * 60 * 1
    
    def availability(self, board, service_id ,seq, ip):
        cache = get_remote_cache()
        key = self.PREVENT_VIEW_COUNT_KEY + '-'  + board + '-' + str(service_id) + '-' +str(seq) + '-' + ip
        value = cache.get(key)
        if value == None:
            cache.set(key, True, self.PREVENT_VIEW_COUNT_TIME)
            return True
        else:
            return False

class PreventSpamManager:
    PREVENT_SPAM = "PREVENT-SPAM"
    PREVENT_SPAM_TIME = 60 * 60 * 24
    PREVENT_SPAM_DAILY_QUOTA = 3
    
    def availability(self, service_id, ip, type):
        import time
        cache = get_remote_cache()
        key = self.PREVENT_SPAM + '-' + str(service_id) + '-' + ip + '-' + type
        value = cache.get(key)
        if value == None:
            value = {}
            value['ts'] = time.time()
            value['count'] = 1
            cache.set(key, value, self.PREVENT_SPAM_TIME)
            return (True, 0)
        else:
            if value['count'] >=  self.PREVENT_SPAM_DAILY_QUOTA:
                mingap = (time.time() - value['ts']) / 100000
                remaining_min = 24*60 - int(mingap)
                return (False, remaining_min)
            else:
                value['count'] += 1
                value['ts'] = time.time()
                cache.set(key, value, self.PREVENT_SPAM_TIME)
                return (True, 0)

        
class MobileAuthCacheManager:
    MOBILE_AUTH = "MOBILE-AUTH"
    MOBILE_AUTH_TIME = 60*60*3
    
    def set_authkey(self, key, value):
        cache = get_remote_cache()
        key = self.MOBILE_AUTH + '-' + key
        cache.set(key, value, self.MOBILE_AUTH_TIME)
    
    def get_authkey(self, key):
        cache = get_remote_cache()
        key = self.MOBILE_AUTH + '-' + key
        return cache.get(key)
    
class PagePreviewCacheManager:
    PAGE_PREVIEW = "PAGE-PREVIEW"
    PAGE_PREVIEW_TIME = 60
    
    def set_pagepreview_data(self, key, value):
        cache = get_remote_cache()
        key = self.PAGE_PREVIEW + '-' + key
        cache.set(key, value, self.PAGE_PREVIEW_TIME)
        
    def get_pagepreview_data(self, key):
        cache = get_remote_cache()
        key = self.PAGE_PREVIEW + '-' + key
        return cache.get(key)
