var express = require('express');
var request = require('request');
var bodyParser = require('body-parser');
var app = express();
var http = require('http');
var server = http.createServer(app);
var io = require('socket.io').listen(server, {log: false});

app.set('port', process.env.PORT || 8000);
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

//server start
server.listen(app.get('port'), function(){
	console.log("main server listening on port " + app.get('port'));
});

//var elasticIP = '54.65.65.141';
var elasticIP = '127.0.0.1';
var visitorConnectionStatus = {};
var dashboardConnectionStatus = {};

// socket

var dashboardIO = io
	.of('/dashboard')
	.on('connection', function(socket){
		socket.on('initial-connection', function(data){
			var sessionMsg = {
				type:'session',
				data:{
					session: data.session
				}
			};
			dashboardIO.to(data.serviceId + '-' + data.userId).emit('server-message', sessionMsg);
			socket.join(data.serviceId);
			socket.join(data.serviceId + '-' + data.userId);
			socket.serviceId = data.serviceId;
			socket.userId = data.userId;
			
			try{ clearTimeout(dashboardConnectionStatus[data.serviceId][data.userId]['timer']);	} catch(err){}
			
			if(typeof dashboardConnectionStatus[data.serviceId] === 'undefined')
				dashboardConnectionStatus[data.serviceId] = {};
			if(typeof dashboardConnectionStatus[data.serviceId][data.userId] === 'undefined'){
				dashboardConnectionStatus[data.serviceId][data.userId] = {};
				dashboardConnectionStatus[data.serviceId][data.userId]['timer'] = null;
			}
	
			var msg = {
				type: 'connect',
				data: {
					serviceId: data.serviceId,
					userId: data.userId,
					connectionStatus: data.connectionStatus
				}
			};
			// emitting msg to visitors
			visitorIO.to(data.serviceId).emit('server-message', msg);
			var ucs = visitorConnectionStatus[data.serviceId];
			if(typeof ucs !== 'undefined'){
				var visitorData = {};
				for(k in ucs){
					visitorData[k] = {};
					visitorData[k]['timestamp'] = ucs[k]['timestamp'];
					visitorData[k]['page'] = ucs[k]['page'];
				}
				msg.data['visitorData'] = visitorData;
				dashboardIO.to(data.serviceId + '-' + data.userId).emit('server-message', msg);
			}
		});
		socket.on('client-message', function(msg){
			if(msg.type == 'status-change'){
				var d = {
					req_type: 'user_connection_status_change',
					user_id: msg.data.userId,
					service_id: msg.data.serviceId,
					connection_status: msg.data.connectionStatus
				};
				http_request(d);
				
				var m = {
					type: 'status-change',
					data: {
						serviceId: msg.data.serviceId,
						userId: msg.data.userId,
						connectionStatus: msg.data.connectionStatus
					}
				};
				visitorIO.to(msg.data.serviceId).emit('server-message', m);
			}
			if(msg.type =='send_chat_request'){
				var m = {
					type: 'chat_request',
					data: {
						userId: msg.data.userId,
						userName: msg.data.userName,
						chatURL: msg.data.chatURL,
						serviceId: msg.data.serviceId
					}
				};
				visitorIO.to(msg.data.serviceId + '-' + msg.data.uniqueKey).emit('server-message', m);
			}
			if(msg.type == 'cancel_chat_request'){
				var m = {
					type: 'cancel_chat_request'
				};
				visitorIO.to(msg.data.serviceId + '-' + msg.data.uniqueKey).emit('server-message', m);
			}
			if(msg.type == 'user_chat_message'){
				visitorIO.to(msg.data.serviceId + '-' + msg.data.uniqueKey).emit('server-message', msg);
				dashboardIO.to(msg.data.serviceId).emit('server-message', msg);
			}
			if(msg.type == 'force_logout_ack'){
				dashboardConnectionStatus[socket.serviceId][socket.userId]['forceOutConnection'] = true;
			}
		});
		socket.on('disconnect', function(data){
			if(typeof dashboardConnectionStatus[socket.serviceId] === 'undefined')
				return;
			if(typeof dashboardConnectionStatus[socket.serviceId][socket.userId] === 'undefined')
				return;
			
			// remove timer if any 
			try{
				clearTimeout(dashboardConnectionStatus[socket.serviceId][socket.userId]['timer']);
			} catch(err){
				console.log('error in timer: ' + err);
			}
			// pending 10 seconds	
			dashboardConnectionStatus[socket.serviceId][socket.userId]['timer'] = setTimeout(function(){
				try{
					if(typeof dashboardConnectionStatus[socket.serviceId][socket.userId]['forceOutConnection'] !== 'undefined'){
						delete dashboardConnectionStatus[socket.serviceId][socket.userId]['forceOutConnection'];
						clearTimeout(dashboardConnectionStatus[socket.serviceId][socket.userId]['timer']);
						return;
					}
					var ucs = dashboardConnectionStatus[socket.serviceId];
					if (typeof dashboardConnectionStatus[socket.serviceId][socket.userId] !== 'undefined')
						delete dashboardConnectionStatus[socket.serviceId][socket.userId];
					var concurrent = 0;
					for(k in ucs)
						concurrent++;
					var msg = {
						type: 'disconnect',
						data: {
							serviceId: socket.serviceId,
							userId: socket.userId
						}
					};
					visitorIO.to(socket.serviceId).emit('server-message', msg);
					
					var d = {
						req_type: 'user_connection_status_change',
						user_id: socket.userId,
						service_id: socket.serviceId,
						connection_status: '4'
					};
					http_request(d);
				} catch(err){
					console.log('error in timer: ' + err);
				}
			}, 10000);	
		});
});

