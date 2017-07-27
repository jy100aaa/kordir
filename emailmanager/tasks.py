from celery.task import Task
from celery.registry import tasks
from emailmanager import EmailManager

class SendWelcomeEmailTask(Task):
    def run(self, email, fullname, user_id):
        email_manager = EmailManager()
        email_manager.send_welcome_email(email, fullname, user_id)
        return True

class SendPasswordResetEmailTask(Task):
    def run(self, email, name, link, user_id):
        email_manager = EmailManager()
        email_manager.send_password_reset_email(email, name, link, user_id)
        return True

class SendAskboardRegisterEmailTask(Task):
    def run(self, service, name, title, body, tag):
        email_manager = EmailManager()
        email_manager.send_askboard_register_email(service, name, title, body, tag)
        return True
    
class SendRequetBoxEmailTask(Task):
    def run(self, service, name, title, body, email):
        email_manager = EmailManager()
        email_manager.send_requestbox_register_email(service, name, title, body, email)
        return True

class SendRequestTransactionCheckEmailTask(Task):
    def run(self, service_id, user_id, fullname, email, amount):
        email_manager = EmailManager()
        email_manager.send_request_transaction_check_email(service_id, user_id, fullname, email, amount)
        return True

class SendKeyValueRegisteredEmailTask(Task):
    def run(self, key, value, email):
        email_manager = EmailManager()
        email_manager.send_keyvalue_registered_email(key, value, email)
        return True

tasks.register(SendWelcomeEmailTask)
tasks.register(SendPasswordResetEmailTask)
tasks.register(SendAskboardRegisterEmailTask)
tasks.register(SendRequetBoxEmailTask)
tasks.register(SendRequestTransactionCheckEmailTask)
tasks.register(SendKeyValueRegisteredEmailTask)