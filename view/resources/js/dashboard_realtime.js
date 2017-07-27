$(function(){
	realtimeChartData.minute.obj = "online-user-chart-minute";
	realtimeChartData.second.obj = "online-user-chart-second";
	realtimeChartData.newReturnVisitor.obj = "realtime-new-return-chart";
	realtimeChartData.device.obj = "realtime-device-chart";
	realtimeChartData.region.obj = "realtime-region-chart";
	realtimeChartData.referral.obj = "realtime-referral-chart";
	// var readyStateCheckInterval = setInterval(function() {
	//     if (document.readyState === "complete" && typeof google !== 'undefined') {
	//     	clearInterval(readyStateCheckInterval);
	//     	if(realtimeChartData.dataReceived != false){
	//     		draw_chart(realtimeChartData.newReturnVisitor);
	//     		draw_chart(realtimeChartData.device);
	//     		draw_chart(realtimeChartData.region);
	//     		draw_chart(realtimeChartData.referral);
	//     	}
	//     	draw_chart(realtimeChartData.second);
	//     	draw_chart(realtimeChartData.minute);
	//     	construct_connection_list_table();
	//     	run_timer();
	//     }
	// }, 200);
    google.charts.load('current', {'packages': ['geochart', 'corechart', 'table'], 'language': 'ko'});
    google.charts.setOnLoadCallback(function(){
        if(realtimeChartData.dataReceived != false){
            draw_chart(realtimeChartData.newReturnVisitor);
            draw_chart(realtimeChartData.device);
            draw_chart(realtimeChartData.region);
            draw_chart(realtimeChartData.referral);
        }
        draw_chart(realtimeChartData.second);
        draw_chart(realtimeChartData.minute);
        construct_connection_list_table();
        run_timer();
    });
	variable.resizeFunc[variable.currentLocation] = realtime_window_size_adjustment;
	if(oldIE){
		$(".online-user-chart-minute").css('height', '0');
		$(".online-user-chart-second").css('height', '0');
	}
});
function draw_chart(c){
	if(typeof variable.currentLocation === 'undefined')
		return;
	if(variable.currentLocation != DASHBOARD_LOCATION.REALTIME)
		return;
	try {
	    var test = google.visualization.arrayToDataTable;
    } catch (err) {
	    return;
    }
	var obj = null;
	var data = google.visualization.arrayToDataTable(c.data);
	var options = c.options;
	try {
		obj = document.getElementById(c.obj);
		$(c.obj).html('');
	} catch(err) {
		return;
	}
	var chart;

	try {
		if(oldIE){
			chart = new google.visualization.Table(obj);
			if($(obj).hasClass('online-user-chart-minute') ||
					$(obj).hasClass('online-user-chart-second')){
				return;
			}
		} else {
			if(c.type == INFOGRAPHIC_TYPE.PIE_CHART){
				chart = new google.visualization.PieChart(obj)
			} else if(c.type == INFOGRAPHIC_TYPE.LINE_CHART){
		        chart = new google.visualization.LineChart(obj);
			} else if(c.type == INFOGRAPHIC_TYPE.COLUMN_CHART){
				chart = new google.visualization.ColumnChart(obj);
		        options['colors'] = ['#789'];
			} else if(c.type == INFOGRAPHIC_TYPE.BAR_CHART){
				chart = new google.visualization.BarChart(obj);
		        options['colors'] = ['#789'];
			} else if(c.type == INFOGRAPHIC_TYPE.TABLE){
				chart = new google.visualization.Table(obj);
			}
		}
		chart.draw(data, options);
	} catch(err){
	}
}
function run_timer(){
	if(typeof realtimeChartData.timer.second === 'undefined')
		return;

	if(realtimeChartData.timer.second != null || realtimeChartData.timer.minute != null){
		return;
	}
	realtimeChartData.timer.second = setInterval(function(){
		var len = realtimeChartData.second.data.length;
		for(var i = 1; i <= len - 2; i++){
			realtimeChartData.second.data[i][1] = realtimeChartData.second.data[i+1][1];
		}
		realtimeChartData.second.data[len-1][1] = realtimeChartData.connectionSpot;
		realtimeChartData.connectionSpot = 0;

		if(variable.currentLocation == DASHBOARD_LOCATION.REALTIME)
			draw_chart(realtimeChartData.second);

	}, 1000);
	realtimeChartData.timer.minute = setInterval(function(){
			var len = realtimeChartData.minute.data.length;
			for(var i = 1; i < len - 1; i++){
				realtimeChartData.minute.data[i][1] = realtimeChartData.minute.data[i+1][1];
			}
			realtimeChartData.minute.data[len-1][1] = realtimeChartData.concurrent;
			if(variable.currentLocation == DASHBOARD_LOCATION.REALTIME)
				draw_chart(realtimeChartData.minute);
			// position should be here
			realtimeChartData.maxSpot = realtimeChartData.concurrent;
			var p = {};
			p.type = 'update-timestamp';
			if(variable.currentLocation == DASHBOARD_LOCATION.REALTIME)
				update_connection_list_table(p);
	}, 60000);
}
function display_concurrent_connection_number(){
	$("#online-user > div.analytics-body > div.online-user-number > div.online-user-number-value > span").text(realtimeChartData.concurrent);
}
function construct_connection_list_table(){
	display_concurrent_connection_number();
	var onlineUserListTableObj = $("#online-user-list-table");

	if(realtimeChartData.concurrent == 0)
	{
		$(onlineUserListTableObj).prop('table-on', false);
		$(onlineUserListTableObj).children('table').hide();
		$(onlineUserListTableObj).children('.analytics-no-data').show();
		return;
	} else {
		$(onlineUserListTableObj).prop('table-on', true);
		$(onlineUserListTableObj).children('table').show();
		$(onlineUserListTableObj).children('.analytics-no-data').hide();
	}
	var tBody = $(onlineUserListTableObj).find('tbody');
	$(tBody).html('');
	var seq = 1;
	var str = "";
	var now = new Date();
	for(k in visitorData){
		var location = locationMain[visitorData[k]['city']];
		var page = visitorData[k]['page'];
		var timestamp = visitorData[k]['timestamp'];
		var deviceType = visitorData[k]['deviceType'];
		if(deviceType == 'M')
			deviceType = stringTable.mobile;
		else if(deviceType == 'T')
			deviceType = stringTable.tablet;
		else if(deviceType == 'D')
			deviceType = stringTable.desktop;
		else
			deviceType = '';
		var newVisitor = visitorData[k]['newVisitor'];
		if (newVisitor == "True")
			newVisitor = "N";
		else
			newVisitor = "Y";

		var t = Math.round((now.getTime() - timestamp) / 1000 / 60) + '분';

		str += "<tr id='"+k+"' class='user-online-table-tr' onclick=chat_request_popup('"+k+"')>";
		str += "<td >" + (seq++) + "</td>";
		str += "<td >" + location + "</td>";
		str += "<td class='online-user-list-table-timestamp'>" + t + "</td>";
		str += "<td class='page'>" + page + "</td>";
		str += "<td >" + deviceType + "</td>";
		str += "<td >" + newVisitor + "</td>";
		str += "</tr>";
	}
	$(tBody).append(str);
}
function update_connection_list_table(param){
	var onlineUserListTableObj = $("#online-user-list-table");
	var tBody = $(onlineUserListTableObj).find('tbody');

	if(param.type == 'update-timestamp'){
		if(realtimeChartData.concurrent == 0)
			return;
		var now = new Date();
		now = now.getTime();
		var timestampObj = $("#online-user-list-table table tbody tr .online-user-list-table-timestamp");
		for(var i = 0; i < timestampObj.length; i++){
			var t = $(timestampObj).eq(i).text();
			var minute = parseInt(t.split(stringTable.minute)[0]);
			minute += 1;
			t = minute + stringTable.minute;
			$(timestampObj).eq(i).text(t);
		}
	}
	if(param.type == 'visitor-page-change'){
		var tableRow = $(tBody).find('#' + param.data.uniqueKey);
		$(tableRow).children('.page').text(param.data.page);
	}
	if(param.type == 'visitor-connect'){
		var deviceType = param.data.deviceType;
		if(deviceType == 'M')
			deviceType = stringTable.mobile;
		else if(deviceType == 'T')
			deviceType = stringTable.tablet;
		else if(deviceType == 'D')
			deviceType = stringTable.desktop;
		else
			deviceType = '';
		var newVisitor = "Y"
		if(param.data.newVisitor == "True")
			newVisitor = "N";

		var seq = $(tBody).children('tr').length + 1;
		var str = ""
		str += "<tr id='"+param.data.uniqueKey+"' class='user-online-table-tr' onclick=chat_request_popup('"+param.data.uniqueKey+"')>";
		str += "<td >" + seq + "</td>";
		str += "<td >" +  locationMain[param.data.city] + "</td>";
		str += "<td class='online-user-list-table-timestamp'>0분</td>";
		str += "<td class='page'>" + param.data.page + "</td>";
		str += "<td >" + deviceType + "</td>";
		str += "<td >"+newVisitor+"</td>";
		str += "</tr>";
		$(tBody).append(str);
	}
	if(param.type == 'visitor-disconnect'){
		var tableRow = $(tBody).find('#' + param.data.uniqueKey);
		$(tableRow).remove();
		if(realtimeChartData.concurrent == 0)
		{
			$(onlineUserListTableObj).children('table').hide();
			$(onlineUserListTableObj).children('.analytics-no-data').show();
		}
	}
}
function chat_request_popup(uniqueKey){
	if(variableRealTime.chatURL == ''){
		draw_general_popup(
				null,
				null,
				null,
				stringTable.noChatURL,
				stringTable.ok,
				null
		);
		return;
	}

	var str = uniqueKey + ' ' + stringTable.chatRequestToUser;
	draw_general_popup(
			function(){
				chat_request(uniqueKey, variableRealTime.chatURL);
			},
			null,
			null,
			str,
			stringTable.yes,
			stringTable.no
	);
}
function chat_request(uniqueKey, chatURL){
	var str = stringTable.waitChatRequest + "<br><br>";
	str += "<img src='/resources/images/progress_white_background.gif' style='width:30px; height:30px;'>";
	var msg = {
		type: 'send_chat_request',
		data: {
			uniqueKey: uniqueKey,
			userName: serverData.fullname,
			userId: serverData.id,
			chatURL: chatURL,
			serviceId: serverData.service_id
		}
	};
	send_client_message(msg);

	variableRealTime.chatRequest.waiting = true;
	variableRealTime.chatRequest.uniqueKey = uniqueKey;

	draw_general_popup(
			function(){
				var msg = {
					type: 'cancel_chat_request',
					data: {
						serviceId: serverData.service_id,
						uniqueKey: uniqueKey
					}
				};
				send_client_message(msg);
			},
			null,
			null,
			str,
			stringTable.cancel,
			null
	);
}
function data_receiver_realtime(param){
	if(param.type == 'visitor-connect' || param.type == 'visitor-disconnect'){
		realtimeChartData.concurrent = parseInt(param.data.concurrent);
		display_concurrent_connection_number();
		if(realtimeChartData.dataReceived == false && param.type == 'visitor-connect'){
			$("#analytics-realtime .analytics-box .realtime-chart").show();
			$("#analytics-realtime .analytics-box .analytics-no-data").hide();
			realtimeChartData.dataReceived = true;
		}
		if(param.type == 'visitor-connect'){
			// pie chart data
			realtimeChartData.connectionSpot += 1;
			realtimeChartData.maxSpot += 1;

			if(param.data.newVisitor == "True"){
				realtimeChartData.newReturnVisitor.data[1][1] += 1;
			}  else {
				realtimeChartData.newReturnVisitor.data[2][1] += 1;
			}
			if(param.data.deviceType == 'D'){
				realtimeChartData.device.data[1][1] += 1;
			} else if(param.data.deviceType == 'M'){
				realtimeChartData.device.data[2][1] += 1;
			}
			else if(param.data.deviceType == 'T'){
				realtimeChartData.device.data[3][1] += 1;
			}

			// table chart data
			var city = param.data.city;
			var found = false;
			for(k in locationMain){
				if(city == k){
					city = locationMain[k];
					break;
				}
			}
			found = false;
			for(var i = 1; i < realtimeChartData.region.data.length; i++){
				if(realtimeChartData.region.data[i][0] == city){
					realtimeChartData.region.data[i][1] += 1;
					found = true;
					break;
				}
			}
			if(!found){
				var item = [city, 1];
				realtimeChartData.region.data.push(item);
			}
			var ref = param.data.ref;
			if(ref.length == 0){
				ref = stringTable.direct;
			}
			found = false;
			for(var i = 1; i < realtimeChartData.referral.data.length; i++){
				if(realtimeChartData.referral.data[i][0] == ref){
					realtimeChartData.referral.data[i][1] += 1;
					found = true;
					break;
				}
			}
			if(!found){
				var item = [ref, 1];
				realtimeChartData.referral.data.push(item);
			}
			draw_chart(realtimeChartData.newReturnVisitor);
			draw_chart(realtimeChartData.device);
			draw_chart(realtimeChartData.region);
			draw_chart(realtimeChartData.referral);
		}
		else{
			if(realtimeChartData.connectionSpot > 0)
				realtimeChartData.connectionSpot = realtimeChartData.connectionSpot - 1;
		}
		var len = realtimeChartData.minute.data.length;
		realtimeChartData.minute.data[len-1][1] = realtimeChartData.maxSpot;
		draw_chart(realtimeChartData.minute);
		if($("#online-user-list-table").prop('table-on') == false)
			construct_connection_list_table();
		else
			update_connection_list_table(param);
	}
	if(param.type == 'connect'){
		construct_connection_list_table();
		draw_chart(realtimeChartData.minute);
	}
	if(param.type == 'visitor-page-change'){
		update_connection_list_table(param);
	}
	if(param.type == 'chat_request_reject'){
		variableRealTime.chatRequest.waiting = false;
		variableRealTime.chatRequest.uniqueKey = '';
		close_general_popup_in_force();
		var str = param.data.uniqueKey + ' ' + stringTable.chatRequestRejected;
		draw_general_popup(
				null,
				null,
				null,
				str,
				stringTable.ok,
				null
		);
	}
	if(param.type == 'chat_request_accept'){
		close_general_popup_in_force();
		variableRealTime.chatRequest.waiting = false;
		variable.chatRequestAcceptedData = param.data;
		location.hash = variableRealTime.chatURL.replace('/', '');
	}
	if(param.type == 'visitor-disconnect' || param.type == 'visitor-page-change'){
		if(variableRealTime.chatRequest.waiting == true &&
				variableRealTime.chatRequest.uniqueKey == param.data.uniqueKey &&
				param.data.page != variableRealTime.chatURL){
			variableRealTime.chatRequest.waiting = false;
			variableRealTime.chatRequest.uniqueKey = '';
			var str = param.data.uniqueKey + ' ' + stringTable.chatRequestLeft;
			close_general_popup_in_force();
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
}
function realtime_window_size_adjustment(){
	// realtime chart
	draw_chart(realtimeChartData.second);
	draw_chart(realtimeChartData.minute);
	if(realtimeChartData.dataReceived){
		draw_chart(realtimeChartData.newReturnVisitor);
		draw_chart(realtimeChartData.device);
		draw_chart(realtimeChartData.region);
		draw_chart(realtimeChartData.referral);
	}
}