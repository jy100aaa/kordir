// chatMessage 
var chatMessage = chatMessage || [];
var selectedCounterpart = -1;
var selectedUniqueKey = '';
var loadingChatMessage = false;
var sendUponEnterKey = false;
var activeChatRoom = false;
var msgTemplate = "<div class='message'>" +
					"<img src=''>" +
					"<div class='msg-right'>" + 
					"<span class='name'></span>" +
					"<span class='msg-status'></span>" +
					"<span class='date'></span>" +
					"<p class='msg-body'></p>" +
					"</div>" +
					"</div>";

$(function(){
	init_chatlist();
	$(".chat-control-wrapper .tool-wrapper .send-upon-enterkey").bind('change', function(){
		sendUponEnterKey = $(this).prop('checked');
		if(sendUponEnterKey){
			$(this).parent().children('button').prop('disabled', true);
		} else {
			$(this).parent().children('button').removeAttr('disabled');
		}
	});
	$(".chat-control-wrapper textarea").bind('keypress', function(e){
		if(e.keyCode == 13 && sendUponEnterKey){
			send_message();
			return false;
		}
	});
	$("div.chat-control-wrapper > div > button").bind('click', function(){
		send_message();
	});
	$(".chat-control-wrapper .textarea-wrapper .send-button").focus(function(e){
		e.preventDefault();
	});
	$(".chat-control-wrapper .textarea-wrapper .send-button").click(function(e){
		e.preventDefault();
		$(this).blur();
		$(this).parent().children('textarea').focus();
		send_message();
	});
	$("#chat-control-window .window-title .previous").bind('click', function(){
		$("#header").show();
		$("#chat-control-window").hide();
		$("#chat-history-window").show();
		$(".chat-control-wrapper textarea").blur();
		selectedCounterpart = -1;
		$("#chat-history-window .window-body .inbox-list-item").each(function(){
			$(this).removeClass('chosen');
		});
	});
	if(variable.chatRequestAcceptedData != null){
		var found = false;
		$("#chat-history-window .window-body .inbox-list-item").each(function(){
			if(variable.chatRequestAcceptedData.counterpartId == $(this).data('counterpartId')){
				$(this).click();
				found = true;
				return;
			}
		});
		if(!found){
			var counterpartId = variable.chatRequestAcceptedData.counterpartId;
			var serviceId = variable.chatRequestAcceptedData.serviceId;
			var uniqueKey = variable.chatRequestAcceptedData.uniqueKey;
			var deviceType = variable.chatRequestAcceptedData.deviceType;
			var userId = variable.chatRequestAcceptedData.userId;
			if(deviceType == 'M'){
				deviceType = stringTable.mobile;
			} else if(deviceType == 'D'){
				deviceType = stringTable.desktop;
			} else if(deviceType == 'T'){
				deviceType = stringTable.tablet;
			}
			var city = variable.chatRequestAcceptedData.city;
			var returning = variable.chatRequestAcceptedData.returning;
			var pageViewNum = variable.chatRequestAcceptedData.pageViewNum;
			var timestamp = get_current_time();
			
			var chatMessageItem = {
				counterpartId: counterpartId,
				pageView: pageViewNum,
				uniqueKey: uniqueKey,
				deviceType: variable.chatRequestAcceptedData.deviceType,
				name: '',
				countryCode: '',
				returning: returning,
				outgoing: false,
				userId: userId,
				allMsg: true,
				timestamp: timestamp,
				msg: []
			};
			
			chatMessage.unshift(chatMessageItem);
			
			var inboxHtml = $("#inbox-list-item-html").html();
			$("#chat-history-window .window-body").prepend(inboxHtml);
			var appendObj = $("#chat-history-window .window-body .inbox-list-item").eq(0);
			$(appendObj).data('online', true);
			$(appendObj).data('counterpartId', counterpartId);
			$(appendObj).bind('click', function(){
				load_chat_item($(this));
			});
			if(returning == true){
				$(appendObj).find('.inbox-list-item-returning').text(stringTable.returningUser);
			} else {
				$(appendObj).find('.inbox-list-item-returning').text(stringTable.newUser);
			}
			$(appendObj).find('.inbox-list-item-new').hide();
			$(appendObj).find('.inbox-list-item-time').text(timestamp);
			$(appendObj).find('.inbox-list-item-location').text(locationMain[city]);
			$(appendObj).find('.inbox-list-item-pageview').text(pageViewNum);
			$(appendObj).find('.inbox-list-item-connection').text(stringTable.visitorOnline).removeClass('red-font').addClass('green-font');
			$(appendObj).find('.inbox-list-item-msg').text('');
			$(appendObj).find('.incoming').hide();
			$(appendObj).find('.outgoing').hide();
			$(appendObj).find('.inbox-list-item-devicetype').text(deviceType);
			$(appendObj).click();
		}
		variable.chatRequestAcceptedData = null;
		$("#chat-history-window .window-body #no-chat-history").hide();
	}
	chat_window_size_adjustment();
	variable.resizeFunc[variable.currentLocation] = chat_window_size_adjustment;
	
	$(".inbox-list-item .inbox-list-item-remove").bind('click', function(e){
		var counterpartId = $(this).parent().data('counterpartId');
		var obj = $(this).parent()[0];
		draw_general_popup(
				function(){
					remove_chat_message(counterpartId, obj);
				},
				null, 
				null, 
				stringTable.askDelete, 
				stringTable.yes, 
				stringTable.no
		);
		e.preventDefault();
		return false;
	});	
});

