from django.conf.urls import patterns, include, url
from django.conf.urls.i18n import i18n_patterns
from kordir.requestreceiver import request_receiver_interface
from kordir.service_views import ServiceView

urlpatterns = patterns('',
    url(r'^pagepreview/(?P<key>[\w|\W]+)', ServiceView().pagepreview, name='pagepreview'),
    url(r'^pagepreview/(?P<key>[\w|\W]+)/', ServiceView().pagepreview, name='pagepreview'),
    url(r'^requestreceiver/', request_receiver_interface),
    url(r'^$', ServiceView().interface, name='main'),
    url(r'^robots.txt', ServiceView().robots, name='robots'),
    url(r'^sitemap.xml', ServiceView().sitemap, name='sitemap'),
    url(r'^(?P<dir>[\w|\W]+$)',  ServiceView().interface, name='main')
)
handler404 = 'kordir.service_views.handler404'
handler500 = 'kordir.service_views.handler500'