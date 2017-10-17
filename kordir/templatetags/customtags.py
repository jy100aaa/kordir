from django import template
from django.conf import settings
from kordir.constants import *
from django.utils.safestring import mark_safe
import json

register = template.Library()

@register.simple_tag
def settings_value(name):
    if name == "DATABASES":
        return ""
    if name.find("EMAIL") != -1:
        return ""
    return getattr(settings, name, "")

@register.filter
def bitwise_and(operand_a, operand_b):
    if operand_a & operand_b:
        return True
    else:
        return False

@register.filter
def get_firstindex(str):
    value = ''
    try:
        data = json.loads(str)
        value = data[0]
        return value
    except Exception as e:
        return ''

@register.filter
def get_filelocation(type):
    try:
        return settings.S3_ADDRESS + settings.FILE_LOCATION[type]
    except KeyError:
        return ''

@register.filter
def remaining_days(days):
    return int(days) + 1

@register.filter
def get_item(dictionary, key):
    return dictionary.get(key)

@register.filter
def as_json(data):
    #return mark_safe(json.dumps(data))
    return json.dumps(data)

@register.filter
def as_json_safe(data):
    return mark_safe(json.dumps(data))

@register.filter
def as_json_empty_children(data):
    try:
        t = data.copy()
        t['children'] = []
        txt = json.dumps(t)
    except Exception as e:
        print e
        txt = ''
    #return mark_safe(txt)
    return txt

@register.filter
def get_constant_value(key_name):
    return CONSTANT_DICT[key_name]

@register.filter
def epoch(value):
    import time
    try:
        return int(time.mktime(value.timetuple())*1000)
    except AttributeError:
        return ''

@register.filter
def page_body_manipulation(body):
    from bs4 import BeautifulSoup
    soup = BeautifulSoup(body)
    node = []
    return body

@register.filter
def joinby(value, arg):
    return arg.join(value)

@register.filter
def modulo(num, val):
    return num % val

@register.filter
def remove_forward_slash(value):
    return value.replace('/', '')

@register.filter
def replace_string(value, args):
    if args is None:
        return value
    arg = args.split(',')
    return value.replace(arg[0], arg[1])
