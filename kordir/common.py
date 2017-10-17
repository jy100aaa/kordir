# -*- coding: utf-8 -*-

import json
import random, string
import datetime
import socket, struct
import urllib, urllib2
import urlparse
from urllib2 import HTTPError
from django.conf import settings
from kordir.constants import *

class Utility:
    def __init__(self):
        pass

    def compose_json_serialize_response(self, result, error_code, kv):
        container = {}
        container['result'] = result
        container['error_code'] = error_code

        for key in kv.keys():
            container[key] = kv[key]

        return json.dumps(container)

    def generate_random_string(self, length):
        return "".join(random.choice(string.ascii_letters) for x in range(length))

    def xor_crypt_string(self, data, key='jangyeon.jin', encode=False, decode=False):
        from itertools import izip, cycle
        import base64
        if decode:
            data = base64.decodestring(data)
        xored = ''.join(chr(ord(x) ^ ord(y)) for (x,y) in izip(data, cycle(key)))
        if encode:
            return base64.encodestring(xored).strip()
        return xored

    def get_client_ip(self, request):
        x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
        if x_forwarded_for:
            ip = x_forwarded_for.split(',')[0]
        else:
            ip = request.META.get('REMOTE_ADDR')
        return ip

    def ip2long(self, ip):
        """
        Convert an IP string to long
        """
        packedIP = socket.inet_aton(ip)
        return struct.unpack("!L", packedIP)[0]

    def process_uri(self, request):
        uri = request.get_host().split('.')
        if len(uri) == 3:
            for domain in settings.DOMAIN_NAMES:
                if '.'.join(uri[1:]) == domain:
                    return (False, uri[0])

        uri_without_www = []
        for u in uri:
            if u != 'www':
                uri_without_www.append(u)
        domain = '.'.join(uri_without_www)
        return (True, domain)

    def http_request(self, param, url):
        if param:
            data = urllib.urlencode(param)
            url = url + '?' + data
        try:
            t = urllib2.urlopen(url)
        except HTTPError:
            return None
        ret = t.read()
        t.close()
        return ret

    def cookie_available(self, request):
        try:
            cookie = request.META.get('HTTP_COOKIE')
        except KeyError:
            return False
        return True

    def is_human_request(self, request):
        from user_agents import parse
        try:
            ua_string = request.META.get('HTTP_USER_AGENT')
        except KeyError:
            return False
        try:
            user_agent = parse(ua_string)
        except Exception as e:
            return False
        if user_agent.is_bot == True:
            return False
        else:
            return True

    def get_referral(self, request, domain):
        referer = ""
        internal = settings.MAIN_SERVER.replace('http://', '')
        try:
            referer = request.META['HTTP_REFERER']
            referer = referer.replace('http://', '').replace('https://', '').replace('www.', '')
            idx = referer.find('/')
            referer = referer[:idx]
        except KeyError:
            return ""
        if referer.find(internal) != -1:
            referer = ""
        if referer.find('xn--') != -1 and referer.find('?') == -1:
            referer = ""
        if len(domain) > 0 and referer.find('?') == -1 and referer.find(domain) != -1:
            referer = ""
        return referer

    def get_keyword(self, request):
        keyword = ""
        try:
            referer = request.META['HTTP_REFERER']
            referer = urllib.unquote(referer).decode('utf8')
            if referer.find("query%3D") != -1:
                referer = urllib.unquote(referer).decode("utf8")
            parsed = urlparse.urlparse(referer)
        except Exception as e:
            return ""
        query = []
        if referer.find('q=') != -1:
            try:
               query = urlparse.parse_qs(parsed.query)['q']
            except Exception as e:
                pass
        elif referer.find('query=') != -1:
            try:
                query = urlparse.parse_qs(parsed.query)['query']
            except Exception as e:
                pass
        elif referer.find("DMKW=") != -1:
            try:
                query = urlparse.parse_qs(parsed.query)["DMKW"]
            except Exception as e:
                pass
        elif referer.find("NVKWD=") != -1:
            try:
                query = urlparse.parse_qs(parsed.query)["NVKWD"]
            except Exception as e:
                pass
        if len(query) > 0:
            keyword = query[0]
        return keyword

    def access_control_allow_origin_all(self, response):
        r = response
        r['Access-Control-Allow-Origin'] = "*"
        return r

    def get_paging_tuple_list(self, scale, total, current):
        list = []
        left_end = current - scale / 2
        right_end = current + scale / 2 + 1

        if current <= scale / 2:
            right_end = right_end + (scale / 2)

        if current + scale / 2 > total:
            left_end = left_end - (scale / 2)

        # left
        for x in range(left_end, current):
            if x < 1:
                continue
            if x == current:
                list.append((x, True))
            else:
                list.append((x, False))

        for x in range(current, right_end):
            if x == current:
                list.append((x, True))
            else:
                list.append((x, False))
            if x >= total:
                break

        if len(list) < scale:
            if current <= scale / 2:
                stretch_end = right_end + (scale - len(list))
                for x in range(right_end, stretch_end):
                    if(x >= total):
                        break
                    list.append((x, False))
            elif total - current <= scale / 2:
                stretch_end = left_end - (scale - len(list))
                for x in range(stretch_end ,left_end, -1):
                    if x < 1:
                        break
                    list.insert(0, (x, False))
        return list

    def send_http_request(self, url, msg):
        try:
            req = urllib2.Request(url, json.dumps(msg), {'Content-Type': 'application/json'})
            res = urllib2.urlopen(req)
        except Exception, e:
            print 'exception: ' + e

    ### RELATED TREE TRAVERSAL
    def has_active_node(self, root):
        ret = False
        for k in root:
            if k['type'] == 'landing':
                continue
            if k['node'] == 'parent':
                ret = self.has_active_node(k['children'])
            if k['active'] == True:
                return True
            if ret == True:
                return ret
        return ret

    def tree_traverse(self, root, url):
        node = None
        for k in root:
            if k['url'] == url and k['node'] == 'leaf' and k['type'] != 'hyperlink':
                node = k
            if k['node'] == 'parent':
                node = self.tree_traverse(k['children'], url)
            if node is not None:
                return node
        return node

    def put_node(self, root, result_list, node_type_list):
        for k in root:
            for nt in node_type_list:
                if k['type'] == nt:
                    result_list.append(k)
            if k['node'] == 'parent':
                self.put_node(k['children'], result_list, node_type_list)

    def get_sibling(self, root, parent_id, node_type, sibling_list):
        if parent_id == "0":
            return
        for k in root:
            if k['node'] == 'parent' and k['id'] == parent_id:
                if k['kv']['navigationBox'] == False:
                    return
                for sibling in k['children']:
                    try:
                        if sibling['node'] != 'parent' and sibling['active'] == True:
                            sibling_list.append(sibling)
                    except Exception as e:
                        pass
            elif k['node'] == 'parent' and k['id'] != parent_id:
                self.get_sibling(k['children'], parent_id, node_type, sibling_list)

    def get_parent(self, root, parent_id):
        node = None
        for k in root:
            if k['node'] == 'parent' and k['id'] == parent_id:
                node = k
            elif k['node'] == 'parent':
                node = self.get_parent(k['children'], parent_id)
            if node is not None:
                break
        return node