var visitorIO = io
	.of('/visitor')
	.on('connection', function(socket){
		socket.on('initial-connection', function(data){			
			/* set data to socket */
			socket.serviceId = data.serviceId;
			socket.uniqueKey = data.uniqueKey;
			socket.join(data.serviceId);
			socket.join(data.serviceId + '-' + data.uniqueKey);
			
			if(typeof visitorConnectionStatus[data.serviceId] === 'undefined')
			{
				visitorConnectionStatus[data.serviceId] = {};
			}
			if(typeof visitorConnectionStatus[data.serviceId][data.uniqueKey] !== 'undefined'){
				if(typeof visitorConnectionStatus[data.serviceId][data.uniqueKey]['timer'] !== 'undefined'){
					clearTimeout(visitorConnectionStatus[data.serviceId][data.uniqueKey]['timer']);
					visitorConnectionStatus[data.serviceId][data.uniqueKey]['page'] = data.page;
					var msg = {
						type: 'visitor-page-change',
						data: {
							uniqueKey: data.uniqueKey,
							page: data.page
						}
					};
					dashboardIO.to(socket.serviceId).emit('server-message', msg);
				}
			} else {	
				visitorConnectionStatus[data.serviceId][data.uniqueKey] = {};
				var now = new Date();
				visitorConnectionStatus[data.serviceId][data.uniqueKey]['timestamp'] = now.getTime();
				visitorConnectionStatus[data.serviceId][data.uniqueKey]['page'] = data.page;
				var concurrent = 0;
				var ucs = visitorConnectionStatus[data.serviceId];
				for(var k in ucs)
					concurrent++;
				// emitting msg to dashboard
				var msg = {
					type: 'visitor-connect',
					data: {
						concurrent: concurrent,
						page: data.page
					}
				};
				for(k in data)
					msg.data[k] = data[k];
				dashboardIO.to(socket.serviceId).emit('server-message', msg);
				
				// notify visitor of connection status
				notify_dashboard_connection_status(data.serviceId, data.uniqueKey);
			}
		});
		socket.on('client-message', function(msg){
			if(msg.type == 'chat_request_accept' || msg.type == 'chat_request_reject'){
				dashboardIO.to(socket.serviceId + '-' + msg.data.userId).emit('server-message', msg);
			} 
			if(msg.type == 'chat_message'){
				dashboardIO.to(msg.data.serviceId).emit('server-message', msg);
			}
			if(msg.type == 'askboard_register'){
				dashboardIO.to(msg.data.serviceId).emit('server-message', msg);
			}
		});
		socket.on('disconnect', function(data){
			if(typeof visitorConnectionStatus[socket.serviceId] === 'undefined')
				return;
			if(typeof visitorConnectionStatus[socket.serviceId][socket.uniqueKey] === 'undefined')
				return;
			if(typeof visitorConnectionStatus[socket.serviceId][socket.uniqueKey]['timestamp'] === 'undefined')
				return;
			visitorConnectionStatus[socket.serviceId][socket.uniqueKey]['timer'] = setTimeout(function(){
				var t = new Date();
				var timestamp = t.getTime();
				
				try{
					timestamp =  visitorConnectionStatus[socket.serviceId][socket.uniqueKey]['timestamp'];
				}
				catch(e){
					console.log('timestamp undefined');
				}
				var serviceId = socket.serviceId;
				var uniqueKey = socket.uniqueKey;
				
				var gap = (t.getTime() - timestamp) / 1000;
				var ucs = visitorConnectionStatus[serviceId];
				
				delete visitorConnectionStatus[serviceId][uniqueKey];
				
				var concurrent = 0;
				for(key in ucs)
					concurrent++;

				var msg = {
					type: 'visitor-disconnect',
					data: {
						concurrent: concurrent,
						uniqueKey: uniqueKey
					}
				};
				dashboardIO.to(serviceId).emit('server-message', msg);
				
				var d = {
					req_type: 'visitor_out',
					service_id: socket.serviceId,
					duration: gap,
				};
				http_request(d);
								
			}, 2500);
		});
});

// send http request
function http_request(data) {
	console.log('http_request data: ' + JSON.stringify(data));
	request.post({
		url:     'http://'+elasticIP+'/requestreceiver/',
		form:    data
	}, function(error, response, body){
		if (!error && response.statusCode == 200) {
			console.log(body);
		}
	});
}

// node -> visitor 
function notify_dashboard_connection_status(serviceId, uniqueKey){
	var ucs = dashboardConnectionStatus[serviceId];
	var dashboardData = {};
	if(typeof ucs !== 'undefined'){
		for(k in ucs)
			dashboardData[k] = true;
	}
	var msg = {
		type: 'visitor-connect',
		data: {
			dashboardData: dashboardData
		}
	};
	visitorIO.to(serviceId + '-' + uniqueKey).emit('server-message', msg);
}

// http request receiver
app.post("/relaytodashboard", function(request, response){
	if (!request.body) 
		return res.sendStatus(400);
	if(request.body.type == 'slideprocess-done'){
		console.log('to dashboard: ' + JSON.stringify(request.body));
		dashboardIO.to(request.body.data.serviceId).emit('server-message', request.body);	
	}
	response.setHeader('Content-Type', 'application/json');
	response.end(JSON.stringify({result: "ok"}));
});