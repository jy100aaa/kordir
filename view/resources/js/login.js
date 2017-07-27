$(function(){
	$("#content .login-wrapper .bottom-wrapper .text-line .forgot-password").bind('click', function(){
		draw_functional_popup(function(){
			send_forgot_password_email();
		},function(){
			close_functional_popup();
		}, stringTable.resetPassword, stringTable.resetPasswordMessage, stringTable.send, stringTable.cancel, 'text');
	});
	$("#content .login-wrapper .bottom-wrapper .login-button").bind('click', function(){
		login();
	});
	
	$("#content .login-wrapper input").bind('keypress', function(e){
		if(e.keyCode == 13)
			login();
	});
	if($("#content .login-wrapper input").eq(0).val().length == 0){
		$("#content .login-wrapper input").eq(0).focus();
	} else {
		$("#content .login-wrapper input").eq(1).focus();
	}
});

function login(){
	var inputObj = $("#content .login-wrapper input[type='text'], #content .login-wrapper input[type='password']");
	var emailObj = $(inputObj)[0];
	var passwordObj = $(inputObj)[1];
	var email = $(emailObj).val();
	var password = $(passwordObj).val();
	var remember = $("#content .login-wrapper .remember-me .remember-me-input").prop('checked') == true ? true:false;
	var messageArea = $("#content .login-wrapper .login-warning-area span");
	$(inputObj).css('border', '1px solid gray');
	$(messageArea).parent().hide();
	if(email.length == 0 || password.length == 0)
	{
		$(messageArea).parent().show();
		$(messageArea).text(stringTable.fillAllFields);
		$(inputObj).css('border', '1px solid red');
		return;
	}
	if(password.length < 4){
		$(messageArea).parent().show();
		$(messageArea).text(stringTable.passwordLength);
		$(passwordObj).css('border', '1px solid red');
		return;
	}
	if(validate_email(email) == false)
	{
		$(messageArea).parent().show();
		$(messageArea).text(stringTable.invalidEmailFormat);
		$(emailObj).css('border', '1px solid red');
		return;
	}
	$(messageArea).parent().hide();
	draw_progress();
	$.ajax({
		url : "/requestreceiver/",
		type : "post",
		data :{
			req_type : "login",
			email : email,
			password : password,
			remember: remember
		},
		success : function(res){
			var response = {};
			response = res;
						
			if(response.result == 'ok'){
				var url = '/';
				if(serverData.then != '')
					url += serverData.then;
				if(serverData.param != '')
					url += '/' + serverData.param;
				window.location = url;
			}				
			else
			{	
				remove_progress();
				$(inputObj).css('border', '1px solid red');
				$(messageArea).text(stringTable.loginFail);
				$(messageArea).parent().show();
			}
		},
		error : function(){
			$(messageArea).text(stringTable.internalError);
			$(messageArea).parent().show();
			remove_progress();
		}
	});	
}

function send_forgot_password_email(){
	var inputObj = $(".functional-popup-wrapper input");
	var email = $(inputObj).val();
	var messageArea = $(".functional-popup-wrapper .functional-popup-error-message");

	
	if(email.length == 0)
	{
		$(messageArea).show();
		$(messageArea).text(stringTable.fillAllFields);
		$(inputObj).css('border', '1px solid red');
		return;
	}
		
	if(validate_email(email) == false)
	{
		$(messageArea).show();
		$(messageArea).text(stringTable.invalidEmailFormat);
		$(inputObj).css('border', '1px solid red');
		return;
	}

	draw_progress();
	
	$.ajax({
		url : "/requestreceiver/",
		type : "post",
		data :{
			req_type : "send_reset_password_email",
			email : email
		},
		success : function(res){
			remove_progress();
			var response = {};
			response = res;

			if(response.result == 'ok')
			{
				close_functional_popup();
				draw_general_popup(null, null, null, stringTable.resetPasswordEmailSuccess, stringTable.close, null);
			}
			else
			{
				$(messageArea).show();
				$(messageArea).text(stringTable.notRegisteredEmail);
				$(inputObj).css('border', '1px solid red');
				return;
			}
		},
		error : function(){
			remove_progress();
			$(messageArea).show();
			$(messageArea).text(stringTable.internalError);
			$(inputObj).css('border', '1px solid red');			
		}
	});
}