var DASHBOARD_LOCATION = {
	REALTIME: 0,
	STATISTICS: 1,
	CHAT: 2,
	SETTING_CONTENT: 3,
	SETTING_LANDING: 4,
	SETTING_MISC: 5,
	BOARD: 6,
	NOTICE: 7,
	PRODUCT: 8
};
var variable = {
	connectionStatus: serverData.connectionStatus,
	init:{
		home:false
	},
	initialPage: 'realtime',
	currentLocation: DASHBOARD_LOCATION.REALTIME,
	chatRequestAcceptedData: null,
	previous: '',
	resizeFunc: {},
	mobileViewPort: false,
	blockToMove: true,
	buffer: null
};
var INFOGRAPHIC_TYPE = {
	PIE_CHART:0,
	LINE_CHART:1,
	COLUMN_CHART:2,
	BAR_CHART:3,
	TABLE: 4,
	GEO_MAP:9
};
var realtimeChartData = {
	dataReceived: false,
	connectionSpot:0,
	maxSpot: 0,
	concurrent: 0,
	timer: {
		second: null,
		minute: null
	},
	/* chart */
	minute: {
		type: INFOGRAPHIC_TYPE.COLUMN_CHART,
		obj: null,
		options:{
			title: stringTable.maxConnectionNumber,
			titleTextStyle: {
				color:'#4d4d4d',
				fontSize:16
			},
			bar: {
			    groupWidth: 16
			},
			legend:'none',
			vAxis: {viewWindowMode: "explicit", viewWindow:{ min: 0 }}
		},
		data: [['', stringTable.connectionNumber],
		       ['5' + stringTable.minutesAgo, 0],
		       ['4' + stringTable.minutesAgo, 0],
		       ['3' + stringTable.minutesAgo, 0],
		       ['2' + stringTable.minutesAgo, 0],
		       ['1' + stringTable.minuteAgo, 0],
		       [stringTable.now, 0]]
	},
	second: {
		type: INFOGRAPHIC_TYPE.COLUMN_CHART,
		obj: null,
		options:{
			title: stringTable.realTimeData,
			titleTextStyle: {
				color:'#4d4d4d',
				fontSize:16
			},
			bar: {
			    groupWidth: 8
			},
			legend:'none',
			vAxis: {viewWindowMode: "explicit", viewWindow:{ min: 0 }}
		},
		data: [['', stringTable.connectionNumber],
         		['30' + stringTable.secondsAgo, 0],
        		['', 0],
        		['', 0],
        		['', 0],
        		['', 0],
        		['25' + stringTable.secondsAgo, 0],
        		['', 0],
				['', 0],
				['', 0],
				['', 0],
				['20' + stringTable.secondsAgo, 0],
				[' ', 0],
				[' ', 0],
				[' ', 0],
				[' ', 0],
				['15' + stringTable.secondsAgo, 0],
				[' ', 0],
				[' ', 0],
				[' ', 0],
				[' ', 0],
				['10' + stringTable.secondsAgo, 0],
				[' ', 0],
				[' ', 0],
				[' ', 0],
				[' ', 0],
				['5' + stringTable.secondsAgo, 0],
				[' ', 0],
				[' ', 0],
				[' ', 0],
				[' ', 0],
				[stringTable.now, 0]]
	},
	newReturnVisitor:{
		type: INFOGRAPHIC_TYPE.PIE_CHART,
		obj: null,
		data: [[stringTable.visitorType, stringTable.visitorNumber],
		       [stringTable.newVisitor, 0],
		       [stringTable.returningVisitor, 0]]
	},
	device:{
		type: INFOGRAPHIC_TYPE.PIE_CHART,
		obj: null,
		data: [[stringTable.deviceType, stringTable.deviceNumber],
		       [stringTable.desktop, 0],
		       [stringTable.mobile, 0],
		       [stringTable.tablet, 0]]
	},
	region:{
		type: INFOGRAPHIC_TYPE.TABLE,
		obj: null,
		options:{
			sortColumn: 1,
			sortAscending: false
		},
		data: [[stringTable.location, stringTable.visitorNumber]]
	},
	referral:{
		type: INFOGRAPHIC_TYPE.TABLE,
		obj: null,
		options:{
			sortColumn: 1,
			sortAscending: false
		},
		data: [[stringTable.visitRoute, stringTable.visitNumber]]
	}
};
var visitorData = {};
var statisticsChartData = {
	statisticsLoaded: false,
	statisticsDataExist: false,
	statisticsServiceId: serverData.service_id,
	statisticsType:'0',
	statisticsTypeText: '',
	statisticsStart: null,
	statisticsEnd: null,

	totalVisitor: 0,
	totalPage: 0,
	totalUnique: 0,
	pageviewAvg: 0,
	durationAvg: 0,
	durationAvgStr: '',

	/* chart */
	pageView:{
		type: INFOGRAPHIC_TYPE.LINE_CHART,
		obj: null,
		options: {
			legend: 'none',
			series:{
				0: {color: '#789'}
			},
			lineWidth: 3,
			pointSize: 6,
	        pointShape: 'square'
		},
		data: [['', stringTable.pageView]]
	},
	dailyVisitor:{
		type: INFOGRAPHIC_TYPE.LINE_CHART,
		obj: null,
		options: {
			legend: 'none',
			series:{
				0: {color: '#789'}
			},
			lineWidth: 3,
			pointSize: 6,
	        pointShape: 'square'
		},
		data: [['', stringTable.visitNumber]]
	},
	unique:{
		type: INFOGRAPHIC_TYPE.LINE_CHART,
		obj: null,
		options: {
			legend: 'none',
			series:{
				0: {color: '#789'}
			},
			lineWidth: 3,
			pointSize: 6,
	        pointShape: 'square'
		},
		data: [['', stringTable.uniqueVisitor]]
	},
	newReturnVisitor:{
		type: INFOGRAPHIC_TYPE.PIE_CHART,
		obj: null,
		data: [[stringTable.visitorType, stringTable.visitNumber],
		       [stringTable.newVisitor, 0],
		       [stringTable.returningVisitor, 0]]
	},
	device:{
		type: INFOGRAPHIC_TYPE.PIE_CHART,
		obj: null,
		data: [[stringTable.deviceType, stringTable.deviceNumber],
		       [stringTable.desktop, 0],
		       [stringTable.mobile, 0],
		       [stringTable.tablet, 0]]
	},
	region:{
		type: INFOGRAPHIC_TYPE.TABLE,
		obj: null,
		options:{
			sortColumn: 1,
			sortAscending: false
		},
		data: [[stringTable.location, stringTable.visitNumber]]
	},
	referral:{
		type: INFOGRAPHIC_TYPE.TABLE,
		obj: null,
		options:{
			sortColumn: 1,
			sortAscending: false
		},
		data: [[stringTable.visitRoute, stringTable.visitNumber]]
	},
	page:{
		type: INFOGRAPHIC_TYPE.TABLE,
		obj: null,
		options:{
			sortColumn: 1,
			sortAscending: false
		},
		data: [[stringTable.page, stringTable.visitNumber]]
	},
	keyword: {
		type: INFOGRAPHIC_TYPE.TABLE,
		obj: null,
		options:{
			sortColumn: 1,
			sortAscending: false
		},
		data: [[stringTable.keyword, stringTable.accumulatedNumber]]
	}
};
$.datepicker._defaults.onAfterUpdate = null;
var datepicker__updateDatepicker = $.datepicker._updateDatepicker;
$.datepicker._updateDatepicker = function( inst ) {
	datepicker__updateDatepicker.call( this, inst );
	var onAfterUpdate = this._get(inst, 'onAfterUpdate');
	if (onAfterUpdate)
		onAfterUpdate.apply((inst.input ? inst.input[0] : null), [(inst.input ? inst.input.val() : ''), inst]);
};
$(function(){
	try{
		var fraction = 0;
		if(serverData.remainingDays < 0)
			fraction = 0;
		else{
			fraction = serverData.remainingDays / 100;
		}
		if(!oldIE){
			$("#remaining-days").circleProgress({
				value: fraction,
				size: 100,
				fill: {
					color: 'orange'
				}
			});
			fraction = 0;
			fraction = serverData.point / 30000;

			$("#remaining-points").circleProgress({
				size: 120,
				value: fraction,
				fill: {
					color: 'orange'
				}
			});
		}
	} catch(err){}
	var chatMarker = false;
	for(k in serverData.chatMessageMarker){
		chatMarker = true;
		break;
	}
	if(chatMarker){
		$("#chat-unread-count").removeClass('unread-count-hide');
		$("#chat-unread-count").addClass('unread-count-show');
	}
	$(".sidebar-nav-board .unread-count").each(function(){
		var url = $(this).attr('data-url');
		var id = 'askboard-unread-count-' + url.split('/')[1];
		$(this).prop('id', id);
		for(k in serverData.askBoardMarker){
			if(url == k){
				$(this).removeClass('unread-count-hide');
				$(this).addClass('unread-count-show');
				break;
			}
		}
	});
	$.datepicker.regional['ko'] = {
		closeText: stringTable.close,
	    prevText: stringTable.previousMonth,
	    nextText: stringTable.nextMonth,
	    currentText: stringTable.today,
	    monthNames: [stringTable.january,
	                stringTable.february,
	                stringTable.march,
	                stringTable.april,
	                stringTable.may,
	                stringTable.june,
	                stringTable.july,
	                stringTable.august,
	                stringTable.september,
	                stringTable.octorber,
	                stringTable.november,
	                stringTable.december],
        monthNames: [stringTable.january,
 	                stringTable.february,
 	                stringTable.march,
 	                stringTable.april,
 	                stringTable.may,
 	                stringTable.june,
 	                stringTable.july,
 	                stringTable.august,
 	                stringTable.september,
 	                stringTable.octorber,
 	                stringTable.november,
 	                stringTable.december],
        dayNames: [stringTable.sunday,stringTable.monday,stringTable.tuesday,stringTable.wednesday,stringTable.thursday,stringTable.friday,stringTable.saturday],
        dayNamesShort: [stringTable.sunday,stringTable.monday,stringTable.tuesday,stringTable.wednesday,stringTable.thursday,stringTable.friday,stringTable.saturday],
        dayNamesMin: [stringTable.sunday,stringTable.monday,stringTable.tuesday,stringTable.wednesday,stringTable.thursday,stringTable.friday,stringTable.saturday],
        weekHeader: 'Wk',
        dateFormat: 'yy/mm/dd',
        firstDay: 0,
        isRTL: false,
        showMonthAfterYear: true
	};
	$.datepicker.setDefaults($.datepicker.regional['ko']);

	$("#header-dashboard-menu-button").bind('click', function(){
		header_dashboard_menu_button_clicked();
	});
	$(".sidebar-inner-wrapper .user-status-wrapper .user-status").bind('change', function(){
		user_status_change(this);
	});
	$(".sidebar-inner-wrapper .sidebar-nav .sidebar-nav").bind('click', function(){
		var id = $(this).prop('id');
		var nav = id.split('-')[2];
		if($(this).hasClass('sidebar-nav-board') == true){
			nav = $(this).attr('data-url');
			nav = 'board?url=' + nav;
		}
		location.hash = nav;
	});
	if((serverData.userStatus & CONSTANTS.USER_STATUS.FILLINFO && !serverData.expired)){
		var hash = location.hash;
		hash = hash.replace('#', '');
		if(hash.length != 0){
			variable.previous = hash;
			sidebar_nav(hash);
		}
		else
			location.hash = variable.initialPage;
	}
	/* hash tag event listener */
	$(window).bind('hashchange', function(){
		var hash = location.hash;
		hash = hash.replace('#', '');
		if(variable.previous != '')
		{
			if(variable.previous == hash)
				return;
			if((variable.previous.indexOf('productboardwrite') != -1  || variable.previous == 'settingcontent') && variable.blockToMove == true){
				var str = '';
				if(variable.previous == 'settingcontent')
					str = stringTable.askSettingContentEscape;
				if(variable.previous.indexOf('productboardwrite') != -1)
					str = stringTable.askPageEscape;
				draw_general_popup(
						function(){
							variable.previous = hash;
							sidebar_nav(hash);
						},
						function(){
							location.hash = variable.previous;
						},
						null,
						str,
						stringTable.yes,
						stringTable.no
				);
				return;
			}
		}
		variable.previous = hash;
		sidebar_nav(hash);
	});
	$(window).resize(function(){
		if(this.resizeTO)
			clearTimeout(this.resizeTO);
	    this.resizeTO = setTimeout(function() {
	        $(this).trigger('resizeDashboard');
	    }, 300);
	});
	$(window).bind('resizeDashboard', function() {
		viewport_check();
		dashboard_adjustment();
		for(idx in variable.resizeFunc){
			if(parseInt(idx) == variable.currentLocation){
				variable.resizeFunc[idx]();
			}
		}
	});
	viewport_check();
});
function viewport_check(){
	var display = $(".viewport-check").css('display');
	if(display === 'none')
		variable.mobileViewport = false;
	else
		variable.mobileViewport = true;
}
function draw_area_masking(){
	$('.dashboard-body').prepend("<div class='area-masking'></div>");
}
function remove_area_masking(){
	$(".dashboard-body").find(".area-masking").remove();
}
function header_dashboard_menu_button_clicked(){
	var sideBarObj = $("#sidebar");
	var display = $(sideBarObj).css('display');
	if(display == 'none'){
		$(sideBarObj).show();
	} else {
		$(sideBarObj).hide();
	}
}
function user_status_change(obj){
	var val = $(obj).val();
	if (val == variable.connectionStatus)
		return;
	if(val == '-1'){
		logout();
		$(obj).val(variable.connectionStatus);
		return;
	}
	variable.connectionStatus = val;
	var msg = {
		type: 'status-change',
		data: {
			userId: serverData.id,
			connectionStatus: variable.connectionStatus,
			serviceId: serverData.service_id
		}
	};
	if(typeof send_client_message !== 'undefiend')
		send_client_message(msg);
}
function sidebar_nav(nav){
	if(variable.mobileViewport == true)
		$("#sidebar").hide();

	var param = [];
	var page = nav.split('?')[0];
	try {
		param = nav.split('?')[1];
	} catch(err) {
		param = [];
	}

	if(!(serverData.userStatus & CONSTANTS.USER_STATUS.FILLINFO)){
		draw_general_popup(
				function(){
					window.location.href = '/fillinfo';
				},
				null,
				null,
				stringTable.fillInfoNotDone + '<br><br>' + stringTable.goToFillInfo,
				stringTable.yes,
				stringTable.no
		);
		return;
	} if(serverData.expired == true){
		draw_general_popup(
				function(){
					window.location.href = '/settings?nav=point';
				},
				null,
				null,
				stringTable.expired,
				stringTable.ok,
				null
		);
		return;
	}
	if(page.indexOf('board') != -1){
		$(".sidebar-inner-wrapper .sidebar-nav li").removeClass('chosen');

		var p = param.split('&');
		var url = '';
		for(var i = 0; i < p.length; i++){
			if(p[i].indexOf('url') != -1){
				url = p[i].split('=')[1];
				break;
			}
		}
		$(".sidebar-inner-wrapper .sidebar-nav .sidebar-nav-board").each(function(){
			if(url == $(this).attr('data-url')){
				$(this).addClass('chosen');
				return;
			}
		});
	} else {
	    try {
            var obj = $(".sidebar-inner-wrapper .sidebar-nav #sidebar-nav-" + nav);
            $(".sidebar-inner-wrapper .sidebar-nav li").removeClass('chosen');
            $(obj).addClass('chosen');
        } catch (err) {}
	}
	draw_area_masking();

	$("#area").off();
	$("#area").find('*').off();
	$(".colorpicker").remove();

	if(nav.indexOf('realtime') != -1)
		variable.currentLocation = DASHBOARD_LOCATION.REALTIME;
	else if(nav.indexOf('statistics') != -1)
		variable.currentLocation = DASHBOARD_LOCATION.STATISTICS;
	else if(nav.indexOf('chat') != -1)
		variable.currentLocation = DASHBOARD_LOCATION.CHAT;
	else if(nav.indexOf('settingcontent') != -1)
		variable.currentLocation = DASHBOARD_LOCATION.SETTING_CONTENT;
	else if(nav.indexOf('settinglanding') != -1)
		variable.currentLocation = DASHBOARD_LOCATION.SETTING_LANDING;
	else if(nav.indexOf('settingmisc') != -1)
		variable.currentLocation = DASHBOARD_LOCATION.SETTING_MISC;
	else if(nav.indexOf('board') != -1)
		variable.currentLocation = DASHBOARD_LOCATION.BOARD;

	// dashboard trial
	if(serverData.session.length == 0){
		if(nav.indexOf('url') == -1)
			nav = nav + '?reqtype=dashboard&nav=' + nav;
		else
			nav = nav + '&reqtype=dashboard&nav=' + nav;
	}
	$("#area").load('/dashnav/' + nav, function(){
		$("#area .dashboard-body").css('min-height', $("#area").height() + 'px');

		if(variable.currentLocation == DASHBOARD_LOCATION.CHAT){
			$("#chat-unread-count").addClass('unread-count-hide');
			$("#chat-unread-count").removeClass('unread-count-show');
			variable.unreadChatMessageCount = 0;
			var askBoardMarkerEmpty = true;
			for(k in serverData.askBoardMarker){
				askBoardMarkerEmpty = false;
			}
			if(askBoardMarkerEmpty){
				$("#header-dashboard-menu-button #header-notification").remove();
			}
		}
		if(variable.currentLocation == DASHBOARD_LOCATION.BOARD){
			try{
				var url = nav.split('=')[1];
				url = url.split('&')[0];
				var found = false;
				for(k in serverData.askBoardMarker){
					if(url == k)
						found = true;
				}
				if(!found)
					throw "escape";
				$(".unread-count").each(function(){
					if($(this).attr('data-url') == url){
						$(this).addClass('unread-count-hide');
						$(this).removeClass('unread-count-show');
						delete serverData.askBoardMarker[url];
						var empty = true;
						for(k in serverData.askBoardMarker){
							empty = false;
						}
						if(askBoardMarkerEmpty == true && variable.unreadChatMessageCount){
							$("#header-dashboard-menu-button #header-notification").remove();
						}
						return;
					}
				});
			} catch(err){}
		}
	});
}
function dashboard_node_interface(param){
	if(param.type == 'visitor-connect'){
		var d = param['data'];
		var uniqueKey = d.uniqueKey;
		var now = new Date();
		if(typeof visitorData[uniqueKey] === 'undefined'){
			visitorData[uniqueKey] = {};
			for(k in d)
				visitorData[uniqueKey][k] = d[k];
			visitorData[uniqueKey]['timestamp'] = now.getTime();
			visitorData[uniqueKey]['lastActive'] = now.getTime();
		} else {
			if(typeof visitorData[uniqueKey]['page'] !== 'undefined'){
				visitorData[uniqueKey]['page'] = d.page;
				visitorData[uniqueKey]['lastActive'] = now.getTime();
			}
		}
	}
	else if(param.type == 'visitor-disconnect'){
		if(typeof visitorData[param.data.uniqueKey] !== 'undefnied')
			delete visitorData[param.data.uniqueKey];
	}
	else if(param.type == 'reconnecting'){
		close_general_popup_in_force();
		draw_general_popup(
				null,
				null,
				null,
				stringTable.reconnect,
				stringTable.ok,
				null
		);
	}
	else if(param.type == 'connect'){
		close_general_popup_in_force();
		if(typeof param.data.visitorData !== 'undefined'){
			var v = param.data.visitorData;
			var len = 0;
			var now = new Date();
			now = now.getTime();
			for(k in v){
				visitorData[k] = {};
				visitorData[k]['timestamp'] = v[k]['timestamp'];
				visitorData[k]['page'] = v[k]['page'];
				visitorData[k]['deviceType'] = '';
				visitorData[k]['city'] = '';
				visitorData[k]['countryCode'] = '';
				visitorData[k]['newVisitor'] = '';
				visitorData[k]['lastActive'] = '';
				len++;
				try{
					var t = parseInt((now - v[k]['timestamp']) / 1000 / 60);
					if(t > 6)
						t = 6;
					for(i = 0; i <= t; i++)
						realtimeChartData.minute.data[realtimeChartData.minute.data.length - (i+1)][1] += 1;
				} catch(err){
					console.log('error: ' + err);
				}
			}
			realtimeChartData.concurrent = len;
			realtimeChartData.minute.data[realtimeChartData.minute.data.length - 1][1] = realtimeChartData.concurrent;
		}
	}
	else if(param.type == 'visitor-page-change'){
		var uniqueKey = param.data.uniqueKey;
		if(typeof visitorData[uniqueKey] !== 'undefined'){
			var page = param.data.page;
			var now = new Date();
			visitorData[uniqueKey]['page'] = page;
			visitorData[uniqueKey]['lastActive'] = now.getTime();
		}
	}
	else if(param.type == 'session'){
		if(param.data.session != _qadSocket['session'])
		{
			if(serverData.serviceId == 4)
				return;
			var msg = {
				type:'force_logout_ack'
			};
			send_client_message(msg);

			$.ajax({
				url : "/requestreceiver/",
				type : "post",
				data :{
					req_type : "force_logout"
				},
				success : function(response){
					window.location.href = '/?msg=forceout&sessionKey=' + _qadSocket['session'];
				},
				error : function(){}
			});
		}
	}
	else if(param.type == 'chat_message'){
		if(variable.currentLocation != DASHBOARD_LOCATION.CHAT){
			try{
				if(serverData.chatSound)
					$("#soundpack").get(0).play();
			} catch(err){
				// play not supported!
			}
			$("#chat-unread-count").removeClass('unread-count-hide');
			$("#chat-unread-count").addClass('unread-count-show');
			$("#header-dashboard-menu-button").find("#header-notification").remove();
			$("#header-dashboard-menu-button").append("<div id='header-notification'>N</div>");
		}
	}
	else if(param.type == 'askboard_register'){
		try{
			if(serverData.chatSound)
				$("#soundpack").get(0).play();
		} catch(err){
			// play not supported!
		}
		var url = param.data.tag.split('/')[1];
		$("#askboard-unread-count-" + url).removeClass('unread-count-hide');
		$("#askboard-unread-count-" + url).addClass('unread-count-show');
		$("#header-dashboard-menu-button").find("#header-notification").remove();
		$("#header-dashboard-menu-button").append("<div id='header-notification'>N</div>");
		var key = '/' + url
		serverData.askBoardMarker[key] = true;
	}

	// feeding message to jss
	if(typeof data_receiver_realtime !== 'undefined' && variable.currentLocation == DASHBOARD_LOCATION.REALTIME)
		data_receiver_realtime(param);
	if(typeof data_receiver_chat !== 'undefined' && variable.currentLocation == DASHBOARD_LOCATION.CHAT)
		data_receiver_chat(param);
	if(typeof data_receiver_settingcontent !== 'undefined' && variable.currentLocation == DASHBOARD_LOCATION.SETTING_CONTENT)
		data_receiver_settingcontent(param);
}
function block_prevent_escape(){
	variable.blockToMove = false;
	setTimeout(function(){
		variable.blockToMove = true;
	}, 2000);
}
