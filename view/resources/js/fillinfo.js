var variable = {
	currentPosition: 0,
	userPictureUploadButtonText: '',
	servicePictureUploadButtonText: '',
	userPictureFileName: 'default_user.jpg',
	servicePictureFileName: 'default_service.jpg',
	authorized: false,
	authTimer: null,
	authTimeout: 180
};

$(function(){
	var minHeight = $("#content").height() - $("#header-wrapper").outerHeight();
	$("#content").css('min-height',minHeight);
	$(".progress-status-area .status-block").bind('click', function(){
		var id = $(this).prop('id');
		var dest;
		if(id.indexOf('my') != -1){
			dest = 0;
		} else {
			dest = 1;
		}
		nav(dest);
	});
	
	variable.userPictureUploadButtonText = $("#my-info .input-line .picture-select-button").text();
	variable.servicePictureUploadButtonText = $("#service-info .input-line .picture-select-button").text();
	
	document.getElementById("user-file-upload-target").onload = user_file_upload_done;
	document.getElementById("service-file-upload-target").onload = service_file_upload_done;

	$("#my-info #user-picture-upload-form #user-picture-file").bind('change', function(){
		// IE !!!!!!!!!!
		if($(this).val().length == 0)
			return;
		var val = $(this).val();
		if(val.length == 0)
			return;
		$("#user-picture-upload-form .uuid").val(generate_uuid());
		$(this).parent().attr('target', 'user-file-upload-target');
		var ext = val.split(".").pop();
		show_button_progress($("#my-info .input-line .picture-select-button"));
		$(this).parent().submit();
		button_lockdown($("#service-info .bottom-button-area #finish-button"), true);
		$("input:file").clearInputs();
	});
	$("#service-info #service-picture-upload-form #service-picture-file").bind('change', function(){
		// IE !!!!!!!!!!
		if($(this).val().length == 0)
			return;
		var val = $(this).val();
		if(val.length == 0)
			return;
		$("#service-picture-upload-form .uuid").val(generate_uuid());
		$(this).parent().attr('target', 'service-file-upload-target');
		var ext = val.split(".").pop();
		show_button_progress($("#service-info .input-line .picture-select-button"));
		$(this).parent().submit();
		button_lockdown($("#service-info .bottom-button-area #finish-button"), true);
		$("input:file").clearInputs();
	});
	var appendStr = "";
	for(var i = 0; i < locationMainArray.code.length; i++){
		appendStr += "<option value='"+locationMainArray.code[i]+"'>"+locationMainArray.value[i]+"</option>";
	}
	$("#service-info .input-line #service-location-main-input").append(appendStr);
	appendStr = "";
	for(var i = 0; i < serviceCategoryArray.code.length; i++){
		appendStr += "<option value='"+serviceCategoryArray.code[i]+"'>"+serviceCategoryArray.value[i]+"</option>";
	}
	$("#service-info .input-line .service-category-input").append(appendStr);

	$("#service-info .input-line #service-location-main-input").bind('change', function(){
		var subInputObj = $(this).parent().children('#service-location-sub-input');
		$(subInputObj).val('-1');
		$(subInputObj).children('option').each(function(){
			var val = $(this).prop('value');
			if(val != '-1'){
				$(this).remove();
			}
		});
		var val = $(this).val();
		var str = "";
		for (k in locationSub[val]){
			str += "<option value='"+k+"' class='sub-location'>"+locationSub[val][k]+"</option>";
		}
		$(subInputObj).append(str);
	});
	
	$("#service-info .input-line .service-domain-input").bind('blur', function(){
		var val = $(this).val();
		val = val.toLowerCase();
		val = val.replace('http://', '');
		val = val.replace('https://', '');
		if(val[0] == 'w' && val[1] == 'w' && val[2] == 'w'){
			val = val.substring(4);
		}
		$(this).val(val);
	});
	
	window.onbeforeunload = function(){
		return stringTable.warningBeforeLeaving;
	};
	
	$("#my-info .input-line .user-telephone-input").bind('keyup', function(){
		var val = $(this).val();
		var validated = true;
		if(val.length < 10)
			validated = false;
		if(val[0] != '0')
			validated = false;
		if(validated == false){
			$("#my-info .input-line .auth-request-button").prop('disabled', true);
		} else {
			$("#my-info .input-line .auth-request-button").removeAttr('disabled');
			variable.authorized = false;
		}
	});

	$("#my-info .input-line .auth-request-button").bind('click', function(){
		send_mobile_auth( $("#my-info .input-line .user-telephone-input").val());
	});

	$("#service-info .bottom-button-area #finish-button").bind('click', function(){
		submit();
	});
});
function run_auth_timer(){
	variable.authTimer = window.setInterval(function(){
		variable.authTimeout -= 1;
		$("#auth-remaining").text(variable.authTimeout);
		if(variable.authTimeout == 0){
			$("#functional-popup-panel input").prop("disabled", true);
			$("#functional-popup-panel .functional-popup-button").eq(0).prop('disabled', true);
			$("#functional-popup-panel .functional-popup-message").html(stringTable.mobileAuthTimeout);
			window.clearInterval(variable.authTimer);
		}
	}, 1000);
}
function send_mobile_auth(val){
	draw_progress();
	var data = {
		mobile: val
	};
	$.ajax({
		url : "/requestreceiver/",
		type : "post",
		data :{
			req_type : "send_mobile_auth",
			data: JSON.stringify(data)
		},
		success : function(response){
			remove_progress();
			if(response.result == 'ok'){
				var msgStr = val + stringTable.mobileAuthMessage;
				draw_functional_popup(function(){
					verify_mobile_auth();
				},function(){
					variable.authorized = false;
					variable.authTimeout = 180;
					window.clearInterval(variable.authTimer);
					close_functional_popup();
				}, stringTable.mobileAuth, msgStr, stringTable.ok, stringTable.cancel, 'text');
				run_auth_timer();
			} else {
				draw_general_popup(
						null,
						null, 
						null, 
						stringTable.mobileAuthInvalidNumber, 
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
					stringTable.mobileAuthInvalidNumber, 
					stringTable.ok, 
					null
			);
		}
	});
}
function verify_mobile_auth(){
	var val = $("#functional-popup-panel input").val();
	var data = {
		key: val
	};
	draw_progress();
	$.ajax({
		url : "/requestreceiver/",
		type : "post",
		data :{
			req_type : "verify_mobile_auth",
			data: JSON.stringify(data)
		},
		success : function(response){
			remove_progress();
			if(response.result == 'ok'){
				variable.authorized = true;
				variable.authTimeout = 180;
				window.clearInterval(variable.authTimer);
				close_functional_popup();
				$("#my-info .input-line .user-telephone-input").prop('disabled', true);
				$("#my-info .input-line .auth-request-button").prop('disabled', true);
				$("#my-info .input-line .auth-request-button").text(stringTable.mobileAuthDone);
				draw_general_popup(
					null,
					null, 
					null,
					stringTable.mobileAuthDoneMessage, 
					stringTable.ok, 
					null
				);
			} else {
				$("#auth-failed").fadeOut(400, function(){
					$("#auth-failed").fadeIn(200);
				});
			}
		},
		error : function(){
		}
	});
}
function nav(dest){
	if(variable.currentPosition == dest)
		return;
	else 
		variable.currentPosition = dest;
	$("#content .write-form-box").hide();
	$("#content .write-form-box").eq(dest).fadeIn();
	$(".progress-status-area .status-block").css('border-bottom', '0px solid #4d4d4d');
	$(".progress-status-area .status-block").eq(dest).css('border-bottom', '1px solid #4d4d4d');
}
function user_file_upload_done(){
	var txt = $("#user-file-upload-target").contents().text();
	var res;
	var resultType = 0;
	if(txt.length > 1000)
		resultType = 1;
	try {
		res = JSON.parse(txt);
	} catch (e) {
		resultType  = 1;
	}
	if (res.result != 'ok'){
		resultType = 2;
	}
	if(resultType != 0){
		var str = (resultType == 1) ? stringTable.tryAgain : stringTable.wrongFileType;
		draw_general_popup(
				null,
				null, 
				null, 
				str, 
				stringTable.ok, 
				null
		);
		variable.userPictureFileName = '';
		hide_button_progress($("#my-info .input-line .picture-select-button"), variable.userPictureUploadButtonText);
		button_lockdown($("#service-info .bottom-button-area #finish-button"), false);	
		return;
	}
	variable.userPictureFileName = res.filename[0];
	hide_button_progress($("#my-info .input-line .picture-select-button"), variable.userPictureUploadButtonText);
	$("#my-info .input-line .image-wrapper .picture-image").attr('src', serverData.userPictureBase + res.filename[0]);
	button_lockdown($("#service-info .bottom-button-area #finish-button"), false);	
}
function service_file_upload_done(){
	var txt = $("#service-file-upload-target").contents().text();
	var res;
	var resultType = 0;
	if(txt.length > 1000)
		resultType = 1;
	try {
		res = JSON.parse(txt);
	} catch (e) {
		resultType  = 1;
	}
	if (res.result != 'ok'){
		resultType = 2;
	}
	if(resultType != 0){
		var str = (resultType == 1) ? stringTable.tryAgain : stringTable.wrongFileType;
		draw_general_popup(
				null,
				null, 
				null, 
				str, 
				stringTable.ok, 
				null
		);
		hide_button_progress($("#service-info .input-line .picture-select-button"), variable.servicePictureUploadButtonText);
		variable.servicePictureFileName = '';
		button_lockdown($("#service-info .bottom-button-area #finish-button"), false);
		return;
	}
	variable.servicePictureFileName = res.filename[0];
	hide_button_progress($("#service-info .input-line .picture-select-button"), variable.servicePictureUploadButtonText);
	$("#service-info .input-line .image-wrapper .picture-image").attr('src', serverData.servicePictureBase + res.filename[0]);
	button_lockdown($("#service-info .bottom-button-area #finish-button"), false);	
}
function submit(){
	$(".fillinfo-warning-area").fadeOut();
	$(".fillinfo-warning-area span").html('');
	var inputObj = {};
	$(".write-form-box .input-line").each(function(){
		var obj = $(this).find('input, select, textarea');
		if(obj.length > 0){
			for(var i = 0; i < obj.length; i++){
				var className = $(obj).eq(i).prop('class');
				if(className != ''){
					inputObj[className] = $(obj).eq(i);
					$(obj).eq(i).css('border', '1px solid gray');
				}
			}
		}
		return true;
	});
	var data = {
		'userFullName': $(inputObj['user-fullname-input']).val(),
		'userTelephone': $(inputObj['user-telephone-input']).val(),
		'userPicture': variable.userPictureFileName,
		'servicePicture': variable.servicePictureFileName,
		'serviceName': $(inputObj['service-name-input']).val(),
		'serviceTag': $(inputObj['service-tag-input']).val(),
		'serviceDomain': $(inputObj['service-domain-input']).val(),
		'serviceCategory': $(inputObj['service-category-input']).val(),
		'serviceLocationMain': $(inputObj['service-location-input service-location-main-input']).val(),
		'serviceLocationSub': $(inputObj['service-location-input service-location-sub-input']).val(),
		'serviceWebsite': $(inputObj['service-website-input']).val(),
		'serviceTelephone': $(inputObj['service-telephone-input']).val(),
		'serviceDescription': $(inputObj['service-description-input']).val()
	};
	var stopLocation = 0x0000;
	var warningText = '';
	if(data['userFullName'].length < 2){
		$(inputObj['user-fullname-input']).css('border', '1px solid red');
		stopLocation |= 0x0001;
		warningText = stringTable.fullnameLength + '<br>';
	}
	if(variable.authorized == false){
		$(inputObj['user-telephone-input']).css('border', '1px solid red');
		stopLocation |= 0x0001;
		warningText = stringTable.mobileAuthNotDone + '<br>';
	}
	if(data['serviceName'].length < 2){
		$(inputObj['service-name-input']).css('border', '1px solid red');
		stopLocation |= 0x0010;
		warningText += stringTable.serviceNameLength + '<br>';
	}
	if(data['serviceTag'].length < 2){
		$(inputObj['service-tag-input']).css('border', '1px solid red');
		stopLocation |= 0x0010;
		warningText += stringTable.serviceTagLength + '<br>';
	}
	if(data['serviceCategory'] == null){
		$(inputObj['service-category-input']).css('border', '1px solid red');
		stopLocation |= 0x0010;
		warningText += stringTable.serviceCategoryEmpty + '<br>';
	}
	if(data['serviceLocationMain'] == null || data['serviceLocationSub'] == null){
		if(data['serviceLocationMain'] == null)
			$(inputObj['service-location-input service-location-main-input']).css('border', '1px solid red');
		if(data['serviceLocationSub'] == null)
			$(inputObj['service-location-input service-location-sub-input']).css('border', '1px solid red');
		stopLocation |= 0x0010;
		warningText += stringTable.serviceLocationEmpty + '<br>';
	}
			
	if(stopLocation & 0x0011){	
		$(".fillinfo-warning-area").children('span').html(warningText);
		$(".fillinfo-warning-area").fadeIn();
		if(stopLocation & 0x0001){
			nav(0);
		}
		return;
	}

	draw_progress();
	$.ajax({
		url : "/requestreceiver/",
		type : "post",
		data :{
			req_type : "fillinfo",
			data : JSON.stringify(data),
			id : serverData.id
		},
		success : function(res){
			var response = {};
			response = res;
			remove_progress();
			if(response.result == 'ok'){
				draw_general_popup(
						function(){
							window.onbeforeunload = null;
							window.location = '/';
						},
						null, 
						null, 
						stringTable.fillinfoDone, 
						stringTable.ok, 
						null
				);
			}				
			else
			{	
				var error_code = response.error_code;
				if(error_code == 'tag exist'){
					$(inputObj['service-tag-input']).css('border', '1px solid red');
					$(".fillinfo-warning-area").children('span').html(stringTable.serviceTagExist);
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