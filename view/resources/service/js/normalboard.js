var variable = {
	body: '',
	captchaLoaded: false
};
$(function(){
	$(".board-bottom .paging-nav").bind('click', function(){
		if($(this).hasClass('disabled') || $(this).hasClass('current-page'))
			return;
		var page = $(this).prop('id').split('-')[2];
		var url = serverData.tag + '?page=' + page;
		window.location.href = url;
	});
	tinymce.PluginManager.add('uploadpicture', function(editor, url) {
	    // Add a button that opens a window
		if(!oldIE){
			editor.addButton('uploadpicture', {
				text: stringTable.uploadPicture,
				icon: false,
				onclick: function() {
					var is_safari = navigator.userAgent.indexOf("Safari") > -1;
					if(!is_safari){
						$("#file-input-proxy").click();
					}
					else
						$("#file-input").click();
				}
			});
		}
	});
    if(!$('html').is('.ie6, .ie7')){
    	tinymce.init({
    	    selector: "#body-input",
    	    mode: 'textarea',
    	    language : "ko_KR",
    	    width: '100%',
    	    theme: "modern",
    	    skin: "light",
    	    fontsize_formats: "8pt 10pt 12pt 14pt 18pt 24pt 36pt 48pt",
    	    toolbar: "undo redo | bold italic | alignleft aligncenter alignright alignjustify | bullist numlist outdent indent | link image | fontsizeselect | forecolor backcolor | uploadpicture | media",
    	    plugins: 'link image textcolor uploadpicture media autoresize',
    	    content_css: '/resources/plugins/tinymce_4.6.1/content.css',
    	    relative_urls: false,
    	    convert_urls: false,
    	    autoresize_min_height: 360,
    	    menubar:false,
    	    statusbar:false,
    	    forced_root_block : false,
    	    init_instance_callback : function(ed) {
    	    }
    	});
    } else {
    	$("#body-input").css({
    		'width': '100%',
    		'border': '1px solid #ccccbc'
    	});
    	$("#body-input").attr('rows', 20);
    	$("#body-input").blur(function(){
    		variable.body = $(this).val();
    	});
    }
	$(".board-compose-wrapper .name-input").inputLengthSet({
		maxLength: 16,
		posX: 120,
		posY:8
	});
	$(".board-compose-wrapper .subject-input").inputLengthSet({
		maxLength: 50,
		posX: 520,
		posY:8
	});
	$(".board-top .compose-button").bind('click', function(){
		if(serverData.userServiceId == '' && variable.captchaLoaded == false){
			load_captcha(function(){
				$(".board-content").fadeOut(150, function(){
					$(".board-compose-wrapper").show();
				});
			});
		} else {
			$(".board-content").fadeOut(150, function(){
				$(".board-compose-wrapper").show();
			});
		}
	});
	$(".board-compose-wrapper .button-wrapper #cancel").bind('click', function(){
		$(".board-compose-wrapper").fadeOut(150, function(){
			$(".board-compose-wrapper input").val('');
			$(".board-compose-wrapper textarea").val('');
			$(".board-content").show();
		});
	});
	$(".board-compose-wrapper .button-wrapper #submit").bind('click', function(){
		submit();
	});
	$(".board-compose-wrapper #user-file-upload-form #file-input").bind('change', function(){
		// IE !!!!!!!!!!
		if($(this).val().length == 0)
			return;
		document.getElementById("user-file-upload-target").onload = image_upload_done;
		$(this).parent().attr('target', 'user-file-upload-target');
		var val = $(this).val();
		var ext = val.split(".").pop();
		var size = 0;
		try{
			size = this.files[0].size / 1024;
		} catch(err){
			// oldie fallback
			size = 0;
		}
		if(file_validation('image', ext, size, 10240) == false)
			return;
		var uuid = generate_uuid();
		$(this).parent().children('.uuid').val(uuid);
		$(this).parent().submit();
		draw_progress();
	});
});
function load_captcha(callback){
	draw_progress();
	$.ajax({
		url : "/requestreceiver/",
		type : "post",
		data :{
			req_type : "generate_captcha",
			uniqueKey: serverData.uniqueKey
		},
		success : function(result){
			if(result.result == 'ok'){
				var captcha = serverData.captchaLocation;
				var img = new Image();
				img.src = captcha;
				img.onload = function(){
					$(".board-compose-wrapper .input-line #captcha-image").prop('src', captcha);
					remove_progress();
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
function image_upload_done(){
	var txt = $("#user-file-upload-target").contents().text();
	if(txt.indexOf('ERROR') != -1)
	{
		$(".board-compose-wrapper #user-file-upload-form").submit();
		return;
	}
	if(txt.length >= 1000)
		return;

	var res = JSON.parse(txt);

	if(typeof res.result === 'undefined')
		return;

	remove_progress();
	if(res.result == 'ok'){
		var f = serverData.filePrefix + res.filename[0];
		var img = new Image();
		img.src = f;
		img.onload = function(){
			var w = this.width;
			var h = this.height;
			var ed = tinyMCE.get('body-input');                	// get editor instance
			var range = ed.selection.getRng();                  // get range
			var newNode = ed.getDoc().createElement ( "img" );  // create img node
			var acceptedWidth = $(".board-compose-wrapper").width() * 0.7;
			if(w > acceptedWidth){
				newNode.style.width = acceptedWidth + 'px';
				newNode.style.height = 'auto';
			}
			newNode.src= f;                        				// add src attribute
			range.insertNode(newNode);                          // insert Node
		};
	}
	else
	{
		draw_general_popup(
				null,
				null,
				null,
				stringTable.wrongFileType,
				stringTable.ok,
				null
		);
	}
	$("input:file").clearInputs();
}
function submit(){
	var nameObj = $(".board-compose-wrapper .input-line .name-input");
	var subjectObj = $(".board-compose-wrapper .input-line .subject-input");
	var passwordObj = $(".board-compose-wrapper .input-line .password-input");
	var captchaObj = $(".board-compose-wrapper .input-line .captcha-input");
	var bodyObj = $("#body-input");
	var messageObj = $(".board-compose-wrapper .compose-error-message");
	$(messageObj).html('');
	$(nameObj).css('border', '1px solid #ccccbc');
	$(subjectObj).css('border', '1px solid #ccccbc');
	$(bodyObj).css('border', '1px solid #ccccbc');

	var name = $(nameObj).val();
	var subject = $(subjectObj).val();
	var password=  $(passwordObj).val();
	var captcha = $(captchaObj).val();
	if(!$('html').is('.ie6, .ie7')){
		variable.body = '' + tinymce.activeEditor.getContent();
    } else {
    	variable.body = $("#body-input").val();
    }
	var pass = true;
	var message = '';

	if(name.length == 0){
		$(nameObj).css('border', '1px solid red');
		message = stringTable.nameNotProvided + '<br>';
		pass = false;
	}
	if(subject.length < 4){
		$(subjectObj).css('border', '1px solid red');
		message += stringTable.subjectNotProvided + '<br>';
		pass = false;
	}
	if(serverData.serviceId != serverData.userServiceId && password.length < 4){
		$(passwordObj).css('border', '1px solid red');
		message += stringTable.passwordLength + '<br>';
		pass = false;
	}
	if(serverData.userServiceId == '' && captcha.length < 5){
		$(captchaObj).css('border', '1px solid red');
		message += stringTable.wrongCaptcha + '<br>';
		pass = false;
	}
	if(variable.body.length == 0){
		$(bodyObj).css('border', '1px solid red');
		message += stringTable.bodyNotProvided;
		pass = false;
	}
	if(!pass){
		$(messageObj).html(message);
		return;
	}
	draw_progress();
	var data = {
		'body': variable.body,
		'subject': subject,
		'name': name,
		'file': '',
		'password': password,
		'captcha': captcha,
		'serviceId': serverData.serviceId,
		'tag': serverData.tag,
		'sticky': false,
		'uniqueKey': serverData.uniqueKey
	};
	$.ajax({
		url : "/requestreceiver/",
		type : "post",
		data :{
			req_type : "normalboard_register",
			data: JSON.stringify(data)
		},
		success : function(response){
			remove_progress();
			if(response.result == 'ok'){
				draw_general_popup(
						function(){
							$(".board-compose-wrapper input").val('');
							$(".board-compose-wrapper textarea").val('');
							location.reload();
						},
						null,
						null,
						stringTable.submitSuccess,
						stringTable.ok,
						null
				);
			} else {
				if(response.error_code == 'captcha error'){
					$(captchaObj).css('border', '1px solid red');
					draw_general_popup(
							null,
							null,
							null,
							stringTable.wrongCaptcha,
							stringTable.ok,
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