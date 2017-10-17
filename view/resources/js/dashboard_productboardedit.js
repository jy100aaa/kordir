$(function(){
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
				productVariable.listImageFlag = false;
				var is_safari = navigator.userAgent.indexOf("Safari") > -1;
				if(!is_safari)
					$("#file-input-proxy").click();
				else
					$("#product-file-input").click();
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
	    toolbar: "undo redo | bold italic | alignleft aligncenter alignright alignjustify | bullist numlist outdent indent | link image | fontsizeselect forecolor | uploadpicture | media | code",
	    plugins: 'link image textcolor uploadpicture media autoresize code',
	    content_css: '/resources/plugins/tinymce_4.6.1/content.css',
	    autoresize_min_height: 360,
	    relative_urls: false,
	    convert_urls: false,
	    menubar:false,
	    statusbar:false,
	    forced_root_block : false,
	    init_instance_callback : function(ed) {
	    	productVariable.body = '' + ed.getContent();
	    }
	});
	$(".basic-wrapper .added-input-line-number").each(function(){
		$(this).data('data-number', true);
	});
	$(".basic-wrapper .added-input-line-string").each(function(idx){
		$(this).data('data-number', false);
		$(this).children('.added-input-value').autoCompletion({
			textSet: productVariable.stringValue[idx],
			maxHeight: 150,
			width:180,
			marginTop: 7,
			height:30,
			showAllListOnBlank:true,
			noneCancel: false,
			boxColor:"#efefef",
			textColor:"#4d4d4d",
			hoverBoxColor:"#d6d6d6",
			hoverTextColor:"#4d4d4d",
			onSelectCallBackFn: function(){
			}
		});
	});
	$(".basic-wrapper .add-input-line").bind('click', function(){
		var className =  $(this).prop('class');
		$(".basic-wrapper").append($("#added-input-line-template").html());
		var lastAdded = $(".basic-wrapper .added-input-line").last();
		if(className.indexOf('number') != -1){
			$(lastAdded).find('.added-input-unit').show();
			$(lastAdded).find('.added-input-value').ForceNumericOnly();
			$(lastAdded).data('data-number', true);
		} else {
			$(lastAdded).data('data-number', false);
		}
		add_label_event($(".basic-wrapper .added-input-line .added-input-tag").last());
	});
	$("#body-file-upload-form #product-file-input").bind('change', function(){
		// IE !!!!!!!!!!
		if($(this).val().length == 0)
			return;
		document.getElementById("file-upload-target").onload = body_image_upload_done;
		$(this).parent().attr('target', 'file-upload-target');
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
		$("input:file").clearInputs();
		draw_progress();
	});
	$("#gallery-file-upload-form #gallery-file-input").bind('change', function(){
		try{
			var files = this.files;
			for(var i = 0; i < files.length; i++){
				var ext = files[i].name.split('.').pop();
				var size = files[i].size / 1024;
				if(file_validation('image', ext, size, 10240) == false)
					return;
			}
		} catch(err){
			// -_-
		}
		document.getElementById("file-upload-target").onload = gallery_image_upload_done;
		$(this).parent().attr('target', 'file-upload-target');
		var uuid = generate_uuid();
		$(this).parent().children('.uuid').val(uuid);
		$(this).parent().attr('action', "/requestreceiver/?X-Progress-ID=" + uuid);
		$(".gallery .progress-area").show();
		$(".gallery .progress-area .progress-percentage .progress-percentage-number").text('0');
		productVariable.progressTimer = window.setInterval(function(){
			var obj = {
				root: '.gallery .progress-area',
				bar: '.gallery .progress-area .progress-bar-outer span',
				number: '.gallery .progress-area .progress-percentage .progress-percentage-number'
			};
			progress_update(productVariable.progressTimer, obj, uuid);
		}, 1000);
		$(this).parent().submit();
		$(".gallery .gallery-item-empty").fadeOut(150);
		$(".gallery .aid-text").hide();
	});
	$(".gallery img").each(function(){
		add_image_event(this);
	});
	$(".gallery-wrapper .gallery .trashcan").droppable({
		drop: function(event, ui){
			draw_general_popup(
				function(){
						$(".trashcan").css('background-color', '#efefef');
						$(".trashcan").children('.trashcan-icon').css({
							'background-position': '0px 0px'
						});
						$(ui.draggable).remove();
						if($(".gallery img").length == 0){
							$(".gallery .gallery-item-empty").show();
							$(".gallery .aid-text").hide();
						}
					},
					function(){
						$(".trashcan").css('background-color', '#efefef');
						$(".trashcan").children('.trashcan-icon').css({
							'background-position': '0px 0px'
						});
					},
					null,
					stringTable.deletePicture,
					stringTable.yes,
					stringTable.no
			);
		},
		over: function(event, ui){
			$(this).css('background-color', 'orange');
			$(this).children('.trashcan-icon').css({
				'background-position': '-48px 0px'
			});
		},
		out: function(event, ui){
			$(this).css('background-color', '#efefef');
			$(this).children('.trashcan-icon').css({
				'background-position': '0px 0px'
			});
		},
		tolerance: "touch"
	});
	$(".button-wrapper #submit").bind('click', function(){
		submit();
	});
	$(".button-wrapper #cancel").bind('click', function(){
		window.history.back();
	});
	$(".input-line .image-wrapper").bind('click', function(){
		productVariable.listImageFlag = true;
	});
	$(".upload-represent-picture-button").bind('click', function(){
		productVariable.listImageFlag = true;
	});
});
function progress_update(interval, obj, uuid){
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
				if(percentage == 100)
					return;
				if($(obj.root).css('display') == 'none'){
					$(obj.root).show();
				}
				$(obj.bar).css('width', percentage + '%');
				$(obj.number).text(percentage);
			}
			if(res.state == 'done')
			{
				window.clearInterval(interval);
				$(obj.root).hide();
				$(obj.bar).css('width', '0');
				$(obj.number).text('');
				$(".gallery .aid-text").show();
			}
		},
		error:function(){
			window.clearInterval(interval);
		}
	});
}
function gallery_image_upload_done(){
	var txt = $("#file-upload-target").contents().text();
	var res = '';
	try {
		res = JSON.parse(txt);
	} catch(err) {
		$(".board-compose-wrapper #body-file-upload-form").submit();
		return;
	}
	for(var i = 0; i < res.filename.length; i++){
		var imgElem = document.createElement('img');
		imgElem.src = productVariable.galleryPictureFilePrefix + res.filename[i];
		$(".gallery").append(imgElem);
		add_image_event($(".gallery img").last());
	}
	$("#gallery-file-upload-form #gallery-file-input").val('');
}
function add_image_event(obj){
	$(obj).draggable({
		cursor: "pointer",
		zIndex: 10,
		start: function(e, u){
			$(this).parent().css('background-color', 'black');
			var w = $(this).width();
			var h = $(this).height();
		},
		stop: function(e, u){
			$(this).parent().css('background-color', 'inherit');
		},
		revertDuration: 10,
		revert: true
	});
	$(obj).droppable({
		drop: function(event, ui){
			var srcFrom = $(ui.draggable).prop('src');
			var srcTo = $(this).prop('src');

			$(ui.draggable).prop('src', srcTo);
			$(this).prop('src', srcFrom);

			$(".gallery img").each(function(){
				$(this).css({
					'opacity': '1'
				});
			});
		},
		over: function(event, ui){
			$(this).css({
				'opacity': '0.2'
			});
		},
		out: function(event, ui){
			$(this).css({
				'opacity': '1'
			});
		},
		tolerance: "intersect"
	});
}
function remove_inputline(obj){
	$(obj).parent().remove();
}
function add_label_event(obj){
	$(obj).off();
	$(obj).autoCompletion({
		textSet : productVariable.label,
		maxHeight: 150,
		width:180,
		marginTop: 7,
		height:30,
		showAllListOnBlank:true,
		noneCancel: false,
		boxColor:"#efefef",
		textColor:"#4d4d4d",
		hoverBoxColor:"#d6d6d6",
		hoverTextColor:"#4d4d4d",
		onSelectCallBackFn: function(){
		}
	});
}
function body_image_upload_done(){
	remove_progress();
	var txt = $("#file-upload-target").contents().text();
	var res = '';
	try{
		res = JSON.parse(txt);
	} catch(err){
		$(".board-compose-wrapper #body-file-upload-form").submit();
		return;
	}

	if(res.result == 'ok'){
		var f = productVariable.bodyPictureFilePrefix + res.filename[0];

		if(productVariable.listImageFlag == true){
			$(".input-line .image-wrapper img").prop('src', f);
			productVariable.listImage = res.filename[0];
			productVariable.listImageFlag = false;
			return;
		}

		var img = new Image();
		img.src = f;
		img.onload = function(){
			var w = this.width;
			var h = this.height;
			var ed = tinyMCE.get('body-input');                	// get editor instance
			var range = ed.selection.getRng();                  // get range
			var newNode = ed.getDoc().createElement ( "img" );  // create img node
			var acceptedWidth = 960 * 0.7;
			if(w > acceptedWidth){
				newNode.style.width = acceptedWidth + 'px';
				newNode.style.height = 'auto';
			} else {
				newNode.style.width = 'auto';
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
	var passed = true;
	var message = '';
	var subjectObj = $(".basic-wrapper .input-line .subject-input");
	var nameObj = $(".basic-wrapper .input-line .name-input");
	var bodyObj = $("#body-input");
	var addedInput = $(".basic-wrapper .added-input-line");
	var galleryImageObj = $(".gallery-wrapper .gallery img");
	var messageObj = $(".compose-error-message");

	$(subjectObj).css('border', '1px solid #ccccbc');
	$(nameObj).css('border', '1px solid #ccccbc');
	$(bodyObj).css('border', '1px solid #ccccbc');
	$(addedInput).each(function(){
		$(this).children('.added-input-tag').css('border-bottom', '1px solid #ccccbc');
		$(this).children('.added-input-value').css('border', '1px solid #ccccbc');
	});
	$(messageObj).html('');

	var subject =  $(subjectObj).val();
	var name = $(nameObj).val();
	var labelValue = [];
	var gallery = [];

	productVariable.body = '' + tinymce.activeEditor.getContent();

	if(subject.length < 2){
		$(subjectObj).css('border', '1px solid red');
		message = stringTable.subjectNotProvided + '<br>';
		passed = false;
	}
	if(name.length == 0){
		$(nameObj).css('border', '1px solid red');
		message += stringTable.nameNotProvided + '<br>';
		passed = false;
	}
	if(productVariable.body.length == 0){
		$(bodyObj).css('border', '1px solid red');
		message += stringTable.bodyNotProvided + '<br>';
		passed = false;
	}
	var customInputEmpty = false;
	$(".basic-wrapper .added-input-line").each(function(){
		var tag = $(this).children('.added-input-tag').val();
		var value = $(this).children('.added-input-value').val();
		var unit = $(this).children('.added-input-unit').val();
		var number = $(this).data('data-number');
		var labelValuePair = {
			label: tag,
			value: value,
			unit: unit,
			number: number
		};
		labelValue.push(labelValuePair);
		if(tag.length == 0)
		{
			$(this).children('.added-input-tag').css('border-bottom', '1px solid red');
			passed = false;
			if(!customInputEmpty){
				message += stringTable.customInputNotProvided + '<br>';
				customInputEmpty = true;
			}
		}
		if(value.length == 0)
		{
			$(this).children('.added-input-value').css('border', '1px solid red');
			passed = false;
			if(!customInputEmpty){
				message += stringTable.customInputNotProvided + '<br>';
				customInputEmpty = true;
			}
		}
		if(number && unit.length == 0){
			$(this).children('.added-input-unit').css('border', '1px solid red');
			passed = false;
			if(!customInputEmpty){
				message += stringTable.customInputNotProvided + '<br>';
				customInputEmpty = true;
			}
		}
	});
	$(galleryImageObj).each(function(){
		var src = $(this).prop('src');
		src = src.split('/');
		gallery.push(src.pop());
	});
	if(passed == false){
		$(messageObj).html(message);
		return;
	}
	var data = {
		name: name,
		subject: subject,
		labelValue: labelValue,
		gallery: gallery,
		body: productVariable.body,
		listImage: productVariable.listImage,
		tag: productVariable.tag,
		seq: productVariable.seq
	};

	draw_progress();

	$.ajax({
		url : "/requestreceiver/",
		type : "post",
		data :{
			req_type : "productitem_edit",
			data: JSON.stringify(data)
		},
		success : function(response){
			remove_progress();
			if(response.result == 'ok'){
				draw_general_popup(
						function(){
							block_prevent_escape();
							location.hash = 'board?url=' + productVariable.tag + '&seq=' + productVariable.seq;
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