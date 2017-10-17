USER_STATUS_DEFAULT             = 0x00000000
USER_STATUS_EMAIL_DONE          = 0x00000001
USER_STATUS_EMAIL_DONE_REVERSE  = 0x11111110
USER_STATUS_FILLINFO_DONE       = 0x00000010
USER_STATUS_MOBILE_AUTH_DONE    = 0x00000100

NOTIFICATION_ALLOW_DEFAULT              = 0b111111111111
NOTIFICATION_ALLOW_ASKBOARD_SMS         = 0b000000000001
NOTIFICATION_ALLOW_ASKBOARD_EMAIL       = 0b000000000010
NOTIFICATION_ALLOW_ASKBOARD_SOUND       = 0b000000000100
NOTIFICATION_ALLOW_CHAT_SOUND           = 0b000000001000
NOTIFICATION_ALLOW_REQUESTBOX_SMS       = 0b000000010000
NOTIFICATION_ALLOW_REQUESTBOX_EMAIL     = 0b000000100000
NOTIFICATION_ALLOW_REQUESTBOX_SOUND     = 0b000001000000


USER_CONNECTION_STATUS_ONLINE           = '0'
USER_CONNECTION_STATUS_BUSY             = '1'
USER_CONNECTION_STATUS_ABSENT           = '2'
USER_CONNECTION_STATUS_PSEUDO_OFFLINE   = '3'
USER_CONNECTION_STATUS_OFFLINE          = '4'

ALL_INCLUDE_DELETED = -1
ALL_EXCLUDE_DELETED = 0
NOT_ANSWERED = 1
ANSWERED = 2
DELETED = 3

NORMAL_BOARD = 0
ASK_BOARD = 1
PRODUCT_BOARD = 2

DEFAULT_NODE = {
    "node": "",
    "type": "",
    "nodeName": "",
    "title": "",
    "id": 0,
    "url": "",
    "active": True,
    'code': '',
    "kv": {},
    "children": []
}
DEFAULT_NODE_HOME = {
    "node": "home",
    "type": "landing",
    "nodeName": "",
    "title": "",
    "id": 0,
    "url": "/",
    "active": True,
    'code': '',
    "kv": {
        "body": "",
        "htmlFile": "",
        "mode": "editor",
        "backgroundColor": "#ffffff",
        "backgroundImage": "",
        "backgroundImageMode": 0
    },
    "children": []
}

DEFAULT_SITEMAP = "<?xml version='1.0' encoding='UTF-8'?><urlset xmlns='http://www.sitemaps.org/schemas/sitemap/0.9'></urlset>"

DEFAULT_MISC = {
    "meta": {
        "siteTitle": "",
        "favicon": "",
        "keyword": [],
        "description": "",
        "robots": "",
        "sitemap": DEFAULT_SITEMAP
    },
    "header": {
        "backgroundColor": "#fafafa",
        "opacity": "100",
        'rgba': '',
        "fontColor": "#6d6d6d",
        "logo": "",
        "highlight": "#ff6600",
        "toggleMenuBackgroundColor" : "#fafafa",
        "toggleMenuFontColor": "#6d6d6d",
        "font": "",
        "type": 1
    },
    "footer": {
        "backgroundColor": "#333333",
        "fontColor": "#efefef",
        "align": "center",
        "text": ""
    }
}

RESTRICTED_DOMAIN = {
    "A": ['admin', 'asset'],
    "B": [],
    "C": ['company'],
    "D": ['drug'],
    "E": [],
    "F": ['fuck'],
    "G": ['gamble'],
    "H": [],
    "I": [],
    "J": [],
    "K": [],
    "L": [],
    "M": ['mail'],
    "N": ['node'],
    "O": [],
    "P": ['porn'],
    "Q": [],
    "R": [],
    "S": ['support', 'sex'],
    "T": ['torrent'],
    "U": [],
    "V": [],
    "W": [],
    "X": [],
    "Y": [],
    "Z": []
}

### PROMOTION CODE
PROMOTION_CODE = ['SU01', 'WHITEC']

### POINT MGNT
POINT_REQUIRE_PER_DAY = 500
POINT_INITIAL_USE_DAYS = 3
POINT_INITIAL_VALUE = 2500

