from cachemanager.cachemanager import UserConnectionManager
from analytics.models import ServiceUserConnectionLog, ServiceUserConnectionDuration
from kordir.common import Utility
from django.conf import settings
import json
import datetime
from pytz import timezone
from math import ceil


class AnalyticsManager:
    def __init__(self):
        pass

    def get_analytics_statistics(self, service_id, start, end):
        days = (end - start).days
        if days == 0:
            days = 1
        duration_log = ServiceUserConnectionDuration().get_user_connection_duration_log(service_id, start, end)

        data_exist = False

        try:
            if len(duration_log) > 0:
                data_exist = True
        except Exception as e:
            data_exist = False

        if data_exist:
            log = ServiceUserConnectionLog().get_user_connection_log(service_id, start, end)
        seoul_tz = timezone('Asia/Seoul')

        statistics = {}
        statistics['dataExist'] = data_exist
        statistics['totalUnique'] = 0
        statistics['totalPage'] = 0
        statistics['totalVisitor'] = 0
        statistics['unique'] = [['', 0] for i in range(days)]
        statistics['pageView'] = [['', 0] for i in range(days)]
        statistics['dailyVisitor'] = [['', 0] for i in range(days)]
        statistics['durationAvg'] = 0
        statistics['deviceType'] = {
                                    'M': 0,
                                    'D': 0,
                                    'T': 0
                                    }
        statistics['city'] = {}
        statistics['ref'] = {}
        statistics['keyword'] = {}
        statistics['page'] = {}
        statistics['visitor'] = {
                                 'N': 0,
                                 'R': 0}

        service_duration = 0
        for l in duration_log:
            service_duration += l.duration
            local_dt = l.timestamp.astimezone(seoul_tz)
            location = abs((days - 1) - (end - local_dt).days)
            statistics['dailyVisitor'][location][1] += 1
            statistics['totalVisitor'] += 1

        service_duration = ceil(service_duration / days)

        if data_exist == False:
            statistics['durationAvgStr'] = '00:00:00'
        else:
            second = int(service_duration % 60)
            minute = int(service_duration / 60)
            hour = 0
            if minute > 60:
                minute = minute % 60
                hour = int(minute / 60)

            if minute < 10:
                minute = '0' + str(minute)
            if hour < 10:
                hour = '0' + str(hour)
            if second < 10:
                second = '0' + str(second)

            statistics['durationAvgStr'] = str(hour) + ':' + str(minute) + ':' + str(second)

        statistics['durationAvg'] = service_duration

        previous_location = 0
        unique_kv_storage = {}
        if data_exist:
            for l in log:
                local_dt = l.timestamp.astimezone(seoul_tz)
                location = abs((days - 1) - (end - local_dt).days)
                if location != previous_location:
                    unique_kv_storage = {}
                previous_location = location
                statistics['totalPage'] += 1
                statistics['pageView'][location][1] += 1
                unique_key = str(l.ip_address)
                try:
                    temp = unique_kv_storage[unique_key]
                except KeyError:
                    unique_kv_storage[unique_key] = True
                    statistics['totalUnique'] += 1
                    statistics['unique'][location][1] += 1

                if l.new_visitor == True:
                    statistics['visitor']['N'] += 1
                else:
                    statistics['visitor']['R'] += 1

                if l.device_type == 'M':
                    statistics['deviceType']['M'] += 1
                elif l.device_type == 'T':
                    statistics['deviceType']['T'] += 1
                elif l.device_type == 'D':
                    statistics['deviceType']['D'] += 1
                try:
                    statistics['page'][l.page] += 1
                except KeyError:
                    statistics['page'][l.page] = 1
                try:
                    statistics['city'][l.city] += 1
                except KeyError:
                    statistics['city'][l.city] = 1
                try:
                    statistics['ref'][l.ref] += 1
                except KeyError:
                    statistics['ref'][l.ref] = 1
                if l.keyword in statistics['keyword']:
                    statistics['keyword'][l.keyword]['count'] += 1
                    if l.ip_address in statistics['keyword'][l.keyword]:
                        statistics['keyword'][l.keyword][l.ip_address] += 1
                    else:
                        statistics['keyword'][l.keyword][l.ip_address] = 1
                else:
                    statistics['keyword'][l.keyword] = {}
                    statistics['keyword'][l.keyword]['count'] = 1
                    statistics['keyword'][l.keyword][l.ip_address] = 1

        delta = end - start
        for i in range(delta.days):
            td = start + datetime.timedelta(days=i) + datetime.timedelta(days=1)
            td = td.astimezone(seoul_tz)
            date_str = str(td.month) + '/' + str(td.day)
            statistics['pageView'][i][0] = date_str
            statistics['unique'][i][0] = date_str
            statistics['dailyVisitor'][i][0] = date_str

        return statistics


    def mark_service_user_connection_log(self, service_id, page, ip_address, device_type, ref, keyword, new_visitor):
        ip_info = UserConnectionManager().get_ip_information(ip_address)
        if ip_info == None:
            ip_info = {}
            param = {}
            param['query'] = ip_address
            param['key'] = settings.IP_LOOKUP_KEY
            param['answer'] = 'json'
            ret = Utility().http_request(param, settings.IP_LOOKUP_SERVICE_URL)
            print 'ret: ' + ret
            data = json.loads(ret)
            try:
                ip_info['countryCode'] = data['whois']['countryCode']
                city = self.get_city_code(data['whois']['english']['ISP']['netinfo']['addr'])
                city = self.get_city_code(data['whois']['english']['user']['netinfo']['addr'])
            except KeyError:
                city = ''
                pass
            ip_info['city'] = city
        else:
            try:
                t = ip_info['city']
                t = ip_info['countryCode']
            except Exception as e:
                ip_info = {}
                ip_info['city'] = ''
                ip_info['countryCode'] = ''

        service_user_connection_log = ServiceUserConnectionLog(
                                                                service_id = service_id,
                                                                country_code = ip_info['countryCode'],
                                                                city = ip_info['city'],
                                                                ip_address = Utility().ip2long(ip_address),
                                                                page = page,
                                                                device_type = device_type,
                                                                ref = ref[:30],
                                                                keyword = keyword,
                                                                new_visitor = new_visitor)
        service_user_connection_log.save()

        UserConnectionManager().set_ip_information(ip_address, ip_info)
        return True

    def mark_service_user_connection_duration(self, service_id, duration):
        service_user_connection_duration = ServiceUserConnectionDuration(
                                                                         service_id = service_id,
                                                                         duration = duration)
        service_user_connection_duration.save()
        return True

    def get_city_code(self, location):
        LOCATION_MAIN = {}
        LOCATION_MAIN['Seoul'] = '00'
        LOCATION_MAIN['Busan'] = '01'
        LOCATION_MAIN['Pusan'] = '01'
        LOCATION_MAIN['Daegu'] = '02'
        LOCATION_MAIN['Incheon'] = '03'
        LOCATION_MAIN['Gwangju'] = '04'
        LOCATION_MAIN['Daejeon'] = '05'
        LOCATION_MAIN['Ulsan'] = '06'
        LOCATION_MAIN['Gyeonggi'] = '07'
        LOCATION_MAIN['Gyunggi'] = '07'
        LOCATION_MAIN['Gangwon'] = '08'
        LOCATION_MAIN['Chungcheongbuk'] = '09'
        LOCATION_MAIN['Chungcheongnam'] = '10'
        LOCATION_MAIN['Jeollabuk'] = '11'
        LOCATION_MAIN['Jeollanam'] = '12'
        LOCATION_MAIN['Gyeongsangbuk'] = '13'
        LOCATION_MAIN['Gyeongsangnam'] = '14'
        LOCATION_MAIN['jeju'] = '15'

        location_array = location.split(',')
        for candidate in location_array:
            candidate = candidate.lower()
            for key in LOCATION_MAIN.iterkeys():
                lkey = key.lower()
                if lkey in candidate:
                    return LOCATION_MAIN[key]
        return ''

