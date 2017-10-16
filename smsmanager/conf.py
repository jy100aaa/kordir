# -*- coding: utf-8 -*-
import base64

SMS_APPID = 'kordir.com'
SMS_APIKEY = '280cbbcc663d11e49e96040113e09101'
SMS_SENDER = '16705886'
SMS_ADDRESS = 'api.bluehouselab.com'
SMS_PATH = "/smscenter/v1.0/sendsms"
SMS_CREDENTIAL = "Basic "+base64.encodestring(SMS_APPID+':'+SMS_APIKEY).strip()
SMS_HEADER = {
  "Content-type": "application/json;charset=utf-8",
  "Authorization": SMS_CREDENTIAL,
}
