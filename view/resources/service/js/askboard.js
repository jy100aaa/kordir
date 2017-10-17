var variable = {
	uniqueKey: serverData.uniqueKey,
	captchaLocation: serverData.captchaLocation,
	captchaLoaded: false,
	filename: '',
	disclose: true,
	uploading: false,
	uploaded: false,
	serviceId: serverData.serviceId,
	userServiceId: serverData.userServiceId,
	uploadXhr: null,
	progressTimer: null,
	tag: serverData.tag
};
$(function(){
	//registering events 
	$("#content .board-top #show-register-form-button").bind('click', function(){
		if(variable.captchaLoaded == false){
			load_registry_form(function(){
				$(".board-content").hide();
				$(".board-register .board-register-form .input-line #captcha-image").prop('src', variable.captchaLocation);
				$(".board-register").show();
			});
		} else {
			$(".board-content").hide();
			$(".board-register").show();
		}
	});
	$(".board-register .board-register-form .board-register-form-button-wrapper .register-cancel").bind('click', function(){
		if(variable.uploading == true){
			draw_general_popup(
				null,
				null, 
				null, 
				stringTable.uploadingNotDone,
				stringTable.ok, 
				null
			);
			return;
		}
		$(".board-content").show();
		$(".board-register").hide();
		$(".board-register-form .input-line input").val('');
		$(".board-register-form .input-line textarea").val('');
	});
	$(".board-register .board-register-form .board-register-form-button-wrapper .register-ok").bind('click', function(){
		register();
	});
	$(".board-register .board-register-form .input-line .disclose-input").switchButton({
		on_label: stringTable.discloseYes,
		off_label: stringTable.discloseNo,
		width: 60,
		height: 30,
		button_width: 30,
		on_callback: function(){
			variable.disclose = true;
		}, 
		off_callback: function(){
			variable.disclose = false;
		}
	});
	$(".board-register .board-register-form .input-line .name-input").inputLengthSet({
		maxLength: 16,
		posX: 200,
		posY:8
	});
	$(".board-register .board-register-form .input-line .password-input").inputLengthSet({
		maxLength: 16,
		posX: 200,
		posY:8
	});
	$(".board-register .board-register-form .input-line .telephone-input").ForceNumericOnly();
	$(".board-register .board-register-form .input-line .subject-input").inputLengthSet({
		maxLength: 50,
		posX: 500,
		posY:8
	});
	$("#board-attachment-upload-form #file-input").bind('change', function(){
		// IE !!!!!!!!!!
		if($(this).val().length == 0)
			return;
		document.getElementById("board-attachment-upload-target").onload = file_upload_done;
		$(this).parent().attr('target', 'board-attachment-upload-target');
				
		var val = $(this).val();
		if(val.length == 0)
			return;
		var size = 0;
		try{
			size = this.files[0].size / 1024;
		} catch(err){
			// oldie fallback -> believe the size is small and evaluate in serverside later
			size = 0;
		}
		if(size > 51200){
			draw_general_popup(
					null,
					null, 
					null, 
					stringTable.sizeExceed, 
					stringTable.ok, 
					null
			);
			return;
		}
		var uuid = generate_uuid();
		variable.filename = uuid + '.' + val.split(".").pop();
		$(this).parent().children('.filename').val(variable.filename);
		$(this).parent().children('.uuid').val(uuid);
		$(this).parent().attr('action', '/requestreceiver/?X-Progress-ID=' + uuid);
		variable.uploading = true;
		variable.uploaded = false;
		$(".board-register .board-register-form .input-line .file-select-button").hide();
		$(".board-register .board-register-form .input-line .progress-bar").css('display', 'inline-block');
		variable.progressTimer = window.setInterval(function(){
			progress_update(uuid, variable.progressTimer, $(".board-register .board-register-form .input-line .progress-bar"));
		}, 1000);
		$(this).parent().submit();
	});
	$(".board-register .board-register-form .input-line .after-upload .remove-file").bind('click', function(){
		variable.uploaded = false;
		variable.uploading = false;
		$(this).parent().hide();
		$(".board-register .board-register-form .input-line .file-select-button").show();
	});
	
	$(".board-bottom .paging-nav").bind('click', function(){
		if($(this).hasClass('disabled') || $(this).hasClass('current-page'))
			return;
		var page = $(this).prop('id').split('-')[2];
		var url = serverData.tag + '?page=' + page;
		window.location.href = url;
	});
	
	$(".board-center .table-body .item-wrapper").bind('click', function(){
		var seq = $(this).prop('id').split('-')[2];
		var url = serverData.tag + '?seq=' + seq;
		if($(this).hasClass('disclose') || variable.serviceId == variable.userServiceId){
			window.location.href = url;
			return;
		}
		draw_functional_popup(function(){
			$("#functional-popup-panel .functional-popup-wrapper .functional-popup-error-message").text('');
			if( $("#functional-popup-panel > div > input").val().length < 4){
				$("#functional-popup-panel .functional-popup-wrapper .functional-popup-error-message").text(stringTable.wrongPassword);
				return;
			}
			draw_progress();
			var data = {
				password: $("#functional-popup-panel > div > input").val(),
				serviceId: variable.serviceId,
				seq: seq,
				tag: variable.tag
			};
			$.ajax({
				url : "/requestreceiver/",
				type : "post",
				data :{
					req_type : "check_board_password",
					data: JSON.stringify(data)
				},
				success : function(response){
					remove_progress();
			
					if(response.result == 'ok'){
						if($("html").hasClass('ie')){
							var tag =  stringTable.passwordConfirmed + "<br><br><br><span class='nostyle-anchor' style='font-size:16px;'><a class='nostyle-anchor' href='" + url + '&tempKey=' + response.tempKey + "'>" + stringTable.viewPost + "<i style='margin-left:5px;' class='fa fa-sign-in fa-lg'></i></a></span>";
							close_functional_popup();		
							draw_general_popup(
									null,
									null, 
									null,  
									tag, 
									stringTable.close, 
									null
							);
						} else {
							window.location.href = url + '&tempKey=' + response.tempKey;
						}
					}else {
						$("#functional-popup-panel .functional-popup-wrapper .functional-popup-error-message").text(stringTable.wrongPassword);
					}
				},
				error : function(){
					remove_progress();
				}
			});
		},function(){
			close_functional_popup();
		}, stringTable.checkPassword, stringTable.checkPasswordIntro, stringTable.ok, stringTable.cancel, 'text');
		$("#functional-popup-panel > div > input").attr('type', 'password');
	});
	
	$(".board-register .board-register-form .input-line .telephone-input").ForceNumericOnly();
	
});
function file_upload_done(){
	var txt = $("#board-attachment-upload-target").contents().text();
	var response = null;
	try{
		 response = JSON.parse(txt);
		 
	} catch(err){
		if(variable.uploading){
			draw_general_popup(
					null,
					null, 
					null, 
					stringTable.uploadFail, 
					stringTable.ok, 
					null
			);
			return;
		}
		return;
	}
	$(".board-register .board-register-form .input-line .progress-bar").hide();
	$("input:file").clearInputs();
	var pass = true;
	
	if(response.result != 'ok')
		pass = false;
	
	if(pass == false){
		draw_general_popup(
				null,
				null, 
				null, 
				stringTable.uploadFail, 
				stringTable.ok, 
				null
		);
		return;
	}
	$(".board-register .board-register-form .input-line .after-upload").show();
	$(".board-register .board-register-form .input-line .after-upload .filename a").prop('href', serverData.boardAttachmentLocation + variable.filename);
	variable.uploaded = true;
	variable.uploading = false;
}
function progress_update(uuid, interval, obj){
	$.ajax({
		url : "/progress",
		headers: {'X-Progress-ID': uuid},
		type : "get",
		success : function(res){
			if(res.state == 'uploading')
			{
				var p = res.received / res.size;
				var percentage = p * 100;
				percentage = Math.round(percentage);
				if(res.received == res.size){
					$(obj).children('.number').text('');
					$(obj).hide();
					return;
				}
				$(obj).children('.progress').css('width', percentage + '%');
				$(obj).children('.number').text(percentage + '%');
			}
			if(res.state == 'done')
			{
				window.clearInterval(interval);
				setTimeout(function(){
					$(obj).children('.progress').css('width', '0px');
					$(obj).children('.number').text('');
				}, 150);
			}
		},
		error:function(){
			window.clearInterval(interval);
		}
	});
}
function load_registry_form(callback){
	draw_progress();
	$.ajax({
		url : "/requestreceiver/",
		type : "post",
		data :{
			req_type : "generate_captcha",
			uniqueKey: variable.uniqueKey
		},
		success : function(result){			
			if(result.result == 'ok'){
				var img = new Image();
				img.src = variable.captchaLocation;
				img.onload = function(){
					remove_progress();
					variable.captchaLoaded = true;
					callback();
				};
			} else {
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
function register(){
	$(".board-register .board-register-form .not-passed").html("").fadeOut(150);
	var inputLineObj = $(".board-register .board-register-form .input-line");
	$(inputLineObj).find('input').css('border', '1px solid #ccccbc');
	$(inputLineObj).find('textarea').css('border', '1px solid #ccccbc');
	
	if(variable.uploading == true){
		draw_general_popup(
			null,
			null, 
			null, 
			stringTable.uploadingNotDone,
			stringTable.ok, 
			null
		);
		return;
	}
	
	var tel = [];
	$(inputLineObj).find('.telephone-input').each(function(){
		var val = $(this).val();
		tel.push(val);
	});
	var data = {
		name: $(inputLineObj).find('.name-input').val(),
		password: $(inputLineObj).find('.password-input').val(),
		telephone: tel,
		subject: $(inputLineObj).find('.subject-input').val(),
		disclose: variable.disclose,
		body: $(inputLineObj).find('.body-input').val(),
		captcha: $(inputLineObj).find('.captcha-input').val(),
		filename: variable.filename,
		uploaded: variable.uploaded,
		uniqueKey: variable.uniqueKey,
		serviceId: variable.serviceId,
		sticky: false,
		tag: variable.tag
	};
	
	var passed = true;
	var errorCode = "";	
	
	if(data.name.length < 2){
		passed = false;
		$(inputLineObj).find('.name-input').css('border', '1px solid red');
		errorCode += stringTable.nameLength + '<br>';
	}
	if(data.password.length < 4){
		passed = false;
		$(inputLineObj).find('.password-input').css('border', '1px solid red');
		errorCode += stringTable.passwordLength + '<br>';
	}
	if(data.subject.length < 4){
		passed = false;
		$(inputLineObj).find('.subject-input').css('border', '1px solid red');
		errorCode += stringTable.subjectLength + '<br>';
	}
	if(data.body.length < 4){
		passed = false;
		$(inputLineObj).find('.body-input').css('border', '1px solid red');
		errorCode += stringTable.bodyLength + '<br>';
	}
	if(data.captcha.length != 5){
		passed = false;
		$(inputLineObj).find('.captcha-input').css('border', '1px solid red');
		errorCode += stringTable.captchaWrong + '<br>';
	}
	if(tel[0].length > 0 || tel[1].length > 0 || tel[2].length > 0)
	{
		if(tel[0].length != 3 || 
				(tel[1].length > 4 || tel[1].length < 3) || 
				(tel[2].length > 4 || tel[2].length < 3) ||
				tel[0][0] != '0' ||
				tel[1][0] == '0') {
				passed = false;
				$(inputLineObj).find('.telephone-input').css('border', '1px solid red');
				errorCode += stringTable.telephoneWrong + '<br>';
			}
	}
	if(!passed){
		$(".board-register .board-register-form .not-passed").html(errorCode).fadeIn(150);
		return;
	}
	$(".additional-input").each(function(){
		var tag = $(this).parent().children('.tag').text();
		var value = $(this).val();
		data.body += '\n' + tag + ': ' + value + '\n';
	});
	draw_progress();
	$.ajax({
		url : "/requestreceiver/",
		type : "post",
		data :{
			req_type : "askboard_register",
			data: JSON.stringify(data)
		},
		success : function(response){
			remove_progress();
			if(response.result == 'ok'){
				var msg = {
					type: 'askboard_register',
					data:{
						serviceId: variable.serviceId,
						tag: variable.tag
					}
				};
				send_client_message(msg);
				draw_general_popup(
						function(){
							$(".board-register-form .input-line input").val('');
							$(".board-register-form .input-line textarea").val('');
							location.reload();
						},
						null,
						null, 
						stringTable.askBoardRegisterSuccess, 
						stringTable.ok, 
						null
				);
			} else {
				if(response.error_code == 'captcha error'){
					$(inputLineObj).find('.captcha-input').css('border', '1px solid red');
					errorCode += stringTable.captchaWrong;
					$(".board-register .board-register-form .not-passed").html(errorCode).fadeIn(150);
					return;
				} 
				if(response.error_code == 'quota over'){
					var PREVENT_SPAM_DAILY_QUOTA = '3';
					var lift = response.liftwhen + '';
					var str = stringTable.quotaOver.format(PREVENT_SPAM_DAILY_QUOTA, lift);
					draw_general_popup(
							null,
							null, 
							null, 
							str, 
							stringTable.close, 
							null
					);
					return;
				}
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
function connection_status_change(type){}
function connection_established(){}