function init_chatlist(){
	$("#chat-history-window .window-body .inbox-list-item").html('');
	$("#loading-chat-history").hide();
	
	for(var i = 0; i < chatMessage.length; i++){
		var msg = chatMessage[i]['msg'];
		chatMessage[i]['allMsg'] = false;
	}
	if(chatMessage.length == 0){
		$("#no-chat-history").show();
		return;
	}	
	var inboxHtml = $("#inbox-list-item-html").html();
	
	for(var i = 0; i < chatMessage.length; i ++){
		$("#chat-history-window .window-body").append(inboxHtml);
		var appendObj = $("#chat-history-window .window-body .inbox-list-item").last();
		$(appendObj).data('counterpartId', chatMessage[i]['counterpartId']);
		$(appendObj).bind('click', function(){
			load_chat_item($(this));
		});
		for (key in chatMessage[i]){
			if(key == 'msg'){
				var msgObj = $(appendObj).find('.inbox-list-item-msg');
				$(msgObj).text(chatMessage[i][key][0]['msg']);
				
				$(msgObj).adjustHeight({
					height: 40
				});
				
				if(chatMessage[i][key][0]['outgoing'])
					$(appendObj).find('.incoming').hide();
				else
					$(appendObj).find('.outgoing').hide();
				$(appendObj).find('.inbox-list-item-time').text(chatMessage[i][key][0]['created']);
			}
			if(key == 'deviceType'){
				var deviceType = chatMessage[i][key];
				if(deviceType == 'M'){
					deviceType = stringTable.mobile;
				} else if(deviceType == 'D'){
					deviceType = stringTable.desktop;
				} else if(deviceType == 'T'){
					deviceType = stringTable.tablet;
				}
				$(appendObj).find('.inbox-list-item-devicetype').text(deviceType);
			}
			if(key == 'city'){
				$(appendObj).find('.inbox-list-item-location').text(locationMain[chatMessage[i][key]]);
			} 
			if(key == 'pageView'){
				$(appendObj).find('.inbox-list-item-pageview').text(chatMessage[i][key]);
			} 
			if(key == 'returning'){
				var r = chatMessage[i][key];
				if(r == true){
					$(appendObj).find('.inbox-list-item-returning').text(stringTable.returningUser);
				} else {
					$(appendObj).find('.inbox-list-item-returning').text(stringTable.newUser);
				}
			}
			if(key == 'unread'){
				if(!chatMessage[i][key])
					$(appendObj).find('.inbox-list-item-new').hide();
			}
			if(key == 'uniqueKey'){
				if(typeof visitorData[chatMessage[i][key]] !== 'undefined'){
					$(appendObj).find('.inbox-list-item-connection').text(stringTable.visitorOnline).addClass('green-font');
					$(appendObj).data('uniqueKey', chatMessage[i][key]);
					$(appendObj).data('online', true);
				} else {
					$(appendObj).find('.inbox-list-item-connection').text(stringTable.visitorOffline).addClass('red-font');
					$(appendObj).data('uniqueKey', chatMessage[i][key]);
					$(appendObj).data('online', false);
				}
			}
		}
	}
}
function chat_window_size_adjustment(){	
	/* susceptible to the padding of wrappers */
	var dh = document.documentElement.clientHeight;
	var ch = $("#chat-control-window .window-body .chat-control-wrapper").height() + 1;
	var width = (window.innerWidth > 0) ? window.innerWidth : screen.width;
	
	if(width <= 480){
		var dbh = $(".dashboard-body").innerHeight();
		if(dbh < 100){
			setTimeout(chat_window_size_adjustment, 150);
			return;
		}
		$(".chat-window-wrapper").css('height', dbh + 'px');
	}
	
	var height = $(".chat-window-wrapper").height() - $(".chat-window-wrapper #chat-control-window .window-title").height() - ch;
	var dashboardPadding = 0;
	var windowBodyPadding = 0;
	if(width > 480){		
		$(".chat-window").show();
		dashboardPadding = 20;
		windowBodyPadding = 10;		
		height = height - dashboardPadding - windowBodyPadding;
	} else {
		var offsetTop = $("#chat-control-window .window-body").offset().top;
		var compentation = 12;
		height = dh - offsetTop - ch - compentation;
	}
	if(height < 10){
		setTimeout(chat_window_size_adjustment, 150);
		return;
	}
	$("#chat-control-window .chat-content-wrapper").css('height', height + 'px');
}
function data_receiver_chat(msg){
	if(msg.type == 'connect'){
		for(uniqueKey in msg.data.visitorData){
			 $("#chat-history-window .window-body .inbox-list-item").each(function(){
				var uk = $(this).data('uniqueKey');
				if(uniqueKey == uk){
					$(this).data('online', true);
					$(this).find('.inbox-list-item-connection').text(stringTable.visitorOnline).removeClass('red-font').addClass('green-font');
					return;
				}
			 });
		}
	}
	else if(msg.type == 'visitor-connect'){
		var cpid = 0;
		$("#chat-history-window .window-body .inbox-list-item").each(function(){
			var uniqueKey = $(this).data('uniqueKey');
			if(uniqueKey == msg.data.uniqueKey){
				cpid = $(this).data('counterpartId');
				$(this).data('online', true);
				$(this).find('.inbox-list-item-connection').text(stringTable.visitorOnline).addClass('green-font').removeClass('red-font');
				return;
			}
		});
		if(cpid == selectedCounterpart && visitorInChatRoom(msg.data.page)){
			
			close_general_popup_in_force();
			draw_general_popup(
					function(){
						setChatRoomStatus(true);
					},
					null,
					null, 
					stringTable.counterpartIn, 
					stringTable.ok, 
					null
			);	
		}
	} 
	else if(msg.type == 'visitor-disconnect'){
		var cpid = 0;
		$("#chat-history-window .window-body .inbox-list-item").each(function(){
			var uniqueKey = $(this).data('uniqueKey');
			if(uniqueKey == msg.data.uniqueKey){
				cpid = $(this).data('counterpartId');
				$(this).data('online', false);
				$(this).find('.inbox-list-item-connection').text(stringTable.visitorOffline).addClass('red-font').removeClass('green-font');
				return;
			}
		});
		if(cpid == selectedCounterpart){
			close_general_popup_in_force();
			draw_general_popup(
					function(){
						setChatRoomStatus(false);
					},
					null, 
					null, 
					stringTable.counterpartOut, 
					stringTable.ok, 
					null
			);	
		}
	}
	else if(msg.type == 'user_chat_message'){
		var uniqueKey = msg.data.uniqueKey;
		var counterpartId = msg.data.counterpartId;
		var message = {
			msg: msg.data.msg,
			outgoing: true,
			created: get_current_time(),
			userId: msg.data.userId
		};
		var timestamp = get_current_time();
		for(var i = 0; i < chatMessage.length; i++){
			if(chatMessage[i]['counterpartId'] == counterpartId){
				chatMessage[i]['msg'].unshift(message);
				break;
			}
		}
		$("#chat-history-window .window-body .inbox-list-item").each(function(){
			if($(this).data('counterpartId') == msg.data.counterpartId){
				$(this).find('.inbox-list-item-time').text(timestamp);
				$(this).find('.incoming').hide();
				$(this).find('.outgoing').show();
				$(this).find('.inbox-list-item-msg').text(message.msg);
				return;
			}
		});
		if(serverData.id != msg.data.userId && counterpartId == selectedCounterpart)
			append_message(message);
	}
	else if(msg.type == 'chat_message'){
		if(chatMessage.length == 0){
			$("#no-chat-history").hide();
		}
		
		var exist = false;
		var counterpartId = msg.data.counterpartId;
		var uniqueKey = msg.data.uniqueKey;
		var message = {
			msg: msg.data.msg,
			outgoing: false,
			created: get_current_time()
		};
		var timestamp = get_current_time();
		var deviceType = visitorData[uniqueKey]['deviceType']; 
		var city = visitorData[uniqueKey]['city'];
		var returning = !(visitorData[uniqueKey]['newVisitor']);
		var pageView = '';

		$("#chat-history-window .window-body .inbox-list-item").each(function(){
			if($(this).data('counterpartId') == msg.data.counterpartId){
				for(var i = 0 ; i < chatMessage.length; i++){
					if(chatMessage[i]['counterpartId'] == counterpartId)
					{
						chatMessage[i]['timestamp'] = timestamp;
						chatMessage[i]['msg'].unshift(message);
						if(selectedCounterpart != msg.data.counterpartId){
							var chatMessageSaved = {};
							chatMessage[i]['unread'] = true;
							chatMessageSaved = chatMessage[i];
							chatMessage.splice(i, 1);
							chatMessage.unshift(chatMessageSaved);
						}
						break;
					}
				}
				if(selectedCounterpart == msg.data.counterpartId){
					exist = true;
					$(this).find('.inbox-list-item-new').hide();
					$(this).find('.inbox-list-item-time').text(timestamp);
					$(this).find('.incoming').show();
					$(this).find('.outgoing').hide();
					$(this).find('.inbox-list-item-msg').text(message.msg);
				} else {
					exist = true;
					$(this).remove();
				}
				return;
			}
		});
		if(selectedCounterpart == msg.data.counterpartId){
			append_message(message);
			return;
		}		
		if(!exist){
			var newChatMessage = {
				counterpartId: counterpartId,
				pageView: '',
				uniqueKey: uniqueKey,
				name: '',
				contact: '',
				timestamp: timestamp,
				deviceType: deviceType,
				city: '',
				msg: [message]
			};
			chatMessage.unshift(newChatMessage);
		}
		
		var inboxHtml = $("#inbox-list-item-html").html();
		$("#chat-history-window .window-body").prepend(inboxHtml);
		var appendObj = $("#chat-history-window .window-body .inbox-list-item").eq(0);
		$(appendObj).data('counterpartId', counterpartId);
		$(appendObj).bind('click', function(){
			load_chat_item($(this));
		});
		$(appendObj).data('uniqueKey', uniqueKey);
		$(appendObj).data('online', true);
		
		var msgObj = $(appendObj).find('.inbox-list-item-msg');
		$(msgObj).text(message.msg);
		$(msgObj).adjustHeight({
			height: 40
		});
		$(appendObj).find('.incoming').show();
		$(appendObj).find('.outgoing').hide();
		$(appendObj).find('.inbox-list-item-time').text(timestamp);
		if(deviceType == 'M'){
			deviceType = stringTable.mobile;
		} else if(deviceType == 'D'){
			deviceType = stringTable.desktop;
		} else if(deviceType == 'T'){
			deviceType = stringTable.tablet;
		}
		if(returning == true){
			$(appendObj).find('.inbox-list-item-returning').text(stringTable.returningUser);
		} else {
			$(appendObj).find('.inbox-list-item-returning').text(stringTable.newUser);
		}
		$(appendObj).find('.inbox-list-item-connection').text(stringTable.visitorOnline).addClass('green-font');
		$(appendObj).find('.inbox-list-item-devicetype').parent().remove();
		$(appendObj).find('.inbox-list-item-location').parent().remove();
		$(appendObj).find('.inbox-list-item-pageview').parent().remove();
		$(appendObj).find('.inbox-list-item-remove').bind('click', function(){
			draw_general_popup(
					function(){
						remove_chat_message(counterpartId, appendObj);
					},
					null, 
					null, 
					stringTable.askDelete, 
					stringTable.yes, 
					stringTable.no
			);
			e.preventDefault();
			return false;
		});
		if(serverData.chatSound){
			try{
				$("#soundpack").get(0).play();
			}catch(err){
				//play not supported!
			}
		}
	} 
	else if(msg.type == 'visitor-page-change') { 
		if(selectedUniqueKey == msg.data.uniqueKey){
			var page = msg.data.page;
			var inChatRoom = visitorInChatRoom(msg.data.page);
			if(activeChatRoom && !inChatRoom){
				draw_general_popup(
					function(){
						setChatRoomStatus(false);
					},
					null,
					null, 
					stringTable.leaveChatRoom, 
					stringTable.ok, 
					null
				);	
			}
			if(!activeChatRoom && inChatRoom){
				draw_general_popup(
					function(){
						setChatRoomStatus(true);
					},
					null,
					null, 
					stringTable.counterpartIn, 
					stringTable.ok, 
					null
				);	
			}
		}		
	}
}
function load_chat_item(obj){
	$(obj).removeClass('blinking-notification');
	
	if($(obj).data('counterpartId') == selectedCounterpart)
		return;
	selectedCounterpart = $(obj).data('counterpartId');
	selectedUniqueKey = $(obj).data('uniqueKey');
	
	var allMsg = false;
	var online = false;
	var idx = 0;
	for(idx = 0; idx < chatMessage.length; idx++){
		if(chatMessage[idx]['counterpartId'] == selectedCounterpart)
		{
			if(chatMessage[idx]['allMsg'] == true){
				allMsg = true;
			}				
			break;
		}
	}
	if(idx == chatMessage.length)
		return;
	
	$("#chat-history-window .window-body .inbox-list-item").each(function(){
		if($(this).data('counterpartId') == selectedCounterpart){
			$(this).addClass('chosen');
			$(this).find('.inbox-list-item-new').hide();
			online = $(this).data('online');
		}
		else
			$(this).removeClass('chosen');
	});
	loading_chat_message_control(true);
	$.ajax({
		url : "/requestreceiver/",
		type : "post",
		data :{
			req_type : "get_chat_message",
			counterpartId: selectedCounterpart,
			allMsg: allMsg
		},
		success : function(response){
			if(response.result == 'ok'){
				chatMessage[idx]['allMsg'] = true;
				if(!allMsg){
					chatMessage[idx]['msg'] = JSON.parse(response.msg);
				}
				setTimeout(function(){					
					load_chat_message(idx, online, function(){
						loading_chat_message_control(false);
					});
				}, 500);
			} else {
				loading_chat_message_control(false);
				$(this).removeClass('chosen');
				selectedCounterpart = 0;
				draw_general_popup(
						null,
						null, 
						null, 
						stringTable.tryAgain, 
						stringTable.ok, 
						null
				);
			}
		},
		error : function(){
			loading_chat_message_control(false);
			$(this).removeClass('chosen');
			selectedCounterpart = 0;
			draw_general_popup(
					null,
					null, 
					null, 
					stringTable.tryAgain, 
					stringTable.ok, 
					null
			);
		}
	});
}
function loading_chat_message_control(toggle){
	var obj = $("#chat-control-window .window-body .chat-content-wrapper");
	loadingChatMessage = toggle;
	if(toggle){
		$(obj).children('.message-wrapper').hide();
		$(obj).children('#no-chat-selected').hide();
		$(obj).children('#loading-chat-content').show();
	} else {
		$(obj).children('#loading-chat-content').hide();
		$(obj).children('.message-wrapper').show();
		var sh = $(obj)[0].scrollHeight;
		$(obj).css('overflow-y', 'hidden');
		$(obj).animate({
			scrollTop: sh
		}, 'fast');
		$(obj).css('overflow-y', 'auto');
	}
	var w = (window.innerWidth > 0) ? window.innerWidth : screen.width;
	if(w <= 480){
		$(".chat-window-wrapper #chat-history-window").fadeOut(250, function(){
			$(".chat-window-wrapper #chat-control-window").show();
		});
	}
	chat_window_size_adjustment();
}
function load_chat_message(idx, online, callback){
	
	var chatControlWrapperObj = $("#chat-control-window .window-body .chat-control-wrapper");
	var messageWrapperObj = $("#chat-control-window .window-body .chat-content-wrapper .message-wrapper");
	$(messageWrapperObj).html("");
	
	var uniqueKey = chatMessage[idx].uniqueKey;
	var active = false;
	if(online){
		var page = visitorData[uniqueKey]['page'];
		active = visitorInChatRoom(page);
		if(!active){
			var str = stringTable.notInChatRoom.format(page);
			draw_general_popup(
					null,
					null, 
					null, 
					str, 
					stringTable.ok, 
					null
			);
		}
	} 
	setChatRoomStatus(active);
	
	var assembled = '';
	for(var i = 0; i < chatMessage[idx]['msg'].length; i++){
		assembled += msgTemplate;
	}
	var iter = chatMessage[idx]['msg'].length - 1;
	$("#chat-control-window .window-body .chat-content-wrapper .message-wrapper").append(assembled);

	$("#chat-control-window .window-body .chat-content-wrapper .message-wrapper .message").each(function(){
		var m = chatMessage[idx]['msg'][iter];
		var created = m['created'];
		var name = '';
		var src = '';
		var outgoing  = m['outgoing'];
		var userId = m['userId'] + '';
		var msg = m['msg'];
		if(outgoing){
			name = userInfo[userId]['fullname'];
			src = userInfo[userId]['picture'];
		} else {
			name = stringTable.visitor;
			src = '/resources/images/default_user.jpg';
		}
		$(this).children('img').attr('src', src);
		$(this).children('.msg-right').children('.name').text(name);
		$(this).children('.msg-right').children('.date').text(created);
		$(this).children('.msg-right').children('.msg-body').html(message_presentation(msg));
		iter--;
	});
	callback();
}
function append_message(msg){
	var wrapperObj = $("#chat-control-window .window-body .chat-content-wrapper .message-wrapper");
	$(wrapperObj).append(msgTemplate);
	var obj = $(wrapperObj).children('.message').last();
	
	var name = '';
	var src = '';
	var timestamp = get_current_time();
	
	if(msg.outgoing == true){
		userId = msg.userId + '';
		name = userInfo[userId]['fullname'];
		src = userInfo[userId]['picture'];
	} else {
		name = stringTable.visitor;
		src = '/resources/images/default_user.jpg';
	}
	$(obj).children('img').attr('src', src);
	$(obj).children('.msg-right').children('.name').text(name);
	$(obj).children('.msg-right').children('.date').text(timestamp);
	$(obj).children('.msg-right').children('.msg-body').html(message_presentation(msg.msg));
	$(obj).children('.msg-right').children('.msg-status').text(msg.msgStatus);
	
	var sh = $("#chat-control-window .window-body .chat-content-wrapper")[0].scrollHeight;
	$("#chat-control-window .window-body .chat-content-wrapper").animate({
		scrollTop: sh
	}, 'fast');	
	return obj;
}
function message_presentation(msg){
	var msgAssembled = '';
	var msgArray = msg.split('\n');
	for(var i = 0; i < msgArray.length; i++)
		msgAssembled += "<div style='min-height:16px;'>" + addHyperLink(msgArray[i]) + '</div>';
	return msgAssembled;
}
function send_message(){
	var msg = $(".chat-control-wrapper textarea").val();
	if(msg.length == 0)
		return;
	msg = msg.replace(/"/g, '&quot;').replace(/'/g, '&quot;');
	$(".chat-control-wrapper textarea").val("");
	
	var data = {
		userId: serverData.id,
		msg: msg,
		outgoing: true,
		created: get_current_time(),
		serviceId: serverData.service_id,
		uniqueKey: selectedUniqueKey,
		counterpartId: selectedCounterpart
	};
	
	var message = {
		type: 'user_chat_message',
		data: data
	};
	
	var obj = append_message({msg: msg, outgoing: true, created: get_current_time(), userId: serverData.id, msgStatus: '전송중...'});
	send_client_message(message);
	
	$.ajax({
		url : "/requestreceiver/",
		type : "post",
		data :{
			req_type : "send_chat_message",
			data : JSON.stringify(data),
		},
		success : function(res){
			if(res.result == 'ok'){
				$(obj).find('.msg-status').text('');
			} else {	
				$(obj).find('.msg-status').text('전송실패').css('color', 'red');
			}
		},
		error : function(){
			$(obj).find('.msg-status').text('전송실패').css('color', 'red');
		}
	});	
}
function setChatRoomStatus(active){
	var chatControlWrapperObj = $("#chat-control-window .window-body .chat-control-wrapper");
	if(active){
		$(chatControlWrapperObj).children('.textarea-wrapper').children('textarea').removeAttr('disabled');
		$(chatControlWrapperObj).children('.textarea-wrapper').children('button').removeAttr('disabled');
		$(chatControlWrapperObj).children('.tool-wrapper').children('button').removeAttr('disabled');
		$(chatControlWrapperObj).children('.tool-wrapper').children('input').removeAttr('disabled');
	} else {
		$(chatControlWrapperObj).children('.textarea-wrapper').children('textarea').prop('disabled', true);
		$(chatControlWrapperObj).children('.textarea-wrapper').children('button').prop('disabled', true);
		$(chatControlWrapperObj).children('.tool-wrapper').children('button').prop('disabled', true); 
		$(chatControlWrapperObj).children('.tool-wrapper').children('input').prop('disabled', true);
	}
	activeChatRoom = active;
}
function visitorInChatRoom(page){
	for(var i = 0; i < chatUrl.length; i++){
		if(page == chatUrl[i]){
			return true;
		}
	}
	return false;
}
function remove_chat_message(counterpartId, obj){
	var data = {
		counterpartId: counterpartId,
		serviceId: serverData.service_id
	};
		
	draw_progress();
	
	$.ajax({
		url : "/requestreceiver/",
		type : "post",
		data :{
			req_type : "remove_chat_message",
			data: JSON.stringify(data)
		},
		success : function(response){
			remove_progress();
			if(response.result == 'ok'){
				$(obj).remove();
				$("#chat-control-window .window-body .chat-content-wrapper .message-wrapper .message").remove();
				$("#chat-control-window .window-body .chat-content-wrapper #no-chat-selected").fadeIn(150);
				var idx = -1;
				for(var i = 0; i < chatMessage.length; i++){
					if(chatMessage[i].counterpartId == counterpartId){
						idx = i; 
						break;
					}
				}
				if(idx != -1)
					chatMessage.splice(idx, 1);				
			} else {
				draw_general_popup(
						null,
						null, 
						null, 
						stringTable.tryAgain, 
						stringTable.ok, 
						null
				);
			}
		},
		error : function(){
			remove_progress();
			draw_general_popup(
					null,
					null, 
					null, 
					stringTable.tryAgain, 
					stringTable.ok, 
					null
			);
		}
	});	
}
