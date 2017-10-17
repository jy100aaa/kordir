$(function(){
	$(".signup-wrapper .bottom-wrapper .signup-button").bind('click', function(){
		signup();
	});
	$(".signup-wrapper #signup-password-confirm-input").bind('keypress', function(e){
		if (e.keyCode == 13)
			signup();
	});
});
function signup(){
	var inputObj = $(".signup-wrapper input");
	
	var fullname = $(inputObj[0]).val();
	var email = $(inputObj[1]).val();
	var reEmail = $(inputObj[2]).val();
	var password = $(inputObj[3]).val();
	var rePassword = $(inputObj[4]).val();
	var promotion = $(inputObj[5]).val();
	var agree = $(inputObj[6]).prop('checked');
	
	var messageArea = $(".signup-warning-area span");
	$(messageArea).text('');
	$(messageArea).hide();
	
	$(inputObj).each(function(){
		$(this).css('border', '1px solid gray');
	});

	if(fullname.length == 0 || email.length == 0 || password.length == 0)
	{
		$(messageArea).show();
		$(messageArea).text(stringTable.fillAllFields);
		
		$(inputObj).each(function(){
			if($(this).val().length == 0)
				$(this).css('border', '1px solid red');
		});
		return;
	}
	if(!agree){
		$(messageArea).show();
		$(messageArea).text(stringTable.agreeNotChecked);
		return;
	}
	if(validate_email(email) == false)
	{
		$(messageArea).show();
		$(inputObj[1]).css('border', '1px solid red');
		$(inputObj[2]).css('border', '1px solid red');
		$(messageArea).text(stringTable.invalidEmailFormat);
		return;
	}
	if(email != reEmail)
	{
		$(messageArea).show();
		$(inputObj[1]).css('border', '1px solid red');
		$(inputObj[2]).css('border', '1px solid red');
		$(messageArea).text(stringTable.emailNotMatch);
		return;
	}
	if(fullname.length < 2){
		$(messageArea).show();
		$(inputObj[0]).css('border', '1px solid red');
		$(messageArea).text(stringTable.fullnameLength);
		return;
	}
	if(password.length < 4)
	{
		$(messageArea).show();
		$(inputObj[3]).css('border', '1px solid red');
		$(inputObj[4]).css('border', '1px solid red');
		$(messageArea).text(stringTable.passwordLength);
		return;
	}
	if(password != rePassword)
	{
		$(messageArea).show();
		$(inputObj[3]).css('border', '1px solid red');
		$(inputObj[4]).css('border', '1px solid red');
		$(messageArea).text(stringTable.passwordNotMatch);
		return;
	}
	draw_progress();
	$.ajax({
		url : "/requestreceiver/",
		type : "post",
		data :{
			req_type : "create_account",
			email : email,
			password : password,
			fullname: fullname,
			promotion: promotion
		},
		success : function(res){
			remove_progress();
			var response = {};
			response = res;
			if(response.result == 'ok')
			{
				draw_general_popup( 
						function(){
							window.location.href = '/signupdone';
						},
						null, 
						null, 
						stringTable.signupSuccess, 
						stringTable.close, 
						null
				);
			}
			else
			{				
				var error_code = response.error_code;
				if(error_code == 'already user'){
					$(inputObj[1]).css('border', '1px solid red');
					$(inputObj[2]).css('border', '1px solid red');
					draw_general_popup(
							null,
							null, 
							null, 
							stringTable.emailExist, 
							stringTable.close, 
							null
					);
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