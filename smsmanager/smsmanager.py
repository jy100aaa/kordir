# -*- coding: utf-8 -*-
from conf import *
from kordir.constants import *
from models import SmsRecord

import httplib
import json

class SmsManager():
    def __init__(self):
        pass

    def send_auth_message(self, mobile, key, user_id, ip):
        sendstr = "[KORDIR] 인증번호 ( " + key + " ) 를 입력해주세요"
        unistr = unicode(sendstr, 'utf8')
        value = {
            'sender': SMS_SENDER,
            'receivers': [mobile],
            'content': unistr
        }
        c = httplib.HTTPSConnection(SMS_ADDRESS)
        data = json.dumps(value, ensure_ascii=False).encode('utf-8')
        c.request("POST", SMS_PATH, data, SMS_HEADER)
        r = c.getresponse()
        if r.reason == "OK":
            SmsRecord().add_record(0, user_id, mobile, ip, 'auth', unistr)

    def send_askboard_register_message(self, service, name, mobile, ip):
        service_id = service.id
        service_name = service.name
        if service.telephone == '':
            u = service.users.all()[0]
            sms_sender = u.telephone
        else:
            sms_sender = service.telephone
        ## send to admin
        user_mobile = []
        for u in service.users.all():
            if u.notification & NOTIFICATION_ALLOW_ASKBOARD_SMS and len(u.telephone) > 0:
                user_mobile.append(u.telephone)

        if len(user_mobile) > 0:
            text = [
                     u'[',
                     service_name,
                     u'] ',
                     name,
                     u'님이 문의 요청을 남기셨습니다'
                     ]
            sendstr = u''.join(text)
            unistr = sendstr
            value = {
                'sender': SMS_SENDER,
                'receivers': user_mobile,
                'content': unistr
            }
            data = json.dumps(value, ensure_ascii=False).encode('utf-8')
            c = httplib.HTTPSConnection(SMS_ADDRESS)
            c.request("POST", SMS_PATH, data, SMS_HEADER)
            r = c.getresponse()
            if r.reason == "OK":
                for um in user_mobile:
                    SmsRecord().add_record(service_id, 0, um, 0, 'ask-admin', unistr)
            print r

    def send_askboard_reply_message(self, service, name, mobile):
        if len(mobile) == 0:
            return
        service_name = service.name
        service_id = service.id
        if service.telephone == '':
            u = service.users.all()[0]
            sms_sender = u.telephone
        else:
            sms_sender = service.telephone
        text = [
                u'[',
                service_name,
                u'] ',
                name,
                u'님의 글에 답변이 등록됐습니다.'
                ]
        sendstr = u''.join(text)
        unistr = sendstr
        value = {
            'sender': SMS_SENDER,
            'receivers': [mobile],
            'content': unistr
        }
        data = json.dumps(value, ensure_ascii=False).encode('utf-8')
        c = httplib.HTTPSConnection(SMS_ADDRESS)
        c.request("POST", SMS_PATH, data, SMS_HEADER)
        r = c.getresponse()
        if r.reason == "OK":
            SmsRecord().add_record(service_id, 0, mobile, 0, 'ask-reply', unistr)
        print r

    def send_requestbox_register_message(self, service, name, ip):
        service_id = service.id
        service_name = service.name
        if service.telephone == '':
            u = service.users.all()[0]
            sms_sender = u.telephone
        else:
            sms_sender = service.telephone
        ## send to admin
        user_mobile = []
        for u in service.users.all():
            if u.notification & NOTIFICATION_ALLOW_REQUESTBOX_SMS:
                user_mobile.append(u.telephone)

        if len(user_mobile) > 0:
            text = [
                     u'[',
                     service_name,
                     u'] ',
                     name,
                     u'님이 문의 요청을 남기셨습니다'
                     ]
            sendstr = u''.join(text)
            unistr = sendstr
            value = {
                'sender': SMS_SENDER,
                'receivers': user_mobile,
                'content': unistr
            }
            data = json.dumps(value, ensure_ascii=False).encode('utf-8')
            c = httplib.HTTPSConnection(SMS_ADDRESS)
            c.request("POST", SMS_PATH, data, SMS_HEADER)
            r = c.getresponse()
            if r.reason == "OK":
                for um in user_mobile:
                    SmsRecord().add_record(service_id, 0, um, 0, 'requestbox-admin', unistr)
            print r

    def send_bank_account_info(self, user_id, mobile, ip):
        sendstr = "[KORDIR]\n계좌번호: 1005-502-691281\n은행: 우리은행\n예금주: 진장연(코디알)"
        unistr = unicode(sendstr, 'utf8')
        value = {
            'sender': SMS_SENDER,
            'receivers': [mobile],
            'content': unistr
        }

        c = httplib.HTTPSConnection(SMS_ADDRESS)
        data = json.dumps(value, ensure_ascii=False).encode('utf-8')
        c.request("POST", SMS_PATH, data, SMS_HEADER)
        r = c.getresponse()
        if r.reason == "OK":
            SmsRecord().add_record(0, user_id, mobile, ip, 'account-info', unistr)
            print r

    def send_sms_request(self, msg, sender, receiver, service_id, ip):
        text = [
                    msg,
                    u'[',
                    sender,
                    u']'
                ]
        unistr = u''.join(text)
        value = {
            'sender': SMS_SENDER,
            'receivers': receiver,
            'content': unistr
        }

        c = httplib.HTTPSConnection(SMS_ADDRESS)
        data = json.dumps(value, ensure_ascii=False).encode('utf-8')
        c.request("POST", SMS_PATH, data, SMS_HEADER)
        r = c.getresponse()
        if r.reason == "OK":
            SmsRecord().add_record(service_id, 0, sender, ip, 'sms-request', unistr)
            print r

    def send_put_point_done(self, service_id, number, valid_until):
        text = [
                    u'[KORDIR] ',
                    valid_until,
                    u' 까지 사용기간이 연장되었습니다. 감사합니다.',
                ]
        unistr = u''.join(text)
        value = {
            'sender': SMS_SENDER,
            'receivers': number,
            'content': unistr
        }

        c = httplib.HTTPSConnection(SMS_ADDRESS)
        data = json.dumps(value, ensure_ascii=False).encode('utf-8')
        c.request("POST", SMS_PATH, data, SMS_HEADER)
        r = c.getresponse()
        if r.reason == "OK":
            SmsRecord().add_record(service_id, 0, SMS_SENDER, 0, 'putpoint', unistr)
            print r