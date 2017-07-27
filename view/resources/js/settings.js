var variable = {
	menuObj: null,
	areaObj: null,
	highlight: 0,
	userPictureFileName: '',
	servicePictureFileName: '',
	userPictureUploadButtonText: '',
	servicePictureUploadButtonText: '',
	authorized: true,
	authTimer: null,
	authTimeout: 180,
	authorizedNumber: [$("#my-setting .input-line .user-telephone-input").val()],
	valid: serverData.valid,
	pointOnSlider: 0
};
$(function(){
	variable.userPictureFileName = serverData.userPicture;
	variable.servicePictureFileName = serverData.servicePicture;
	variable.menuObj = $(".navigation-item");
	variable.areaObj = $(".box-item");

	$(variable.menuObj).click(function(){
		variable.highlight = $(this).index(); 
		change_menu();
	});
	
	var appendStr = "";
	for(var i = 0; i < locationMainArray.code.length; i++){
		appendStr += "<option value='"+locationMainArray.code[i]+"'>"+locationMainArray.value[i]+"</option>";
	}
	$("#service-setting .input-line #service-location-main-input").append(appendStr);
	$("#service-setting .input-line #service-location-main-input").val(serverData.locationMain);
	
	appendStr = "";
	for (k in locationSub[serverData.locationMain]){
		appendStr += "<option value='"+k+"' class='sub-location'>"+locationSub[serverData.locationMain][k]+"</option>";
	}
	$("#service-setting .input-line #service-location-sub-input").append(appendStr);
	$("#service-setting .input-line #service-location-sub-input").val(serverData.locationSub);
	
	appendStr = "";
	for(var i = 0; i < serviceCategoryArray.code.length; i++){
		appendStr += "<option value='"+serviceCategoryArray.code[i]+"'>"+serviceCategoryArray.value[i]+"</option>";
	}
	$("#service-setting .input-line .service-category-input").append(appendStr);
	$("#service-setting .input-line .service-category-input").val(serverData.category);
	$("#service-setting .input-line #service-location-main-input").bind('change', function(){
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
	
	$("#service-setting .input-line .service-domain-input").bind('blur', function(){
		var val = $(this).val();
		val = val.toLowerCase();
		val = val.replace('http://', '');
		val = val.replace('https://', '');
		if(val[0] == 'w' && val[1] == 'w' && val[2] == 'w'){
			val = val.substring(4);
		}
		$(this).val(val);
	});
	
	$(".box-item .bottom-button-area .save-button").bind('click', function(){
		var id = $(this).parent().parent().prop('id');
		apply_change(id);
	});
	
	variable.userPictureUploadButtonText = $("#my-setting .photo-wrapper .picture-image-select").text();
	variable.servicePictureUploadButtonText = $("#service-setting .photo-wrapper .picture-image-select").text();
	document.getElementById("user-file-upload-target").onload = user_file_upload_done;
	document.getElementById("service-file-upload-target").onload = service_file_upload_done;

	$("#my-setting #user-picture-upload-form #user-picture-file").bind('change', function(){
		// IE !!!!!!!!!!
		if($(this).val().length == 0)
			return;
		var val = $(this).val();
		if(val.length == 0)
			return;
		$("#user-picture-upload-form .uuid").val(generate_uuid());
		$(this).parent().attr('target', 'user-file-upload-target');
		var ext = val.split(".").pop();
		show_button_progress($("#my-setting .photo-wrapper .picture-image-select"));
		$(this).parent().submit();
		button_lockdown($("#my-setting .bottom-button-area .save-button"), true);
		$("input:file").clearInputs();
	});
	$("#service-setting #service-picture-upload-form #service-picture-file").bind('change', function(){
		// IE !!!!!!!!!!
		if($(this).val().length == 0)
			return;
		var val = $(this).val();
		if(val.length == 0)
			return;
		$("#service-picture-upload-form .uuid").val(generate_uuid());
		$(this).parent().attr('target', 'service-file-upload-target');
		var ext = val.split(".").pop();
		show_button_progress($("#service-setting .photo-wrapper .picture-image-select"));
		$(this).parent().submit();
		button_lockdown($("#service-setting .bottom-button-area .save-button"), true);
		$("input:file").clearInputs();
	});
	
	$("#my-setting .input-line .user-telephone-input").bind('keyup', function(){
		var val = $(this).val();
		
		if(val.length >= 10){
			for(var i = 0; i < variable.authorizedNumber.length; i++){
				if(val == variable.authorizedNumber[i])
				{
					$("#my-setting .input-line .auth-request-button").prop('disabled', true);
					return;
				}
			}
		}
		
		var validated = true;
		if(val.length < 10)
			validated = false;
		if(val[0] != '0')
			validated = false;
		if(validated == false){
			$("#my-setting .input-line .auth-request-button").prop('disabled', true);
		} else {
			$("#my-setting .input-line .auth-request-button").removeAttr('disabled');
			variable.authorized = false;
		}
	});
	
	$("#my-setting .input-line .auth-request-button").bind('click', function(){
		send_mobile_auth( $("#my-setting .input-line .user-telephone-input").val());
	});
	var switchObj = $("#notification-setting .input-line #notify-askboard-sms");
	var checked = $(switchObj).prop('checked');
	$(switchObj).switchButton({
		checked: checked,
		on_label: stringTable.use,
		off_label: stringTable.noUse,
		width: 60,
		height: 30,
		button_width: 30,
		clear:true,
		on_callback: function(){},
		off_callback: function(){}
	});
	switchObj = $("#notification-setting .input-line #notify-askboard-email");
	checked = $(switchObj).prop('checked');
	$(switchObj).switchButton({
		checked: checked,
		on_label: stringTable.use,
		off_label: stringTable.noUse,
		width: 60,
		height: 30,
		button_width: 30,
		clear:true,
		on_callback: function(){},
		off_callback: function(){}
	});
	switchObj = $("#notification-setting .input-line #notify-askboard-sound");
	checked = $(switchObj).prop('checked');
	$(switchObj).switchButton({
		checked: checked,
		on_label: stringTable.use,
		off_label: stringTable.noUse,
		width: 60,
		height: 30,
		button_width: 30,
		clear:true,
		on_callback: function(){},
		off_callback: function(){}
	});
	switchObj = $("#notification-setting .input-line #notify-requestbox-sms");
	checked = $(switchObj).prop('checked');
	$(switchObj).switchButton({
		checked: checked,
		on_label: stringTable.use,
		off_label: stringTable.noUse,
		width: 60,
		height: 30,
		button_width: 30,
		clear:true,
		on_callback: function(){},
		off_callback: function(){}
	});
	switchObj = $("#notification-setting .input-line #notify-requestbox-email");
	checked = $(switchObj).prop('checked');
	$(switchObj).switchButton({
		checked: checked,
		on_label: stringTable.use,
		off_label: stringTable.noUse,
		width: 60,
		height: 30,
		button_width: 30,
		clear:true,
		on_callback: function(){},
		off_callback: function(){}
	});
	switchObj = $("#notification-setting .input-line #notify-requestbox-sound");
	checked = $(switchObj).prop('checked');
	$(switchObj).switchButton({
		checked: checked,
		on_label: stringTable.use,
		off_label: stringTable.noUse,
		width: 60,
		height: 30,
		button_width: 30,
		clear:true,
		on_callback: function(){},
		off_callback: function(){}
	});
	switchObj = $("#notification-setting .input-line #notify-chat-sound");
	checked = $(switchObj).prop('checked');
	$(switchObj).switchButton({
		checked: checked,
		on_label: stringTable.use,
		off_label: stringTable.noUse,
		width: 60,
		height: 30,
		button_width: 30,
		clear:true,
		on_callback: function(){},
		off_callback: function(){}
	});

	$( "#point-setting .input-line .use-point-slider" ).slider({
	    range: 'min',
	    value:0,
	    min: 0,
	    max: serverData.point,
	    step: serverData.pointPerDay,
	    slide: function( event, ui ) {
	    	if(ui.value == 0){
		  		$("#point-setting .input-line .extend-use-button").prop('disabled', true);
		  	} else {
		  		$("#point-setting .input-line .extend-use-button").removeAttr('disabled');
		  	}
			var current = new Date();
			var time;
		  	if(variable.valid.getTime() - current.getTime() >= 0){
		  		var time = new Date(variable.valid.getTime() + (ui.value / serverData.pointPerDay) * (1000 * 60 * 60 * 24));
		  	} else {
		  		var time = new Date(current.getTime() + (ui.value / serverData.pointPerDay) * (1000 * 60 * 60 * 24));
		  	}
		  	var point = serverData.point - ui.value;
		  	if(point < 0 || ui.value%serverData.pointPerDay != 0){
		  		return;
		  	}
		  	$("#point-setting .use-point-info .use-point").text(ui.value);
		  	$("#point-setting .use-point-info .added-day").text(ui.value/serverData.pointPerDay);
		  	variable.pointOnSlider = ui.value;
		  	update_point_ui(point, time);
	    }
	});
	$("#point-setting .input-line .extend-use-button").bind('click', function(){
		var str = "<span style='color:#ff6600; font-weight:bold;'>"+variable.pointOnSlider + "</span>포인트를 사용 <span style='color:#ff6600; font-weight:bold;'>" +  (variable.pointOnSlider / serverData.pointPerDay) + '</span>일 연장<br><br>';
		str += stringTable.extendUse;
		draw_general_popup(
			function(){
				extend_use();
			},
			null, 
			null, 
			str, 
			stringTable.yes, 
			stringTable.no
		);
	});
	
	$("#point-setting .bottom-button-area .recharge-sendsms").bind('click', function(){
		draw_general_popup(
			function(){
				$.ajax({
					url : "/requestreceiver/",
					type : "post",
					data :{
						req_type : "send_bankaccount_info",
						mobile: $("#my-setting .input-line .user-telephone-input").val()
					},
					success : function(response){
						remove_progress();
						if(response.result == 'ok'){
							draw_general_popup(
								null,
								null, 
								null, 
								stringTable.sendAccountInfoDone, 
								stringTable.ok, 
								null
							);					
						}
					},
					error : function(){
						remove_progress();
					}
				});
			},
			null, 
			null, 
			stringTable.receiveAccountInfo, 
			stringTable.yes, 
			stringTable.no
		);
	});
	$("#point-setting .bottom-button-area .recharge-confirm").bind('click', function(){
		$("#request-confirmation-window input").val('').css('border', '1px solid #ccccbc');
		$('body').prepend("<div id='popup-masking'></div>");
		$("#request-confirmation-window").fadeIn(150, function(){
			
		});
	});
	$("#request-confirmation-window .button-wrapper .request-confirmation-cancel").bind('click', function(){
		$("#request-confirmation-window").fadeOut(150, function(){
			$("#popup-masking").remove();
		});
	});
	$("#request-confirmation-window .button-wrapper .request-confirmation-ok").bind('click', function(){
		var data = {
			serviceId:  serverData.serviceId,
			fullname:  $("#request-confirmation-window .request-confirmation-name").val(),
			amount: $("#request-confirmation-window .request-confirmation-amount").val()
		};
		var pass = true;
		if(data.fullname.length == 0){
			pass = false;
			$("#request-confirmation-window .request-confirmation-name").css('border', '1px solid red');
		} 
		if(data.amount.length == 0){
			pass = false;
			$("#request-confirmation-window .request-confirmation-amount").css('border', '1px solid red');
		}
		if(!pass)
			return false;
		$("#popup-masking").remove();
		draw_progress();
		
		$.ajax({
			url : "/requestreceiver/",
			type : "post",
			data :{
				req_type : "request_transaction_check",
				data: JSON.stringify(data)
			},
			success : function(response){
				remove_progress();
				if(response.result == 'ok'){
					draw_general_popup(
						null,
						null, 
						null, 
						stringTable.requestTransactionCheckDone, 
						stringTable.ok, 
						null
					);					
				} else {
					draw_general_popup(
						null,
						null, 
						null, 
						stringTable.requestError, 
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
					stringTable.requestError, 
					stringTable.ok, 
					null
				);
			}
		});
		$("#request-confirmation-window").fadeOut(150);
	});
	$("#service-management-setting .delete-btn").bind("click", function(){
	    if($(this).prev().hasClass("chosen") === true){
	        draw_general_popup(
                null,
                null,
                null,
                stringTable.cantDeleteActiveService,
                stringTable.ok, 
                null
            );
	        return;
	    }
	    if($(this).hasClass("deleted") === true){
	        $(this).removeClass("deleted");
	        $(this).parent().children(".tag").removeClass("line-through");
	        $(this).text(stringTable.actionDelete);
	    } else {
	        $(this).addClass("deleted");
	        $(this).parent().children(".tag").addClass("line-through");
	        $(this).text(stringTable.cancelDelete);
	    }
	});
	$("#service-management-setting .activate-btn").bind("click", function(){
	    $("#service-management-setting .activate-btn").prop("disabled", false);
        $("#service-management-setting .activate-btn").removeClass("chosen");
        $(this).prop("disabled", true);
        $(this).addClass("chosen");
	});
});
function change_menu(){
	$(variable.menuObj).removeClass('chosen');
	$(variable.menuObj[variable.highlight]).addClass('chosen');
	$(variable.areaObj).hide();
	$(variable.areaObj[variable.highlight]).fadeIn();	
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
		console.log('catched');
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
		hide_button_progress($("#my-setting .photo-wrapper .picture-image-select"), variable.userPictureUploadButtonText);
		button_lockdown($("#my-setting .bottom-button-area .save-button"), false);
		return;
	}
	variable.userPictureFileName = res.filename[0];
	hide_button_progress($("#my-setting .photo-wrapper .picture-image-select"), variable.userPictureUploadButtonText);
	$("#my-setting .photo-wrapper img").attr('src', serverData.userPictureBase + res.filename[0]);
	button_lockdown($("#my-setting .bottom-button-area .save-button"), false);
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
		hide_button_progress($("#service-setting .photo-wrapper .picture-image-select"), variable.servicePictureUploadButtonText);
		variable.servicePictureFileName = '';
		button_lockdown($("#service-setting .bottom-button-area .save-button"), false);
		return;
	}	
	variable.servicePictureFileName = res.filename[0];
	hide_button_progress($("#service-setting .photo-wrapper .picture-image-select"), variable.servicePictureUploadButtonText);
	$("#service-setting .photo-wrapper img").attr('src', serverData.servicePictureBase + res.filename[0]);
	button_lockdown($("#service-setting .bottom-button-area .save-button"), false);
}
function apply_change(id){
	var data = {};
	var pass = true;
	var warningText = '';
	
	reset_input();
	
	$(".input-line input").css('border', '1px solid #ccccbc');
	$(".input-line select").css('border', '1px solid #ccccbc');
	$("#service-setting .input-line .service-tag-input").css({
		'border-left': '0',
		'border-top': '0',
		'border-top': '0'
	});
	
	if(id == 'my-setting'){
		var emailObj = $("#my-setting .input-line .user-email-input");
		var fullNameObj = $("#my-setting .input-line .user-fullname-input");
		var telephoneObj = $("#my-setting .input-line .user-telephone-input");
		
		var data = {
			'type': id,
			'userEmail': $(emailObj).val(),
			'userFullName': $(fullNameObj).val(),
			'userTelephone': $(telephoneObj).val(),
			'userPicture': variable.userPictureFileName
		};
		if(!validate_email(data['userEmail'])){
			$(emailObj).css('border', '1px solid red');
			warningText = stringTable.invalidEmailFormat + '<br>';
			pass = false;
		}
		if(data['userFullName'].length < 2){
			$(fullNameObj).css('border', '1px solid red');
			warningText += stringTable.fullnameLength;
			pass = false;
		}
		if(variable.authorized == false){
			$(telephoneObj).css('border', '1px solid red');
			warningText = stringTable.mobileAuthNotDone + '<br>';
			pass = false;
		}
	}
	if(id == 'password-setting'){
		var currentPasswordObj = $("#password-setting .input-line .password-input");
		var newPasswordObj = $("#password-setting .input-line .new-password-input");
		var confirmNewPasswordObj = $("#password-setting .input-line .confirm-new-password-input");
		var data = {
			'type': id,
			currentPassword: $(currentPasswordObj).val(),
			newPassword: $(newPasswordObj).val(),
			confirmNewPassword: $(confirmNewPasswordObj).val()
		};
		if(data.currentPassword.length < 4 || data.newPassword.length < 4)
		{
			if(data.currentPassword.length < 4)
				$(currentPasswordObj).css('border', '1px solid red');
			if(data.newPassword.length < 4) {
				$(newPasswordObj).css('border', '1px solid red');
				$(confirmNewPasswordObj).css('border', '1px solid red');
			}	
			warningText = stringTable.passwordLength + '<br>';
			pass = false;
		}
		if(data.newPassword != data.confirmNewPassword)
		{
			$(newPasswordObj).css('border', '1px solid red');
			$(confirmNewPasswordObj).css('border', '1px solid red');
			warningText += stringTable.passwordNotMatch + '<br>';
			pass = false;		
		}
	}
	if(id == 'service-setting'){
		var serviceNameObj = $("#service-setting .input-line .service-name-input");
		var serviceTagObj =  $("#service-setting .input-line .service-tag-input");
		var serviceDomainObj =  $("#service-setting .input-line .service-domain-input");
		var serviceCategoryObj =  $("#service-setting .input-line .service-category-input");
		var serviceLocationMainObj =  $("#service-setting .input-line #service-location-main-input");
		var serviceLocationSubObj =  $("#service-setting .input-line #service-location-sub-input");
		var serviceWebsiteObj =  $("#service-setting .input-line .service-website-input");
		var serviceTelephoneObj =  $("#service-setting .input-line .service-telephone-input");
		var serviceDescriptionObj =  $("#service-setting .input-line .service-description-input");
		var data = {
			type: id,
			servicePicture: variable.servicePictureFileName,
			serviceTag: $(serviceTagObj).val(),
			serviceName: $(serviceNameObj).val(),
			serviceDomain: $(serviceDomainObj).val(),
			serviceCategory: $(serviceCategoryObj).val(),
			serviceLocationMain: $(serviceLocationMainObj).val(),
			serviceLocationSub: $(serviceLocationSubObj).val(),
			serviceWebsite: $(serviceWebsiteObj).val(),
			serviceTelephone: $(serviceTelephoneObj).val(),
			serviceDescription: $(serviceDescriptionObj).val()
		};
		if(data['serviceName'].length < 2){
			$(serviceNameObj).css('border', '1px solid red');
			warningText += stringTable.serviceNameLength + '<br>';
			pass = false;
		}
		if(data['serviceTag'].length < 2){
			$(serviceTagObj).css('border', '1px solid red');
			warningText += stringTable.serviceTagLength + '<br>';
			pass = false;
		}
	}
	if(id == 'notification-setting'){
		var notification = 0;
		$("#notification-setting .input-line .notify-input").each(function(){
			var checked = $(this).prop('checked');
			if(!checked)
				return;
			var id = $(this).attr('id');
			if(id == 'notify-askboard-sms')
				notification |= serverData.notification.NOTIFICATION_ALLOW_ASKBOARD_SMS;
			else if(id == 'notify-askboard-email')
				notification |= serverData.notification.NOTIFICATION_ALLOW_ASKBOARD_EMAIL;
			else if(id == 'notify-askboard-sound')
				notification |= serverData.notification.NOTIFICATION_ALLOW_ASKBOARD_SOUND;
			else if(id == 'notify-chat-sound')
				notification |= serverData.notification.NOTIFICATION_ALLOW_CHAT_SOUND;
			else if(id == 'notify-requestbox-sms')
				notification |= serverData.notification.NOTIFICATION_ALLOW_REQUESTBOX_SMS;
			else if(id == 'notify-requestbox-email')
				notification |= serverData.notification.NOTIFICATION_ALLOW_REQUESTBOX_EMAIL;
			else if(id == 'notify-requestbox-sound')
				notification |= serverData.notification.NOTIFICATION_ALLOW_REQUESTBOX_SOUND;
		});
		var data = {
			type: id,
			notification: notification
		};
	}
	if(id === "service-management-setting"){
	    if($("#service-management-setting .delete-btn").length === $("#service-management-setting .deleted").length){
	        draw_general_popup(
                null,
                null,
                null,
                stringTable.cantDeleteAllService,
                stringTable.ok, 
                null
            );
	        return;
	    }
	    var deletedService = [];
	    var selectedService = 0;
	    $("#service-management-setting .deleted").each(function(){
	        deletedService.push( parseInt($(this).data("service-id"), 10) );
	    });
	    if($("#service-management-setting .chosen").length > 0) {
	        selectedService = parseInt($("#service-management-setting .chosen").data("service-id"), 10);
	    }
	    var data = {
            type: id,
            selectedService: selectedService,
            deletedService: deletedService,
            password: ''
	    };
	    var msg = stringTable.saveServiceManagement + "<br/>" + stringTable.enterPassword;
	    draw_functional_popup(function(){
	        data.password = $("#functional-popup-panel .functional-popup-input").val();
	        do_save_settings(data);
        },function(){
            close_functional_popup();
        }, stringTable.askSave, msg, stringTable.yes, stringTable.no, 'password');
	    return;
	}
	if(pass == false){
		$("#content #box-area .box-warning-area span").html(warningText);
		$("#content #box-area .box-warning-area").show();
		return;
	}
	do_save_settings(data);
}
function do_save_settings(data){
    draw_progress();
    $.ajax({
        url : "/requestreceiver/",
        type : "post",
        data :{
            req_type : "change_settings",
            data : JSON.stringify(data),
            id : serverData.id
        },
        success : function(res){
            remove_progress();
            if(data.type === "service-management-setting"){
                close_functional_popup();
                var str = "";
                if(res.result === "ok"){
                    str = stringTable.changeSettingsDone;
                } else {
                    if(res.error_code === 'wrong password'){
                        str = stringTable.wrongPassword;
                    } else {
                        str = stringTable.tryAgain;
                    }
                }
                draw_general_popup(
                        function(){
                            if(res.result === "ok"){
                                window.location = "/settings?nav=service-management";
                            }
                        },
                        null,
                        null,
                        str,
                        stringTable.ok, 
                        null
                );
                return;
            }
            if(res.result == 'ok'){
                if(data.type == 'password-setting'){
                    reset_input();
                    $(currentPasswordObj).val('');
                    $(newPasswordObj).val('');
                    $(confirmNewPasswordObj).val('');
                }
                var successStr = stringTable.changeSettingsDone;
                draw_general_popup(
                        null,
                        null, 
                        null, 
                        successStr, 
                        stringTable.ok, 
                        null
                );
            } else {    
                var str = stringTable.tryAgain;
                if(res.error_code == 'invalid email'){
                    str = stringTable.emailExist;
                     $("#my-setting .input-line .user-email-input").css('border', '1px solid red');
                }
                if(res.error_code == 'wrong password'){
                    str = stringTable.wrongPassword;
                    $("#password-setting .input-line .password-input").css('border', '1px solid red');
                }
                if(res.error_code == 'invalid tag'){
                    str = stringTable.serviceTagExist;
                    $("#service-setting .input-line .service-tag-input").css('border', '1px solid red');
                }
                draw_general_popup(
                        null,
                        null, 
                        null, 
                        str, 
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
function reset_input(){
	$("#content").children('#box-area').children('.box-item').find('select').css('border', '1px solid gray');
	$("#content").children('#box-area').children('.box-item').find('input').css('border', '1px solid gray')
	$("#content #box-area .box-warning-area span").html('');
	$("#content #box-area .box-warning-area").hide();
}

/* mobile auth */
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
				$("#my-setting .input-line .user-telephone-input").prop('disabled', true);
				$("#my-setting .input-line .auth-request-button").prop('disabled', true);
				$("#my-setting .input-line .auth-request-button").text(stringTable.mobileAuthDone);
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
function update_point_ui(point, time){
	var year = time.getFullYear();
	var month = time.getMonth() + 1;
	var date = time.getDate();
	var hour = time.getHours();
	var minute = time.getMinutes();
	var newDate = year + '년 ' + month + '월 ' + date + ' 일' + hour + ' 시' + minute + '분';
	$("#point-setting .input-line .value .value-date").text(newDate);
  	$("#point-setting .input-line .value .value-point").text(point);
}
function extend_use(){
	draw_progress();
	var data = {
		point: variable.pointOnSlider,
		serviceId: serverData.serviceId
	};
	
	var htmlStr = 	"<div class='table-item-row point-table'>"; 
	htmlStr += 			"<div class='table-type table-item'></div>";
	htmlStr +=			"<div class='table-diff table-item'></div>";
	htmlStr += 			"<div class='table-balance table-item'></div>";
	htmlStr +=			"<div class='table-date table-item'></div>";
	htmlStr +=		"</div>";

	$.ajax({
		url : "/requestreceiver/",
		type : "post",
		data :{
			req_type : "extend_use",
			data: JSON.stringify(data)
		},
		success : function(response){
			remove_progress();
			if(response.result == 'ok'){				
				var point = response.point;
				var ts = response.ts;
				try{ts = parseInt(ts);} catch(err){ts = 0}
				var time = new Date(ts*1000);
				var now = new Date();
				var spentPoint = variable.pointOnSlider * -1;
				variable.pointOnSlider = 0;
				serverData.point = point;
				$("#point-setting .table-body").append(htmlStr);
				var lastRow = $("#point-setting .table-body .table-item-row").last();
				$(lastRow).children('.table-type').text(stringTable.pointSpentForExtending);
				$(lastRow).children('.table-diff ').text(spentPoint);
				$(lastRow).children('.table-balance ').text(point);
				var currentDate = now.getFullYear() + '-' + (now.getMonth() + 1) + '-' + now.getDate() + ' ' + now.getHours() + ':' + now.getMinutes() + ':' + now.getSeconds();
				$(lastRow).children('.table-date ').text(currentDate);
				$("#point-setting .input-line .use-point-slider" ).slider('value', 0);
				$("#point-setting .input-line .use-point-slider" ).slider('option',{min: 0, max: point});
				$("#point-setting .use-point-info .use-point").text('0');
			  	$("#point-setting .use-point-info .added-day").text('0');
				update_point_ui(point, time);
				draw_general_popup(
						null,
						null, 
						null, 
						stringTable.requestDone, 
						stringTable.ok, 
						null
				);
			} else {
				draw_general_popup(
						null,
						null, 
						null, 
						stringTable.requestError, 
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
					stringTable.requestError, 
					stringTable.ok, 
					null
			);
		}
	});
}