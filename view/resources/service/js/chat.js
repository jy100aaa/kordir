var variable = {
	userId: serverData.userId,
	counterpartId: serverData.counterpartId,
	serviceId: serverData.serviceId,
	online: true,
	sendUponEnterKey: false,
	myPicture: serverData.myPicture,
	connectionStatusOn: true,
	uniqueKey: serverData.uniqueKey,
	userInfo: {},
	buffer: ''
};
$(function(){
	variable.userInfo = serverData.userInfo;
	$(".connection-status .connection-status-button").bind('click', function(){
		$(this).parent().fadeOut(250);
		variable.connectionStatusOn = false;
	});
	$(".chat-control-wrapper .tool-wrapper .send-upon-enterkey").bind('change', function(){
		variable.sendUponEnterKey = $(this).prop('checked');
		if(variable.sendUponEnterKey){
			$(this).parent().children('button').prop('disabled', true);
		} else {
			$(this).parent().children('button').removeAttr('disabled');
		}
	});
	$(".chat-control-wrapper textarea").bind('keypress', function(e){
		if(e.keyCode == 13 && variable.sendUponEnterKey){
			send_message();
			return false;
		}
	});
	$(".chat-control-wrapper > div > button").bind('click', function(){
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
	process_connection_status();
});
function connection_established(){}
function connection_status_change(type){
	if(type == 'connect'){
		if(variable.online == false){
			close_general_popup_in_force();
			draw_general_popup(
					null,
					null,
					null, 
					stringTable.onlineNow, 
					stringTable.ok, 
					null
			);
		}
		process_connection_status();
	}
	if(type == 'disconnect')
		process_connection_status();
	if(type == 'status-change')
		process_connection_status();
}
function process_connection_status(){
	var online = false;
	for(k in connectionStatus){
		var txt = '';
		var connectionStatusText = $(".connection-status .connection-status-item .connection-status-item-right").find("#connection-status-" + k);
		if(connectionStatus[k] == CONNECTION_STATUS.USER_CONNECTION_STATUS_ONLINE){
			txt = stringTable.online;
			online = true;
		} else if(connectionStatus[k] == CONNECTION_STATUS.USER_CONNECTION_STATUS_BUSY){
			txt = stringTable.busy;
			online = true;
		} else if(connectionStatus[k] == CONNECTION_STATUS.USER_CONNECTION_STATUS_ABSENT){
			txt = stringTable.absent;
			online = true;
		} else if(connectionStatus[k] == CONNECTION_STATUS.USER_CONNECTION_STATUS_PSEUDO_OFFLINE){
			txt = stringTable.offline;
		} else if(connectionStatus[k] == CONNECTION_STATUS.USER_CONNECTION_STATUS_OFFLINE){
			txt = stringTable.offline;
		}
		$(connectionStatusText).text(txt);
	}
	if(online == false && variable.online == true){
		close_general_popup_in_force();
		draw_general_popup(
				null,
				null,
				null, 
				stringTable.allOffline, 
				stringTable.ok, 
				null
		);
		$(".chat-control-wrapper").find('textarea').prop('disabled', true);
		$(".chat-control-wrapper").find('button').prop('disabled', true);
		$(".chat-control-wrapper").find('input').prop('disabled', true);
		variable.online = online;
		return;
	}
	$(".chat-control-wrapper").find('textarea').removeAttr('disabled');
	$(".chat-control-wrapper").find('button').removeAttr('disabled');
	$(".chat-control-wrapper").find('input').removeAttr('disabled');
	if(variable.online == false && online == true){
		close_general_popup_in_force();
		draw_general_popup(
				null,
				null,
				null, 
				stringTable.onlineNow, 
				stringTable.ok, 
				null
		);
	}
	variable.online = online;
}
function send_message(){
	var msg = $(".chat-control-wrapper textarea").val();
		
	if(variable.connectionStatusOn)
		$(".connection-status .connection-status-button").click();
	
	if(msg.length == 0)
		return;
	
	msg = msg.replace(/"/g, '&quot;').replace(/'/g, '&quot;');
	$(".chat-control-wrapper textarea").val("");
	
	var messageWrapperObj = $(".chat-content-wrapper > div.message-wrapper");
	
	var template = "<div class='message'>" +
						"<img src='"+variable.myPicture+"'>" +
						"<div class='msg-right'>" + 
						"<span class='name'>나</span>" +
						"<span class='msg-status'>전송중...</span>" +
						"<span class='date'>"+ get_current_time() +"</span>" +
						"<div class='msg-body'>" + message_presentation(msg) + "</div>" +
						"</div>" +
					"</div>";
		
	$(messageWrapperObj).append(template);
	var sentMessageTemplate = $(messageWrapperObj).children('.message').last();
	var sh = $(messageWrapperObj).parent()[0].scrollHeight;
	$(messageWrapperObj).parent().css('overflow-y', 'hidden');
	$(messageWrapperObj).parent().animate({scrollTop: sh}, 'fast', function(){
		$(messageWrapperObj).parent().css('overflow-y', 'auto');
	});
	
	var data = {
		msg: msg,
		outgoing: false,
		counterpartId: variable.counterpartId,
		serviceId: variable.serviceId,
		userId: variable.userId
	};
	
	var msg = {
		type: 'chat_message',
		data: {
			msg: msg,
			outgoing: false,
			counterpartId: variable.counterpartId,
			serviceId: variable.serviceId,
			userId: variable.userId,
			uniqueKey: variable.uniqueKey 
		}
	};
	
	send_client_message(msg);
	
	$.ajax({
		url : "/requestreceiver/",
		type : "post",
		data :{
			req_type : "send_chat_message",
			data : JSON.stringify(data)
		},
		success : function(res){
			if(res.result == 'ok'){
				$(sentMessageTemplate).find('.msg-status').text('');
			} else {	
				$(sentMessageTemplate).find('.msg-status').text('전송실패').css('color', 'red');
			}
		},
		error : function(){
			$(sentMessageTemplate).find('.msg-status').text('전송실패').css('color', 'red');
		}
	});	
}
function user_chat_message_receiver(msg){	
	if(variable.connectionStatusOn)
		$(".connection-status .connection-status-button").click();
	var messageWrapperObj = $(".chat-content-wrapper > div.message-wrapper");
	var src = variable.userInfo[msg.data.userId]['picture'];
	var name = variable.userInfo[msg.data.userId]['fullname'];
	var msg = msg.data.msg;

	var template = "<div class='message'>" +
						"<img src='"+src+"'>" +
						"<div class='msg-right'>" + 
						"<span class='name'>"+name+"</span>" +
						"<span class='msg-status'></span>" +
						"<span class='date'>"+ get_current_time() +"</span>" +
						"<div class='msg-body'>" + message_presentation(msg) + "</div>" +
						"</div>" +
					"</div>";
	$(messageWrapperObj).append(template);
	var sh = $(messageWrapperObj).parent()[0].scrollHeight;
	$(messageWrapperObj).parent().css('overflow-y', 'hidden');
	$(messageWrapperObj).parent().animate({scrollTop: sh}, 'fast', function(){
		$(messageWrapperObj).parent().css('overflow-y', 'auto');
	});
}
function message_presentation(msg){
	var msgAssembled = '';
	var msgArray = msg.split('\n');
	for(var i = 0; i < msgArray.length; i++)
		msgAssembled += "<div style='min-height:16px;'>" + addHyperLink(msgArray[i]) + '</div>';
	return msgAssembled;
}