from django_hosts import patterns, host
from django.conf import settings
host_patterns = patterns('',
    host(r'www.kordir.com', settings.ROOT_URLCONF, name='www'),
    host(r'kordir.com', settings.ROOT_URLCONF, name='without-www'),
    host(r'52.78.228.188', settings.ROOT_URLCONF, name='direct-ip'),
    host(r'(\w+)', 'kordir.service_urls', name='user-sites'),
)