### ADD     = 0X
POINT_ADD_INITIAL               = "00"
POINT_ADD_TRANSACTION           = "01"
POINT_ADD_SPECIAL               = "09"
### MINUS   = 1X
POINT_MINUS_EXTEND_USE          = "10"


## should be updated upon list changed
CONSTANT_DICT = {
    "USER_STATUS_DEFAULT"                           : USER_STATUS_DEFAULT,
    "USER_STATUS_EMAIL_DONE"                        : USER_STATUS_EMAIL_DONE,
    "USER_STATUS_EMAIL_DONE_REVERSE"                : USER_STATUS_EMAIL_DONE_REVERSE,
    "USER_STATUS_FILLINFO_DONE"                     : USER_STATUS_FILLINFO_DONE,
    "USER_STATUS_MOBILE_AUTH_DONE"                  : USER_STATUS_MOBILE_AUTH_DONE,

    "NOTIFICATION_ALLOW_DEFAULT"                    : NOTIFICATION_ALLOW_DEFAULT,
    "NOTIFICATION_ALLOW_ASKBOARD_SMS"               : NOTIFICATION_ALLOW_ASKBOARD_SMS,
    "NOTIFICATION_ALLOW_ASKBOARD_EMAIL"             : NOTIFICATION_ALLOW_ASKBOARD_EMAIL,
    "NOTIFICATION_ALLOW_ASKBOARD_SOUND"             : NOTIFICATION_ALLOW_ASKBOARD_SOUND,
    "NOTIFICATION_ALLOW_CHAT_SOUND"                 : NOTIFICATION_ALLOW_CHAT_SOUND,
    "NOTIFICATION_ALLOW_REQUESTBOX_SMS"             : NOTIFICATION_ALLOW_REQUESTBOX_SMS,
    "NOTIFICATION_ALLOW_REQUESTBOX_EMAIL"           : NOTIFICATION_ALLOW_REQUESTBOX_EMAIL,
    "NOTIFICATION_ALLOW_REQUESTBOX_SOUND"           : NOTIFICATION_ALLOW_REQUESTBOX_SOUND,

    "USER_CONNECTION_STATUS_ONLINE"                 : USER_CONNECTION_STATUS_ONLINE,
    "USER_CONNECTION_STATUS_BUSY"                   : USER_CONNECTION_STATUS_BUSY,
    "USER_CONNECTION_STATUS_ABSENT"                 : USER_CONNECTION_STATUS_ABSENT,
    "USER_CONNECTION_STATUS_PSEUDO_OFFLINE"         : USER_CONNECTION_STATUS_PSEUDO_OFFLINE,
    "USER_CONNECTION_STATUS_OFFLINE"                : USER_CONNECTION_STATUS_OFFLINE,

    "ALL_INCLUDE_DELETED"                           : ALL_INCLUDE_DELETED,
    "ALL_EXCLUDE_DELETED"                           : ALL_EXCLUDE_DELETED,
    "NOT_ANSWERED"                                  : NOT_ANSWERED,
    "ANSWERED"                                      : ANSWERED,
    "DELETED"                                       : DELETED,

    "NORMAL_BOARD"                                  : NORMAL_BOARD,
    "ASK_BOARD"                                     : ASK_BOARD,
    "PRODUCT_BOARD"                                 : PRODUCT_BOARD,

    "PROMOTION_CODE"                                : PROMOTION_CODE,

    ### POINT MGNT
    "POINT_REQUIRE_PER_DAY"                         : POINT_REQUIRE_PER_DAY,
    "POINT_INITIAL_USE_DAYS"                        : POINT_INITIAL_USE_DAYS,
    "POINT_INITIAL_VALUE"                           : POINT_INITIAL_VALUE,
    ### ADD     : 0X
    "POINT_ADD_INITIAL"                             : POINT_ADD_INITIAL,
    "POINT_ADD_TRANSACTION"                         : POINT_ADD_TRANSACTION,
    "POINT_ADD_SPECIAL"                             : POINT_ADD_SPECIAL,
    ### MINUS   : 1X
    "POINT_MINUS_EXTEND_USE"                        : POINT_MINUS_EXTEND_USE,

    "DEFAULT_NODE"                                  : DEFAULT_NODE,
    "DEFAULT_MISC"                                  : DEFAULT_MISC,
    "RESTRICTED_DOMAIN"                             : RESTRICTED_DOMAIN,

    "BUFFER":True
}
