# -*- coding: utf-8 -*-
from django.core.mail import EmailMultiAlternatives
from django.template.loader import get_template
from django.template import Context, Template
from django.conf import settings
from kordir.common import Utility
from kordir.constants import *
from kordir.models import EmailTrackRecord, Operator

import random
import string
import json

class EmailManager:
    TEAM_EMAIL = "KORDIR Team <no-reply@kordir.com>"
    EMAIL_TYPE = {
                  "WELCOME": "0000",
                  "PASSWORD": "0001",
                  "ASKBOARD": "0010",
                  "REQUESTBOX": "0011",
                  "REQUESTTRANSACTIONCHECK": "0100",
                  "KEYVALUEREGISTERED": "0101"
                  }

    def __init__(self):
        pass

    def send_welcome_email(self, email, fullname, user_id):
       subject = "KORDIR에 가입해 주셔서 감사합니다."
       from_email = self.TEAM_EMAIL
       plaintext = get_template('email/welcome.txt')
       htmly = get_template('email/welcome.html')

       code = Utility().generate_random_string(15)
       type = self.EMAIL_TYPE["WELCOME"]

       d = Context({'name':fullname,
                    'trackcode': code,
                    'tracktype': type})

       text_content = plaintext.render(d)
       html_content = htmly.render(d)
       msg = EmailMultiAlternatives(subject, text_content, from_email, [email])
       msg.attach_alternative(html_content, "text/html")
       msg.send()

       EmailTrackRecord().create_email_track_record(user_id, type, code)

       return True

    def send_password_reset_email(self, email, name, link, user_id):
        subject = "[KORDIR] 비밀번호 리셋 안내"
        from_email = self.TEAM_EMAIL
        plaintext = get_template('email/password.txt')
        htmly = get_template('email/password.html')

        code = Utility().generate_random_string(15)
        type = self.EMAIL_TYPE["PASSWORD"]

        d = Context({'name': name,
                     'link': link,
                     'trackcode': code,
                     'tracktype': type})

        text_content = plaintext.render(d)
        html_content = htmly.render(d)
        msg = EmailMultiAlternatives(subject, text_content, from_email, [email])
        msg.attach_alternative(html_content, "text/html")
        msg.send()

        EmailTrackRecord().create_email_track_record(user_id, type, code)

        return True

    def send_askboard_register_email(self, service, name, title, body, tag):
        subject_text = [
                        u'[KORDIR] ',
                        name,
                        u'님이 문의글을 남기셨습니다.'
                        ]
        subject = u''.join(subject_text)

        if service.domain == "":
            link_list = [
                         u'http://',
                         service.tag,
                         u'.',
                         settings.SIMPLE_MAIN_SERVER,
                         tag
                         ]
        else:
            link_list = [service.domain, tag]
        link = u''.join(link_list)

        from_email = self.TEAM_EMAIL

        plaintext = get_template('email/askboardregistered.txt')
        htmly = get_template('email/askboardregistered.html')

        code = Utility().generate_random_string(15)
        type = self.EMAIL_TYPE["ASKBOARD"]

        d = Context({
                     'body': body,
                     'title': title,
                     'link': link,
                     'trackcode': code,
                     'tracktype': type
                     })
        text_content = plaintext.render(d)
        html_content = htmly.render(d)

        email = []

        represent_id = 0

        for u in service.users.all():
            if u.notification & NOTIFICATION_ALLOW_ASKBOARD_EMAIL:
                email.append(u.email)
                if represent_id == 0:
                    represent_id = u.id

        if len(email) != 0:
            msg = EmailMultiAlternatives(subject, text_content, from_email, email)
            msg.attach_alternative(html_content, "text/html")
            msg.send()

            EmailTrackRecord().create_email_track_record(represent_id, type, code)

        return True

    def send_requestbox_register_email(self, service, name, title, body, email):
        subject_text = [
                        u'[KORDIR] ',
                        name,
                        u'님이 문의 메일을 보내셨습니다.'
                        ]
        subject = u''.join(subject_text)

        from_email = self.TEAM_EMAIL

        plaintext = get_template('email/requestboxregistered.txt')
        htmly = get_template('email/requestboxregistered.html')

        code = Utility().generate_random_string(15)
        type = self.EMAIL_TYPE["REQUESTBOX"]

        d = Context({
                     'body': body,
                     'name': name,
                     'email': email,
                     'title': title,
                     'trackcode': code,
                     'tracktype': type
                     })

        text_content = plaintext.render(d)
        html_content = htmly.render(d)

        email = []

        represent_id = 0

        for u in service.users.all():
            if u.notification & NOTIFICATION_ALLOW_REQUESTBOX_EMAIL:
                email.append(u.email)
                if represent_id == 0:
                    represent_id = u.id

        if len(email) != 0:
            msg = EmailMultiAlternatives(subject, text_content, from_email, email)
            msg.attach_alternative(html_content, "text/html")
            msg.send()

            EmailTrackRecord().create_email_track_record(represent_id, type, code)

        return True

    def send_request_transaction_check_email(self, service_id, user_id, fullname, email, amount):
        subject = "[KORDIR] 입금확인요청"
        from_email = self.TEAM_EMAIL
        plaintext = get_template('email/requesttransactioncheck.txt')
        htmly = get_template('email/requesttransactioncheck.html')

        type = self.EMAIL_TYPE["REQUESTTRANSACTIONCHECK"]

        d = Context({'service_id': service_id,
                     'fullname': fullname,
                     'email': email,
                     'amount': amount})

        text_content = plaintext.render(d)
        html_content = htmly.render(d)

        recipient = Operator().get_email_recipient(service_id)

        for user in settings.ADMINS:
            recipient.append(user[1])

        msg = EmailMultiAlternatives(subject, text_content, 'support@kordir.com', recipient)
        msg.attach_alternative(html_content, "text/html")
        msg.send()

        EmailTrackRecord().create_email_track_record(user_id, type, '')
        return True

    def send_keyvalue_registered_email(self, key, value, email):
        subject = "[KORDIR] Key-Value Registered"
        from_email = self.TEAM_EMAIL
        plaintext = get_template('email/keyvalue.txt')
        htmly = get_template('email/keyvalue.html')
        type = self.EMAIL_TYPE["KEYVALUEREGISTERED"]

        str = ''
        for k in value:
            str += k + ' - ' + value[k] + '<br>'

        d = Context({
                     'title': subject,
                     'key': key,
                     'value': str
                     })
        text_content = plaintext.render(d)
        html_content = htmly.render(d)
        from_email = self.TEAM_EMAIL
        msg = EmailMultiAlternatives(subject, text_content, from_email, email)
        msg.attach_alternative(html_content, "text/html")
        msg.send()
        return True