from celery.task import Task
from celery.registry import tasks
from smsmanager import SmsManager

class SendAuthKeyTask(Task):
    def run(self, mobile, key, user_id, ip):
        SmsManager().send_auth_message(mobile, key, user_id, ip)
        return True

class SendAskBoardRegisterMessageTask(Task):
    def run(self, service, name, mobile, ip):
        SmsManager().send_askboard_register_message(service, name, mobile, ip)
        return True

class SendAskBoardReplyMessageTask(Task):
    def run(self, service, name, mobile):
        SmsManager().send_askboard_reply_message(service, name, mobile)
        return True

class SendRequestBoxMessageTask(Task):
    def run(self, service, name, ip):
        SmsManager().send_requestbox_register_message(service, name, ip)
        return True

class SendBankAccountInfo(Task):
    def run(self, user_id, mobile, ip):
        SmsManager().send_bank_account_info(user_id, mobile, ip)
        return True

class SendSmsRequest(Task):
    def run(self, msg, sender, receiver, service_id, ip):
        SmsManager().send_sms_request(msg, sender, receiver, service_id, ip)
        return True

class SendPutPointDone(Task):
    def run(self, service_id, number, point):
        SmsManager().send_put_point_done(service_id, number, point)
        return True

tasks.register(SendAuthKeyTask)
tasks.register(SendAskBoardRegisterMessageTask)
tasks.register(SendAskBoardReplyMessageTask)
tasks.register(SendRequestBoxMessageTask)
tasks.register(SendBankAccountInfo)
tasks.register(SendSmsRequest)
tasks.register(SendPutPointDone)