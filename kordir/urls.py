from django.conf.urls import patterns, include, url
from django.conf.urls.i18n import i18n_patterns
from kordir.requestreceiver import request_receiver_interface

urlpatterns = patterns('',
    url(r'^i18n/', include('django.conf.urls.i18n')),
    url(r'^$', 'kordir.views.home', name='home'),
    url(r'^testview/', 'kordir.views.testview', name='testview'),
    url(r'^logout/', 'kordir.views.logout', name='logout'),
    url(r'^login/', 'kordir.views.login', name='login'),
    url(r'^passwordreset/', 'kordir.views.passwordreset', name='passwordreset'),
    url(r'^signup/', 'kordir.views.signup', name='signup'),
    url(r'^requestreceiver/', request_receiver_interface),
    url(r'^signupdone/','kordir.views.signupdone', name='signupdone'),
    url(r'^fillinfo/', 'kordir.views.fillinfo', name='fillinfo'),
    url(r'^addservice/','kordir.views.addservice', name='addservice'),
    url(r'^settings/','kordir.views.settings_page', name='settings'),
    url(r'^benefit/', 'kordir.views.benefit', name='benefit'),
    url(r'^pricing/', 'kordir.views.pricing', name='pricing'),
    url(r'^company/', 'kordir.views.company', name='company'),
    url(r'^terms/','kordir.views.terms', name='terms'),
    url(r'^privacy/','kordir.views.privacy', name='privacy'),
    url(r'^test/', 'kordir.views.test', name='test'),
    url(r'^dashnav/(?P<nav>[\w|\W]+)/$', 'kordir.views.dashnav', name='dashnav'),
    url(r'^robots.txt', 'kordir.views.robots', name='robots'),
    url(r'^sitemap.xml', 'kordir.views.sitemap', name='sitemap'),
    url(r'^mgnt/', 'kordir.views.mgnt', name='mgnt'),
    url(r'^extend/', 'kordir.views.extend', name='extend'),
    url(r'^trial/', 'kordir.views.dashboard', name='trial'),
)
handler404 = 'kordir.views.handler404'
handler500 = 'kordir.views.handler500'