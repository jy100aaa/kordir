from django.contrib.sessions.models import Session
from django.contrib.sessions.backends.db import SessionStore
from kordir.common import Utility
from kordir.models import UserAccount
import json

### SESSION COOKIE MANAGEMENT
class SessionManager:    
    SESSION_LAST = 60 * 60 * 24 * 30
    UNIQUE_KEY_LAST = 60 * 60 * 24 * 30
    MASTERLOGIN_LAST = 60 * 60 * 24
    MASTERLOGIN_KEY = 'MSTRLGN'
    
    def __init__(self):
        pass
    
    def set_active_account(self, request, email, remember, force_lastsession):
        import random, string
        if len(force_lastsession) == 0:
            lastsession = Utility().generate_random_string(16)
        else:
            lastsession = force_lastsession
        request.session['active-account'] = email
        request.session['session-key'] = lastsession
        UserAccount().write_session_key(email, lastsession)    
        if remember == True:            
            request.session.set_expiry(self.SESSION_LAST)
        else:
            request.session.set_expiry(0)
    
    def delete_active_account(self, request):
        if 'active-account' in request.session:
            del request.session['active-account']
        if 'session-key' in request.session:
            del request.session['session-key']
        request.session.modified = True
    
    def get_active_account(self, request):
        if 'active-account' not in request.session or 'session-key' not in request.session:
            return ('', '')
        else:
            return (request.session['active-account'], request.session['session-key'])
         
    def set_unique_user_key(self, response, service_id, unique_key):
        key = 'unique-user-key-' + str(service_id)
        response.set_cookie(key, unique_key, self.UNIQUE_KEY_LAST)
        return response

    def get_unique_user_key(self, request, service_id):
        key = 'unique-user-key-' + str(service_id)
        if request.COOKIES.has_key(key):
            return request.COOKIES[key]
        else:
            return ''
        
    def set_master_login_cookie(self, response):
        response.set_cookie(self.MASTERLOGIN_KEY, 'true', self.MASTERLOGIN_LAST)
        return response

    def delete_master_login_cookie(self, response):
        response.delete_cookie(self.MASTERLOGIN_KEY)
        return response
    
    def is_master_login(self, request):
        if request.COOKIES.has_key(self.MASTERLOGIN_KEY):
            masterlogin = request.COOKIES[self.MASTERLOGIN_KEY]
            if masterlogin == 'true':
                return True
            else:
                return False
        else:
            return False