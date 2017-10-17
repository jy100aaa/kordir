boardVar.body = null;
boardVar.userId = serverData.id;

$(function(){
	$(".box .box-control #previous-button").bind('click', function(){
		window.history.back();
	});
	$(".box .box-control #delete-button").bind('click', function(){
		draw_general_popup(
				function(){
					var data = {
						boardType: boardVar.boardType,
						tag: boardVar.tag,
						seq: boardVar.seq,
						userId: boardVar.userId,
						serviceId: boardVar.serviceId,
						password: ''
					};
					delete_boarditem(data);
				},
				null,
				null,
				stringTable.askDelete,
				stringTable.yes,
				stringTable.no
		);
	});

	tinymce.PluginManager.add('uploadpicture', function(editor, url) {
	    // Add a button that opens a window
		editor.addButton('uploadpicture', {
			text: stringTable.uploadPicture,
			icon: false,
			onclick: function() {
				if(oldIE){
					draw_general_popup(
							null,
							null,
							null,
							stringTable.oldIENotSupported,
							stringTable.ok,
							null
					);
					return;
				}
				var is_safari = navigator.userAgent.indexOf("Safari") > -1;
				if(!is_safari)
					$("#file-input-proxy").click();
				else
					$("#file-input").click();
			}
		});
	});
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
	    autoresize_min_height: 360,
	    relative_urls: false,
	    convert_urls: false,
	    menubar:false,
	    statusbar:false,
	    forced_root_block : false,
	    init_instance_callback : function(ed) {
    		boardVar.body = '' + ed.getContent();
	    }
	});
	$(".board-compose-wrapper .name-input").inputLengthSet({
		maxLength: 16,
		posX: 256,
		posY:8
	});
	$(".board-compose-wrapper .subject-input").inputLengthSet({
		maxLength: 50,
		posX: 516,
		posY:8
	});
	$("#edit-button").bind('click', function(){
		$(".box").fadeOut(150, function(){
			$(".board-compose-wrapper").show();
		});
	});
	$(".board-compose-wrapper .button-wrapper #cancel").bind('click', function(){
		$(".board-compose-wrapper").fadeOut(150, function(){
			$(".box").show();
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
		var ext = $(this).val().split(".").pop();
		var size = 0;
		try{
			size = this.files[0].size / 1024;
		} catch(err){
			size = 0;
		}

		if(file_validation('image', ext, size, 10240) == false)
			return;
		$(this).parent().children('.uuid').val(generate_uuid());
		$(this).parent().submit();
		draw_progress();
		$("input:file").clearInputs();
	});

	$("#board-attachment-upload-form #attachment-input").bind('change', function(){
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
		boardVar.attachment = uuid + '.' + val.split(".").pop();
		$(this).parent().children('.filename').val(boardVar.attachment);
		$(this).parent().children('.uuid').val(uuid);
		$(this).parent().attr('action', '/requestreceiver/?X-Progress-ID=' + uuid);
		boardVar.uploading = true;
		$(".input-line-file .file-select-button").hide();
		$(".input-line-file .progress-bar").css('display', 'inline-block');
		boardVar.uploadTimer = window.setInterval(function(){
			progress_update_attachment(uuid, boardVar.uploadTimer, $(".input-line-file .progress-bar"));
		}, 1000);
		$(this).parent().submit();
	});
	$(".input-line-file .after-upload .remove-file").bind('click', function(){
		boardVar.uploading = false;
		boardVar.attachment = '';
		$(this).parent().hide();
		$(".input-line-file .file-select-button").show();
	});
});
function progress_update_attachment(uuid, interval, obj){
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
function file_upload_done(){
	var txt = $("#board-attachment-upload-target").contents().text();
	var response = null;
	try{
		 response = JSON.parse(txt);
	} catch(err){
		if(boardVar.uploading){
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
	$(".input-line-file .progress-bar").hide();
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
	$(".input-line .after-upload").show();
	$(".input-line .after-upload .filename a").prop('href', boardVar.boardAttachmentLocation + boardVar.attachment);
	boardVar.uploading = false;
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
		var f = boardVar.filePrefix + res.filename[0];
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
}
function submit(){
	var nameObj = $(".board-compose-wrapper .name-input");
	var subjectObj = $(".board-compose-wrapper .subject-input");
	var bodyObj = $("#body-input");
	var messageObj = $(".board-compose-wrapper .compose-error-message");
	$(messageObj).html('');
	$(nameObj).css('border', '1px solid #ccccbc');
	$(subjectObj).css('border', '1px solid #ccccbc');
	$(bodyObj).css('border', '1px solid #ccccbc');

	var name = $(nameObj).val();
	var subject = $(subjectObj).val();
	var pass = true;
	var message = '';
	boardVar.body = '' + tinymce.activeEditor.getContent();

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
	if(boardVar.body.length == 0){
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
		'tag': boardVar.tag,
		'body': boardVar.body,
		'subject': subject,
		'name': name,
		'serviceId': boardVar.serviceId,
		'file': boardVar.attachment,
		'seq': boardVar.seq
	};

	$.ajax({
		url : "/requestreceiver/",
		type : "post",
		data :{
			req_type : "normalboard_edit",
			data: JSON.stringify(data)
		},
		success : function(response){
			remove_progress();
			if(response.result == 'ok'){
				draw_general_popup(
						function(){
							location.reload();
						},
						null,
						null,
						stringTable.editSuccess,
						stringTable.ok,
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