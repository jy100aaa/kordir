from mobileesp import mdetect

def process_request(request):
        is_mobile = False;
        is_tablet = False;

        user_agent = request.META.get("HTTP_USER_AGENT")
        http_accept = request.META.get("HTTP_ACCEPT")
        if user_agent and http_accept:
            agent = mdetect.UAgentInfo(userAgent=user_agent, httpAccept=http_accept)
            is_tablet = agent.detectTierTablet()
            is_mobile = agent.detectTierIphone() or agent.detectMobileQuick()

        if is_mobile == True:
            return 'M'
        elif is_tablet == True:
            return 'T'
        else:
            return 'D'