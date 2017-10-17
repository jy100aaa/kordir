$(function(){
	if($('html').is('.ie6, .ie7, .ie8, .ie9')){
		variableSettingMenu.ieNineOrBelow = true;
	}
	if(_MSIE){
	    var link  = document.createElement('link');
	    link.href = '/resources/css/dashboard_settingcontent_ie.css';
	    link.type = "text/css";
	    link.rel = "stylesheet";
	    link.media = "screen,print";
	    document.getElementsByTagName( "head" )[0].appendChild( link );
	}
	$(".node").bind('click touchend', function(e){
		node_click_event(e, this);
	});
	$(".node-block .parent-node .node-icon-left").bind('click touchend', function(e){
		parent_node_icon_click_event(e, this);
	});
	$(".tree-node-control .tree-node-create").bind('click', function(){
		$("#area").prepend("<div id='area-masking-no-progress'></div>");
		$(".tree-add").show();
	});
	$(".tree-add .tree-add-button-wrapper .tree-add-cancel").bind('click', function(){
		$(".tree-add .node").removeClass('chosen-node');
		$("#area-masking-no-progress").remove();
		$(".tree-add").hide();
	});
	$(".tree-add .tree-add-button-wrapper .tree-add-ok").bind('click', function(){
		add_node();
	});
	$(".tree-node-control .tree-node-delete").bind('click', function(){
		var obj = $(".chosen-node");
		if(obj.length == 0){
			draw_general_popup(
					null,
					null,
					null,
					stringTable.notSelected,
					stringTable.ok,
					null
			);
			return;
		}
		draw_general_popup(
				function(){
					delete_node(obj);
					var e = {
						pageX: $(".home-node").offset().left + 100,
						ctrlKey: false
					};
					node_click_event(e, $(".home-node")[0]);
				},
				null,
				null,
				stringTable.deleteLink,
				stringTable.yes,
				stringTable.no
		);
	});
	$(".tree-view .title .title-icon").bind('click', function(){
		$(".tree-view").fadeOut(150, function(){
			$(".tree-node").show();
			$(".tree-node-control button").removeAttr('disabled');
		});
	});
	$(".tree-node-control .tree-node-save").bind('click', function(e){
		// dashboard trial
		if(serverData.session.length == 0){
			draw_general_popup(
					function(){
						window.location.href = '/signup';
					},
					null,
					null,
					stringTable.trialNotSupported,
					stringTable.yes,
					stringTable.no
			);
			return;
		}
		draw_general_popup(
				function(){
					save();
				},
				null,
				null,
				stringTable.askSave,
				stringTable.yes,
				stringTable.no
		);
	});
	$(".tree-node-control .tree-node-preview").bind('click', function(e){
		var data = $(".tree-node-wrapper .tree-setting-body .home-node .node-data").text();
		data = JSON.parse(data);
		preview_page(data);
	});
	$(".draggable-node").each(function(){
		draggable_node_event(this);
	});
	$(".tree-view .tree-view-body .tree-view-line-value #nodename-input").inputLengthSet({
		maxLength: 30,
		posX: 236,
		posY: -18
	});
	$(".tree-view .tree-view-body .tree-view-line-value #title-input").inputLengthSet({
		maxLength: 30,
		posX: 236,
		posY: -18
	});
	$(".tree-view .tree-view-body .tree-view-line-value #url-input").inputLengthSet({
		maxLength: 17,
		posX: 236,
		posY: -18
	});
	$(".tree-view .tree-view-body .tree-view-line-value #hyperlink-input").inputLengthSet({
		maxLength: 128,
		posX: 236,
		posY: -18
	});
	$(".tree-view .tree-view-body .tree-view-line-value #url-input").bind('keydown', function(e){
		var key = e.charCode || e.keyCode || 0;
        return (
        	key == 191 ||
            key == 8 ||
            key == 9 ||
            key == 46 ||
            key == 110 ||
            key == 190 ||
            (key >= 35 && key <= 40) ||
            (key >= 48 && key <= 57) ||
            (key >= 65 && key <= 90) ||
            (key >= 97 && key <= 122) ||
            (key >= 96 && key <= 105));
	});
	$(".tree-view .tree-view-body .tree-view-line-value #title-input").blur(function(){
		var val = $(".tree-view .tree-view-body .tree-view-line-value #title-input").val();
		variableSettingMenu.currentData.title = val;
		$(variableSettingMenu.currentNode).children('.node-data').text(JSON.stringify(variableSettingMenu.currentData));
	});
	$(".tree-view .tree-view-body .tree-view-line-value #nodename-input").blur(function(){
		var val = $(".tree-view .tree-view-body .tree-view-line-value #nodename-input").val();
		variableSettingMenu.currentData.nodeName = val;
		$(variableSettingMenu.currentNode).children('.node-data').text(JSON.stringify(variableSettingMenu.currentData));
		$(variableSettingMenu.currentNode).children('.node-name').text(val);
	});
	$(".tree-view .tree-view-body .tree-view-line-value #board-comment-input").blur(function(){
		var val = $(this).val();
		variableSettingMenu.currentData.kv.comment = val;
		$(variableSettingMenu.currentNode).children('.node-data').text(JSON.stringify(variableSettingMenu.currentData));
	});
	$(".tree-view .tree-view-body .tree-view-line-value #hyperlink-input").blur(function(){
		var val = $(".tree-view .tree-view-body .tree-view-line-value #hyperlink-input").val();
		variableSettingMenu.currentData.url = val;
		$(variableSettingMenu.currentNode).children('.node-data').text(JSON.stringify(variableSettingMenu.currentData));
	});
	$(".tree-view .tree-view-body .tree-view-line-value #url-input").blur(function(){
		var val = $(".tree-view .tree-view-body .tree-view-line-value #url-input").val();
		if(val[0] != '/'){
			val = '/' + val;
			variableSettingMenu.currentData.url = val;
			$(".tree-view .tree-view-body .tree-view-line-value #url-input").val(val);
		} else {
			variableSettingMenu.currentData.url = val;
		}
		$(variableSettingMenu.currentNode).children('.node-data').text(JSON.stringify(variableSettingMenu.currentData));
	});
	$(".tree-view .tree-view-body .tree-view-line-value #code-input").blur(function(){
		var val = $(".tree-view .tree-view-body .tree-view-line-value #code-input").val();
		variableSettingMenu.currentData.code = val;
		$(variableSettingMenu.currentNode).children('.node-data').text(JSON.stringify(variableSettingMenu.currentData));
	});
	$(".tree-view .tree-view-body .tree-view-line-value #chat-text-input").blur(function(){
		var val = $(".tree-view .tree-view-body .tree-view-line-value #chat-text-input").val();
		variableSettingMenu.currentData.kv.text = val;
		$(variableSettingMenu.currentNode).children('.node-data').text(JSON.stringify(variableSettingMenu.currentData));
	});
	$(".tree-view .tree-view-body .tree-view-line .page-compose").bind('click', function(){
		if($(".viewport-check").css('display') !== 'none'){
			draw_general_popup(
					null,
					null,
					null,
					stringTable.viewportRestricted,
					stringTable.ok,
					null
			);
			return;
		}
		var obj = tinymce.activeEditor.getBody();
		var attrib = {
			image: '',
			repeat: '',
			size:'',
			position:'',
			iefix: ''
		};

		if(variableSettingMenu.currentData.kv.backgroundImage.length == 0)
			attrib.image = 'none';
		else
			attrib.image = "url('"+variableSettingMenu.backgroundImageFilePreFix + variableSettingMenu.currentData.kv.backgroundImage + "')";

		if(variableSettingMenu.currentData.kv.backgroundImageMode == 0){
			attrib.repeat = 'no-repeat';
			attrib.size = 'cover';
			attrib.position = 'center';
		} else {
			attrib.repeat = 'repeat';
			attrib.size = 'auto';
			attrib.position = 'top left';
		}
		background_set(obj, attrib);
		body_content_init();
		$("#editor").fadeIn(250, function(){
			$(".dashboard-body").hide();
			tinymce.execCommand('mceFocus',false,'editor-input');
		});
	});
	$(".tree-view .tree-view-line .tree-view-line-value #background-color-input").bind('change', function(){
		var val = $(this).val();
		variableSettingMenu.currentData.kv.backgroundColor = val;
		$(variableSettingMenu.currentNode).children('.node-data').text(JSON.stringify(variableSettingMenu.currentData));
	});

	$(".tree-view .tree-view-line .tree-view-line-value #background-color-input").ColorPicker({
		onShow: function(obj){
			$(obj).fadeIn(200);
			return false;
		},
		onBeforeShow: function () {
			$(this).ColorPickerSetColor(this.value);
			$(".colorpicker_submit").hide();
		},
		onHide: function(obj){
			$(".tree-view .tree-view-line .tree-view-line-value #background-color-input").trigger('change');
		},
		onChange: function (hsb, hex, rgb) {
			$(".tree-view .tree-view-line .tree-view-line-value #background-color-input").val('#' + hex);
		}
	});

	$(".tree-view .tree-view-line .tree-view-line-value #background-image-delete").bind('click', function(){
		$(".tree-view .tree-view-line .tree-view-line-value #background-image-input").val("");
		$(".tree-view .tree-view-line .tree-view-line-value .background-mode .selected-mode").removeClass('selected-mode');
		$(".tree-view .tree-view-line .tree-view-line-value #background-image-input").trigger('change');
	});

	$(".tree-view .tree-view-line .tree-view-line-value .background-mode img").bind('click', function(){
		if($(".tree-view .tree-view-line .tree-view-line-value #background-image-input").val().length == 0){
			draw_general_popup(
					null,
					null,
					null,
					stringTable.firstUploadBackgroundImage,
					stringTable.ok,
					null
				);
			return;
		} else {
			var mode = 0;
			$(".tree-view .tree-view-line .tree-view-line-value .background-mode .selected-mode").removeClass('selected-mode');
			$(this).addClass('selected-mode');
			if($(this).hasClass('background-mode-fullscreen') == true)
				mode = 0;
			if($(this).hasClass('background-mode-repeat') == true)
				mode = 1;
			variableSettingMenu.currentData.kv.backgroundImageMode = mode;
			$(variableSettingMenu.currentNode).children('.node-data').text(JSON.stringify(variableSettingMenu.currentData));
		}
	});

	$(".tree-view .tree-view-line .tree-view-line-value #background-image-input").bind('click', function(){
		open_background_image_manager(this);
	});

	$(".tree-view .tree-view-line .tree-view-line-value #background-image-input").bind('change blur', function(){
		var val = $(this).val();
		if(val.length != 0){
			$(".tree-view .tree-view-line .tree-view-line-value .background-mode").removeClass('selected-mode');
			$(".tree-view .tree-view-line .tree-view-line-value .background-mode img").eq(0).addClass('selected-mode');
		}
		variableSettingMenu.currentData.kv.backgroundImage = val;
		$(variableSettingMenu.currentNode).children('.node-data').text(JSON.stringify(variableSettingMenu.currentData));
	});
	$("#background-image-manager #background-image-manager-close").bind('click', function(){
		$("#background-image-manager").fadeOut(150, function(){
			$("#background-image-manager-masking").remove();
		});
	});
	$("#background-image-manager #background-image-file-upload").bind('click', function(){
		var isSafari = Object.prototype.toString.call(window.HTMLElement).indexOf('Constructor') > 0;
		if(isSafari){
			$("#background-image-file-upload-form #background-image-file-input").click();
		}
	});
	$("#background-image-file-upload-form #background-image-file-input").bind('change', function(){
		// IE !!!!!!!!!!
		if($(this).val().length == 0)
			return;

		var ext = $(this).val().split(".").pop();
		var size = 0;
		try{
			size = this.files[0].size / 1024;
		} catch(err){}
		if(file_validation('image', ext, size, 10240) == false)
			return;

		var uuid = generate_uuid();
		$(this).parent().children('.uuid').val(uuid);

		if(variableSettingMenu.ieNineOrBelow){
			$(this).parent().attr('target', 'background-image-file-upload-target');
			document.getElementById("background-image-file-upload-target").onload = background_image_upload_done;
			$(this).parent().submit();
			draw_progress();
		} else {
			var formData = new FormData(document.getElementById('background-image-file-upload-form'));
			variableSettingMenu.uploadXhr = createXMLHTTPObject();
			variableSettingMenu.uploadXhrResponse = '';
			variableSettingMenu.uploadXhr.onreadystatechange = function(){
				if(variableSettingMenu.uploadXhr.readyState == 4){

				}
			};
			variableSettingMenu.uploadXhr.open("POST", "/requestreceiver/?X-Progress-ID=" + uuid, true);
			variableSettingMenu.uploadXhr.send(formData);
			variableSettingMenu.uploadProgressTimer = new Object();

			draw_upload_progress_popup(
					variableSettingMenu.uploadXhr,
					variableSettingMenu.uploadProgressTimer,
					uuid,
					stringTable.fileUploadProgress,
					stringTable.fileUploadDone,
					stringTable.ok,
					stringTable.cancel,
					function(){
						background_image_upload_done(variableSettingMenu.uploadXhr.responseText);
					},
					null,
					false
			);
		}
		$("#background-image-manager").fadeOut(150, function(){
			$("#background-image-manager-masking").remove();
		});
		$("input:file").clearInputs();
	});

	$("#body-file-upload-form #body-file-input").bind('change', function(){
		// IE !!!!!!!!!!
		if($(this).val().length == 0)
			return;
		var uuid = generate_uuid();
		$(this).parent().children('.uuid').val(uuid);
		var sizes = [];
		try{
			var files = this.files;
			for(var i = 0; i < files.length; i++){
				var ext = files[i].name.split('.').pop();
				size.push(files[i].size / 1024);
			}
		} catch(err){
			// -_-
		}
		for(var i = 0; i < sizes.length; i++){
			if(file_validation('image', ext, sizes[i], 10240) == false)
				return;
		}
		if(variableSettingMenu.ieNineOrBelow){
			$(this).parent().attr('target', 'body-file-upload-target');
			document.getElementById("body-file-upload-target").onload = body_image_upload_done;
			$(this).parent().submit();
			draw_progress();
		} else {
			var formData = new FormData(document.getElementById('body-file-upload-form'));
			variableSettingMenu.uploadXhr = createXMLHTTPObject();
			variableSettingMenu.uploadXhrResponse = '';
			variableSettingMenu.uploadXhr.onreadystatechange = function(){
				if(variableSettingMenu.uploadXhr.readyState == 4)
					variableSettingMenu.uploadXhrResponse = variableSettingMenu.uploadXhr.responseText;
			};
			variableSettingMenu.uploadXhr.open("POST", "/requestreceiver/?X-Progress-ID=" + uuid, true);
			variableSettingMenu.uploadXhr.send(formData);
			variableSettingMenu.uploadProgressTimer = new Object();

			draw_upload_progress_popup(
					variableSettingMenu.uploadXhr,
					variableSettingMenu.uploadProgressTimer,
					uuid,
					stringTable.fileUploadProgress,
					stringTable.fileUploadDone,
					stringTable.ok,
					stringTable.cancel,
					function(){
						body_image_upload_done(variableSettingMenu.uploadXhrResponse);
					},
					null,
					false
			);
		}
		$("input:file").clearInputs();
	});
	$("#html-file-upload-form #html-file-input").bind('change', function(){
		document.getElementById('html-file-upload-target').onload = html_upload_done;
		$(this).parent().attr('target', 'html-file-upload-target');
		var ext = $(this).val().split(".").pop();
		var size = this.files[0].size / 1024;
		if(file_validation('html', ext, size, 10240) == false)
			return;
		var fileName = $(this).val().split("\\").pop();
		var uuid = generate_uuid();
		$(this).parent().children('.uuid').val(uuid);
		$(this).parent().children('.filename').val(fileName);
		$(this).parent().submit();
		draw_progress();
		$("input:file").clearInputs();
	});
	$("#slide-file-upload-form #slide-file-input").bind('change', function(){
		// IE !!!!!!!!!!
		if($(this).val().length == 0)
			return;

		$(this).parent().attr('target', 'slide-file-upload-target');
		var uuid = generate_uuid();
		$(this).parent().children('.uuid').val(uuid);
		var fileName = $(this).val().split("\\").pop();
		$(this).parent().children('.filename').val(fileName);
		$(this).parent().children('.url').val(variableSettingMenu.currentData.url);

		var ext = $(this).val().split(".").pop();
		var size = 0;
		try{
			size = this.files[0].size / 1024;

		} catch(err){
			// -_-
		}
		if(file_validation('slide', ext, size, 30720) == false)
			return;
		if(variableSettingMenu.ieNineOrBelow){
			$(this).parent().attr('target', 'slide-file-upload-target');
			document.getElementById('slide-file-upload-target').onload = slide_upload_done;
			$(this).parent().attr('action', "/requestreceiver/?X-Progress-ID=" + uuid);
			$(this).parent().submit();
		} else {
			var formData = new FormData(document.getElementById('slide-file-upload-form'));
			variableSettingMenu.uploadXhr = createXMLHTTPObject();
			variableSettingMenu.uploadXhr.open("POST", "/requestreceiver/?X-Progress-ID=" + uuid, true);
			variableSettingMenu.uploadXhr.send(formData);
			variableSettingMenu.uploadProgressTimer = new Object();
		}
		draw_upload_progress_popup(
				variableSettingMenu.uploadXhr,
				variableSettingMenu.uploadProgressTimer,
				uuid,
				stringTable.fileUploadProgress,
				stringTable.fileUploadDone,
				stringTable.ok,
				stringTable.cancel,
				function(){
					draw_general_popup(
							null,
							null,
							null,
							stringTable.slideProcessing,
							null,
							null
					);
				},
				null,
				true
		);
	});
	$(".leaf-node").each(function(){
		var type = $(this).attr('data-type');
		if(type == 'page'){
			var d = $(this).children('.node-data').text();
			var json = JSON.parse(d);
			var body = $(this).children('.node-data-body').html();
			json.kv.body = body;
			$(this).children('.node-data').text(JSON.stringify(json));
		}
	});

	plugin_init();
	editor_init();

	// editor init takes some moment
	variableSettingMenu.editorInitTimer = null;
	variableSettingMenu.editorInitDone = false;
	variableSettingMenu.editorInitTimer = setInterval(function() {
		try{
			if(document.readyState == "complete" &&
					typeof tinymce !== 'undefined' &&
					typeof tinymce.activeEditor !== 'undefined' &&
					typeof tinymce.activeEditor.setContent !== 'undefined' &&
					$(".tree-view .tree-view-body").length != 0) {

				clearInterval(variableSettingMenu.editorInitTimer);
				variableSettingMenu.editorInitTimer = null;
				variableSettingMenu.editorInitDone = true;
			}
		} catch(err){}
	}, 150);

	$(".editor-preview-selector .editor-preview-selector-button").bind('click', function(){
		var wrapper = $(".editor-preview .editor-preview-body .editor-preview-data-wrapper");
		var iframe = $(wrapper).children('iframe');
		$(".editor-preview-selector .editor-preview-selected").removeClass('editor-preview-selected');
		$(this).addClass('editor-preview-selected');

		if($(this).hasClass('editor-preview-selector-mobile')){
			$(".editor-preview .editor-preview-mobile-background").show();
			$(".editor-preview .editor-preview-body .editor-preview-data-wrapper").addClass('mobile-wrapper');
			$(".editor-preview").addClass('editor-preview-mobile');
			if(oldIE){
				draw_general_popup(
					null,
					null,
					null,
					stringTable.oldIEPreview,
					stringTable.ok,
					null
				);
			}
			setTimeout(function(){
				$(iframe).css({
					'width': $(wrapper).width() + 15 + 'px',
					'height': $(wrapper).height() + 'px'
				});
				$(".editor-preview").css('overflow-y', 'auto');
			}, 750);
		};

		if($(this).hasClass('editor-preview-selector-desktop')){
			$(".editor-preview .editor-preview-mobile-background").hide();
			$(".editor-preview .editor-preview-body .editor-preview-data-wrapper").removeClass('mobile-wrapper');
			$(".editor-preview .editor-preview-body").removeClass('editor-preview-body-mobile');
			$(".editor-preview").removeClass('editor-preview-mobile');
			$(iframe).css({
				'width': $(wrapper).width() + 'px',
				'height': $("#editor-preview").height() + 'px',
			});
			$(".editor-preview").css('overflow-y', 'hidden');
		}
		if($(this).hasClass('editor-preview-selector-close')){
			$("#editor-preview").fadeOut(250, function(){
				$(".editor-preview .editor-preview-body").removeClass('editor-preview-body-mobile');
				$(".editor-preview").removeClass('editor-preview-mobile');
				$(".editor-preview-selector .editor-preview-selected").removeClass('editor-preview-selected');
				$(".editor-preview").css('overflow-y', 'hidden');
				$(".editor-preview .editor-preview-body .editor-preview-data-wrapper").removeClass('mobile-wrapper');
				$(".editor-preview .editor-preview-mobile-background").hide();
				$("#editor-preview .editor-preview-body .editor-preview-data-wrapper iframe").remove();
			});
		}
	});
});
function background_image_upload_done(res){
	var filename = '';
	var pass = true;
	var response = null;
	if(variableSettingMenu.ieNineOrBelow){
		remove_progress();
		var txt = $("#background-image-file-upload-target").contents().text();
		try{
			 response = JSON.parse(txt);
			 if(response.result != 'ok')
				 pass = false;
		} catch(err){
			pass = false;
		}
		filename = response.filename[0];
	} else {
		try{
			response = JSON.parse(res);
		} catch(err){
			pass = false;
		}
		filename = response.filename[0];
	}
	if(!pass){
		draw_general_popup(
				null,
				null,
				null,
				stringTable.wrongFileType,
				null,
				null
		);
		return;
	}
	var inputObj = $("#background-image-manager").data('data-input');
	$(inputObj).val(filename);
	$(inputObj).trigger('change');
}
function body_image_upload_done(res){
	var response = null;
	var pass = true;
	if(variableSettingMenu.ieNineOrBelow){
		remove_progress();
		var txt = $("#body-file-upload-target").contents().text();
		try{
			 response = JSON.parse(txt);
			 if(response.result != 'ok')
				 pass = false;
		} catch(err){
			pass = false;
		}
	} else {
		try{
			response = JSON.parse(res);
			if(response.result != 'ok')
				pass = false;
		} catch(err){
			pass = false;
		}
	}
	if(pass){
		for(var i = 0; i < response.filename.length; i++){
			var f = variableSettingMenu.bodyPictureFilePrefix + response.filename[i];
			var img = new Image();
			img.src = f;
			img.onload = function(){
				var w = this.width;
				var h = this.height;
				var acceptedWidth = 960;
				var range =  tinymce.activeEditor.selection.getRng();                   	  // get range
				var newNode = document.createElement ( "img" );  	// create img node
				if(w > acceptedWidth){
					newNode.style.width = acceptedWidth + 'px';
					newNode.style.height = 'auto';
				}
				$(newNode).css({
					'border': '0',
					'border-radius': '0'
				});
				newNode.src= this.src;                        				// add src attribute
				range.insertNode(newNode);                          // insert Node
			    move_scroll_to(newNode);
			};
		}
	} else {
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
function slide_upload_done(){
	// do nothing node.js response will take care of it
}
function traverse_and_push(id, tree, data){
	for(var i = 0; i < tree.length; i++){
		if(tree[i].id == id)
		{
			var found = false;
			for(var j = 0; j < tree[i].children.length; j++){
				if(tree[i].children[j].id == data.id){
					found = true;
					break;
				}
			}
			if(!found)
				tree[i].children.push(data);
			return true;
		}
		if(tree[i].children.length != 0)
			traverse_and_push(id, tree[i].children, data);
	}
}
function node_click_event(e, obj){
	if(variableSettingMenu.editorInitDone == false){
		draw_general_popup(
				null,
				null,
				null,
				stringTable.loadingNotDone,
				stringTable.ok,
				null
		);
		return;
	}
	if($(obj).hasClass('add-node') == true){
		$(".tree-add .node").removeClass('chosen-node');
		$(obj).addClass('chosen-node');
		return;
	}
	if(!e.ctrlKey)
		$(".node").removeClass('chosen-node');
	$(obj).addClass('chosen-node');
	var data = $(obj).children('.node-data').text();
	data = JSON.parse(data);
	variableSettingMenu.currentNode = obj;
	variableSettingMenu.currentData = data;
	$(".tree-node-control .tree-node-delete").removeAttr('disabled');

	if($(obj).hasClass('home-node') == true){
		$(".tree-node-control .tree-node-delete").attr('disabled', true);
	}
	display_in_view_window();
}
function parent_node_icon_click_event(e, obj){
	var parent = $(obj).parent();
	var id = $(parent).prop('id').split('-')[2];
	var childObj = $("#children-block-" + id);
	if($(parent).hasClass('parent-node-collapse') == true){
		$(parent).addClass('parent-node-expand');
		$(parent).removeClass('parent-node-collapse');
		$(childObj).fadeIn(150);
	} else {
		$(parent).removeClass('parent-node-expand');
		$(parent).addClass('parent-node-collapse');
		$(childObj).fadeOut(150);
	}
	e.preventDefault();
	return false;
}
function display_in_view_window(){
	$(".tree-view-body .tree-view-initial-line").hide();
	var data = variableSettingMenu.currentData;

	$(".tree-view .tree-view-line").css('display', 'none');

	$(".tree-view .tree-view-line .tree-view-line-value").find("input[type='checkbox']").off();

	$(".tree-view .tree-view-line .tree-view-line-value #nodename-input").val(data.nodeName);
	$(".tree-view .tree-view-line .tree-view-line-value #title-input").val(data.title);
	$(".tree-view .tree-view-line .tree-view-line-value #url-input").val(data.url);
	$(".tree-view .tree-view-line .tree-view-line-value #hyperlink-input").val(data.url);
	$(".tree-view .tree-view-line .tree-view-line-value #code-input").val(data.code);

	$(".tree-view .tree-view-line").each(function(){
		var className = $(this).prop('class');
		if(className.indexOf(data.type) != -1)
			$(this).show();
	});

	if(data.type == 'parent'){
		$(".tree-view .tree-view-line .tree-view-line-value #navigationbox-input").switchButton({
			checked: data.kv.navigationBox,
			on_label: stringTable.use,
			off_label: stringTable.noUse,
			width: 60,
			height: 30,
			button_width: 30,
			on_callback: function(){
				variableSettingMenu.currentData.kv.navigationBox = true;
				$(variableSettingMenu.currentNode).children('.node-data').text(JSON.stringify(variableSettingMenu.currentData));
			},
			off_callback: function(){
				variableSettingMenu.currentData.kv.navigationBox = false;
				$(variableSettingMenu.currentNode).children('.node-data').text(JSON.stringify(variableSettingMenu.currentData));
			}
		});
	}

	if(data.type == 'landing' ||
			data.type == 'page' ||
			data.type == 'board' ||
			data.type == 'chat'){
		$(".tree-view .tree-view-line .tree-view-line-value #background-color-input").val(data.kv.backgroundColor);

		$(".tree-view .tree-view-line .tree-view-line-value #background-image-input").val(data.kv.backgroundImage);
		var mode = data.kv.backgroundImageMode;
		$(".tree-view .tree-view-line .tree-view-line-value .background-mode .selected-mode").removeClass('selected-mode');
		if (mode == 0 && data.kv.backgroundImage.length != 0){
			$(".tree-view .tree-view-line .tree-view-line-value .background-mode .background-mode-fullscreen").addClass('selected-mode');
		} else if (mode == 1 && data.kv.backgroundImage.length != 0){
			$(".tree-view .tree-view-line .tree-view-line-value .background-mode .background-mode-repeat").addClass('selected-mode');
		}
	}
	if(data.type == 'board'){
		var boardType;

		$("#tree-view-board-comment").hide();

		if(data.kv.boardType.indexOf('normal') != -1){
			$(".tree-view").find('.normal-board').show();
			$(".tree-view").find('.product-board').hide();
			boardType = stringTable.normalBoard;
		} else if(data.kv.boardType.indexOf('ask') != -1){
			$(".tree-view").find('.normal-board').hide();
			$(".tree-view").find('.product-board').hide();
			boardType = stringTable.askBoard;
			$("#tree-view-board-comment").show();
			$(".tree-view .tree-view-line .tree-view-line-value #board-comment-input").val(data.kv.comment);
		} else if(data.kv.boardType.indexOf('product') != -1){
			$(".tree-view").find('.normal-board').hide();
			$(".tree-view").find('.product-board').show();
			boardType = stringTable.productBoard;
		}
 		$(".tree-view .tree-view-body .tree-view-line-value #boardtype-input").val(boardType);

 		var checked = false;
 		if(data.kv.writable)
 			checked = true;
 		$(".tree-view .tree-view-line .tree-view-line-value #writable-input").switchButton({
 			checked: checked,
 			on_label: stringTable.writable,
 			off_label: stringTable.notWritable,
 			width: 60,
 			height: 30,
 			button_width: 30,
 			on_callback: function(){
 				variableSettingMenu.currentData.kv.writable = true;
 				$(variableSettingMenu.currentNode).children('.node-data').text(JSON.stringify(variableSettingMenu.currentData));
 			},
 			off_callback: function(){
 				variableSettingMenu.currentData.kv.writable = false;
 				$(variableSettingMenu.currentNode).children('.node-data').text(JSON.stringify(variableSettingMenu.currentData));
 			}
 		});
 		$(".tree-view .tree-view-line .tree-view-line-value #showboard-input").switchButton({
			checked: data.kv.showboard,
			on_label: stringTable.show,
			off_label: stringTable.hide,
			width: 60,
			height: 30,
			button_width: 30,
			on_callback: function(){
				variableSettingMenu.currentData.kv.showboard = true;
				$(variableSettingMenu.currentNode).children('.node-data').text(JSON.stringify(variableSettingMenu.currentData));
			},
			off_callback: function(){
				variableSettingMenu.currentData.kv.showboard = false;
				$(variableSettingMenu.currentNode).children('.node-data').text(JSON.stringify(variableSettingMenu.currentData));
			}
		});
 		if(boardType == stringTable.productBoard){
 			if(data.kv.displayType == 1)
 	 			checked = true;
 	 		else
 	 			checked = false;
 			$(".tree-view .tree-view-line .tree-view-line-value #displaytype-input").switchButton({
 	 			checked: checked,
 	 			on_label: stringTable.use,
 	 			off_label: stringTable.noUse,
 	 			width: 60,
 	 			height: 30,
 	 			button_width: 30,
 	 			on_callback: function(){
 	 				variableSettingMenu.currentData.kv.displayType = 1;
 	 				$(variableSettingMenu.currentNode).children('.node-data').text(JSON.stringify(variableSettingMenu.currentData));
 	 			},
 	 			off_callback: function(){
 	 				variableSettingMenu.currentData.kv.displayType = 0;
 	 				$(variableSettingMenu.currentNode).children('.node-data').text(JSON.stringify(variableSettingMenu.currentData));
 	 			}
 	 		});
 		}
	}
	if(data.contactWidget){
		checked = true;
	}
	else{
		variableSettingMenu.currentData['contactWidget'] = false;
		checked = false;
	}
	$(".tree-view .tree-view-line .tree-view-line-value #contactwidget-input").switchButton({
		checked: checked,
		on_label: stringTable.show,
		off_label: stringTable.hide,
		width: 60,
		height: 30,
		button_width: 30,
		on_callback: function(){
			variableSettingMenu.currentData.contactWidget = true;
			$(variableSettingMenu.currentNode).children('.node-data').text(JSON.stringify(variableSettingMenu.currentData));
		},
		off_callback: function(){
			variableSettingMenu.currentData.contactWidget = false;
			$(variableSettingMenu.currentNode).children('.node-data').text(JSON.stringify(variableSettingMenu.currentData));
		}
	});
	$(".tree-view .tree-view-line .tree-view-line-value #active-input").switchButton({
		checked: data.active,
		on_label: stringTable.show,
		off_label: stringTable.hide,
		width: 60,
		height: 30,
		button_width: 30,
		on_callback: function(){
			variableSettingMenu.currentData.active = true;
			$(variableSettingMenu.currentNode).children('.node-data').text(JSON.stringify(variableSettingMenu.currentData));
			$(variableSettingMenu.currentNode).children('.node-name').removeClass('line-through');
		},
		off_callback: function(){
			variableSettingMenu.currentData.active = false;
			$(variableSettingMenu.currentNode).children('.node-data').text(JSON.stringify(variableSettingMenu.currentData));
			$(variableSettingMenu.currentNode).children('.node-name').addClass('line-through');
		}
	});
	if(data.type == 'chat'){
		$(".tree-view .tree-view-line .tree-view-line-value #show-telephone-input").switchButton({
			checked: data.kv.showTelephone,
			on_label: stringTable.show,
			off_label: stringTable.hide,
			width: 60,
			height: 30,
			button_width: 30,
			on_callback: function(){
				variableSettingMenu.currentData.kv.showTelephone = true;
				$(variableSettingMenu.currentNode).children('.node-data').text(JSON.stringify(variableSettingMenu.currentData));
			},
			off_callback: function(){
				variableSettingMenu.currentData.kv.showTelephone = false;
				$(variableSettingMenu.currentNode).children('.node-data').text(JSON.stringify(variableSettingMenu.currentData));
			}
		});
		$(".tree-view .tree-view-line .tree-view-line-value #chat-text-input").val(data.kv.text);
	}

	if(data.type == 'page' || data.type == 'landing'){

		$(".tree-view .tree-view-body .tree-view-page-mode").hide();
		$(".tree-view .tree-view-line .tree-view-line-value .page-mode-input").removeAttr('checked');
		$(".tree-view .tree-view-line .tree-view-line-value #page-mode-" + data.kv.mode).prop('checked', true);

		$(".tree-view .tree-view-body #html-file-text-input").val(data.kv.htmlFile);
		$(".tree-view .tree-view-body #tree-view-" + data.kv.mode).show();

		$(".tree-view .tree-view-line .tree-view-line-value .page-mode-input").bind('click', function(){
			var val = $(this).val();
			$(".tree-view .tree-view-body .tree-view-page-mode").hide();
			$(".tree-view .tree-view-body #tree-view-" + val).show();
			variableSettingMenu.currentData.kv.mode = val;
			$(variableSettingMenu.currentNode).children('.node-data').text(JSON.stringify(variableSettingMenu.currentData));
		});
	}
}
function add_node(){
	var obj = $(".tree-add .chosen-node");
	if(obj.length == 0)
		return;
	var category = $(obj).prop('id').split('-');
	var className = $(obj).prop('class');
	$("#children-block-0").append($(obj).get(0).outerHTML);
	var addedObj = $("#children-block-0 .node").last()
												.removeClass('add-node')
												.removeClass('chosen-node')
												.addClass('first-depth')
												.addClass('draggable-node');
	var menu = {};
	menu = variableSettingMenu.menu;
	variableSettingMenu.idMax += 1;
	menu.id = variableSettingMenu.idMax;
	menu.type = category[3];
	menu.nodeName = $(addedObj).children('.node-name').text();
	menu.title = menu.nodeName;
	menu.active = true;
	menu.url = '/link' + menu.id;
	menu.code = "";
	if(className.indexOf('parent') != -1){
		menu.node = "parent";
		$(addedObj).prop('id', 'parent-node-' + menu.id);
		var blockHtml = "<div class='node-block first-node-block' id='children-block-"+menu.id+"'></div>";
		$(blockHtml).insertAfter(addedObj);
	} else {
		menu.node = "leaf";
	}
	if(menu.type == 'parent'){
		menu.kv.navigationBox = true;
	} else {
		menu.kv.backgroundImage = '';
		menu.kv.backgroundImageMode = 0;
		menu.kv.backgroundColor = '#ffffff';
	}
	if(menu.type == 'board'){
		menu.kv.boardType = category[4];
		menu.kv.writable = true;
		menu.kv.showboard = true;
		menu.kv.comment = '';
		menu.kv.displayType = 0;
	}
	if(menu.type == 'chat'){
		menu.kv.text = '';
		menu.kv.showTelephone = true;
	}
	if(menu.type == 'hyperlink'){
		menu.url = '';
	}
	if(menu.type == 'page'){
		menu.kv.mode = 'editor';
		menu.kv.htmlFile = '';
		menu.kv.body = '';
		var span = document.createElement('span');
		span.className = 'node-data-body';
		span.style.display = 'none';
		$(addedObj).append(span);
	}
	$(addedObj).children('.node-data').text(JSON.stringify(menu));
	draggable_node_event(addedObj);
	$(addedObj).bind('click', function(e){
		node_click_event(e, $(addedObj));
	});
	if(menu.type == 'parent'){
		$(addedObj).addClass('parent-node-collapse');
		$(addedObj).find('.node-icon-left').bind('mousedown', function(e){
			parent_node_icon_click_event(e, this);
		});
	}
	$(".tree-add .tree-add-button-wrapper .tree-add-cancel").click();

	$(addedObj).attr('data-type', menu.type);
}
function draggable_node_event(obj){
	$(obj).draggable({
		cursor: "pointer",
		zIndex: 10,
		distance: 10,
		start: function(e, u){
			variableSettingMenu.insertCandidateNeighbor = null;
			var className = $(obj).prop('class');
			if(className.indexOf('parent-node') != -1 && className.indexOf('parent-node-expand') != -1){
				var id = $(this).prop('id').split('-')[2];
				$("#children-block-" + id).hide();
				$(this).removeClass('parent-node-expand');
				$(this).addClass('parent-node-collapse');
			}
			$(this).data('data-width', $(this).width());
			$(this).data('data-height', $(this).height());
			$(this).css({
				'width': '100px',
				'height': '20px',
				'font-size': '0px'
			});
			$(this).children('.node-icon-left').hide();
		},
		stop: function(e, u){
			$(this).css({
				'width': $(this).data('data-width') + 'px',
				'height': $(this).data('data-height') + 'px',
				'font-size': '14px'
			});
			$(this).children('.node-icon-left').show();

			var calcDepthUpward = function(obj){
				return $(obj).parent().length;
			}
			if(variableSettingMenu.insertCandidateNeighbor != null){
				var n = variableSettingMenu.insertCandidateNeighbor;
				var nc = null;
				var o = $(this);
				var c = null;
				var nClass = $(n).prop('class');
				var oClass = $(o).prop('class');
				var nDepth = $(n).attr('data-depth');
				var oDepth = $(o).attr('data-depth');

				$(".append-area").remove();
				$(n).removeClass('target-node');
				$(o).removeClass('chosen-node');
				$(o).removeClass(oDepth);
				$(o).addClass(nDepth);

				if(nClass.indexOf('parent-node') != -1){
					var nid = $(n).prop('id').split('-')[2];
					console.log('nid" ' + nid);
					nc = $("#children-block-" + nid);
				}
				if(oClass.indexOf('parent-node') != -1){
					var oid = $(o).prop('id').split('-')[2];
					c = $("#children-block-" + oid);
				}
				if(variableSettingMenu.insertOnBlock && nc == null){
					if( $(n).parent().hasClass('node-block') == true )
						nc = $(n).parent();
				}
				if(variableSettingMenu.insertOnTop){
					$(o).insertBefore(n);
				}
				else{
					if(variableSettingMenu.insertOnBlock){
						if($(nc).children('.node').length == 0)
							$(nc).prepend(o);
						else{
							$(nc).append(o);
						}
					} else {
						if(nc == null)
							$(o).insertAfter(n);
						else
							$(o).insertAfter(nc);
					}
				}
				if(c != null){
					$(c).insertAfter(o);
				}
			}
		},
		revertDuration: 100,
		revert: true
	});
	$(obj).droppable({
		drop: function(e, u){
		},
		over: function(e, u){
			$(this).addClass('target-node');
			var targetTop = $(this).offset().top;
			var objTop = u.offset.top;
			var margin = $(this).css('margin-left');
			var className = $(this).prop('class');
			var parentTarget = (className.indexOf('parent-node') == -1) ? false : true;
			var chosenTarget = (className.indexOf('chosen-node') == -1) ? false : true;
			var parentObj = ($(u.draggable).prop('class').indexOf('parent-node') == -1) ? false : true;
			var forceSibling = false;
			var draggableDepth = 0;
			var affordableDepth = 2;
			if(parentObj){
				var id = $(u.draggable).prop('id').split('-')[2];
				var traverseObj = $("#children-block-" + id);
				$(traverseObj).find('.node').each(function(){
					var d = $(this).parentsUntil(traverseObj).length + 1;
					draggableDepth = (d  > draggableDepth) ? d : draggableDepth;
				});
			}
			var targetDepth = $(this).parentsUntil("#children-block-0").length;

			// not accepting the parent node as third node block's child
			if(parentObj){
				if(targetDepth + draggableDepth >= affordableDepth - 1)
					forceSibling = true;
			} else {
				if(targetDepth + draggableDepth >= affordableDepth)
					forceSibling = true;
			}

			if(forceSibling && parentObj)
				return;

			if(targetTop < objTop) {
				variableSettingMenu.insertOnTop = false;
				if(forceSibling) {
					$("<div class='append-area'></div>").insertAfter(this);
				} else {
					if(parentTarget && chosenTarget){
						var id = $(this).prop('id').split('-')[2];
						variableSettingMenu.insertOnBlock = true;
						$("#children-block-" + id).prepend("<div class='append-area'></div>");
						if(className.indexOf('collapse') != -1){
							$("#children-block-" + id).show();
							$(this).removeClass('parent-node-collapse');
							$(this).addClass('parent-node-expand');
						}
					} else
						$("<div class='append-area'></div>").insertAfter(this);
				}
			} else {
				variableSettingMenu.insertOnBlock = false;
				variableSettingMenu.insertOnTop = true;
				$("<div class='append-area'></div>").insertBefore(this);
			}
			variableSettingMenu.insertCandidateNeighbor = this;
		},
		out: function(e, u){
			variableSettingMenu.insertCandidateNeighbor = null;
			$(".append-area").remove();
			$(this).removeClass('target-node');
		},
		tolerance: 'intersect'
	});
}
function delete_node(obj){
	$(obj).each(function(){
		if($(this).hasClass('home-node') == true)
			return;
		var className = $(this).prop('class');
		if(className.indexOf('parent-node') != -1){
			var id = $(this).prop('id').split('-')[2];
			$("#children-block-" + id).remove();
		}
		$(this).remove();
	});
}
function save(){
	variableSettingMenu.tree = [];
	var data = $(".home-node").children('.node-data').text();
	if(data.length > 0){
		data = JSON.parse(data);
		variableSettingMenu.tree.push(data);
	}
	$(".tree-node .node-block").each(function(){
		var nodeBlockId = $(this).prop('id').split('-')[2];
		nodeBlockId = parseInt(nodeBlockId);

		$(this).children('.node').each(function(){
			var data = $(this).children('.node-data').text();
			data = JSON.parse(data);
			data.parentId = nodeBlockId;
			if(nodeBlockId == 0)
				variableSettingMenu.tree.push(data);
			else{
				traverse_and_push(nodeBlockId, variableSettingMenu.tree, data);
			}
		});
	});
	draw_progress();
	var data = {
		serviceId: serverData.service_id,
		data: variableSettingMenu.tree
	};
	$.ajax({
		url : "/requestreceiver/",
		type : "post",
		data :{
			req_type : "setting_content",
			data: JSON.stringify(data)
		},
		success : function(response){
			remove_progress();
			if(response.result == 'ok'){
				draw_general_popup(
						function(){
							// reconstruct sidebar
							$("#sidebar-nav-board").find('*').remove();

							var boardExist = false;
							var chatExist = false;
							$(".node").each(function(){
								var type = $(this).attr('data-type');
								if(type == 'board')
									boardExist = true;
								if(type == 'chat')
									chatExist = true;
							});
							if(boardExist){
								$(".sidebar-board").show();
							} else {
								$(".sidebar-board").hide();
							}
							if(chatExist){
								$(".sidebar-chat").show();
							} else {
								$(".sidebar-chat").hide();
							}
							$(".node").each(function(){
								var type = $(this).attr('data-type');
								if(type == 'board'){
									var nodeData = JSON.parse($(this).children('.node-data').text());
									var appendHtml = '';
									appendHtml += "<li class='sidebar-nav sidebar-nav-board' data-url='"+nodeData.url+"'>";
									appendHtml += "<span class='unread-count' data-url=''>N</span>"
									appendHtml += nodeData.nodeName;
									appendHtml += "</li>";
									$("#sidebar-nav-board").append(appendHtml);
								}
							});
							$("#sidebar-nav-board .sidebar-nav-board").bind('click', function(){
								var nav = $(this).attr('data-url');
								nav = 'board?url=' + nav;
								location.hash = nav;
							});
						},
						null,
						null,
						stringTable.saveSuccess,
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
function html_upload_done(){
	remove_progress();
	var txt = $("#html-file-upload-target").contents().text();
	var res = '';
	try{
		res = JSON.parse(txt);
	} catch(err){
		$("#html-file-upload-form").submit();
		return;
	}
	if(res.result == 'ok'){
		variableSettingMenu.currentData.kv.htmlFile = res.filename[0]
		$(variableSettingMenu.currentNode).children('.node-data').text(JSON.stringify(variableSettingMenu.currentData));
		$(".tree-view .tree-view-body #html-file-text-input").val(res.filename[0]);
		draw_general_popup(
				null,
				null,
				null,
				stringTable.pageFileUploadDone,
				stringTable.ok,
				null
		);
	} else {
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
function open_background_image_manager(obj){
	var manager = $("#background-image-manager");
	$("#area").prepend("<div id='background-image-manager-masking'></div>");
	$(manager).data('data-input', obj);
	var select = $(manager).children('#background-image-select');
	$(select).children('.background-image-select-option').remove();
	$(select).children('.background-image-select-default').prop('selected', true);
	$(select).off();
	$(".tree-node-wrapper").find('.node').each(function(){
		var type = $(this).attr('data-type');
		if(type.indexOf('landing') != -1 ||
				type.indexOf('page') != -1 ||
				type.indexOf('board') != -1 ||
				type.indexOf('chat') != -1)
		{
			var nodeData = JSON.parse($(this).children('.node-data').text());

			if(nodeData.kv.backgroundImage.length != 0){
				var option = document.createElement('option');
				option.value = nodeData.kv.backgroundImage;
				option.innerHTML = $(this).children('.node-name').text();
				option.className = 'background-image-select-option';
				$(select).append(option);
			}
		}
	});
	$(select).bind('change', function(){
		var val = $(this).val();
		$(obj).val(val);
		$(obj).trigger('change');
		$(manager).fadeOut(150, function(){
			$("#background-image-manager-masking").remove();
		});
	});
	$("#background-image-manager-masking").bind('click', function(){
		$(manager).fadeOut(150, function(){
			$("#background-image-manager-masking").remove();
		});
	});
	$(manager).fadeIn(150);
}
function plugin_init(){
	tinymce.PluginManager.add('component', function(editor, url) {
	    // Add a button that opens a window
	    editor.addButton('component', {
	    	title: stringTable.component,
	    	text: stringTable.component,
	    	type: 'menubutton',
	    	icon:false,
	    	menu: [
	    	    {
	    	    	text: stringTable.componentImage,
	    	    	onclick: function(){
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
	    					$("#body-file-input").click();
	    	    	}
	    	    },
	    	 	{
	    	 		text: stringTable.componentMap,
	    	 		onclick: function(){
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
	    	 			add_googlemap(editor);
	    	 		}
	    	 	},
                {
                    text: stringTable.componentDaumMap,
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
                        add_daummap(editor);
                    }
                },
	    	 	{
	    	 		text: stringTable.componentBox,
	    	 		onclick: function(){
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
	    	 			add_box(editor);
	    	 			invalidate_body_wrapper();
	    	 		}
	    	 	},
	    	 	{
	    	 		text: stringTable.componentTextArea + ' (block)',
	    	 		onclick: function(){
	    	 			add_textarea(editor, true);
	    	 		}
	    	 	},
	    	 	{
	    	 		text: stringTable.componentTextArea + ' (inline)',
	    	 		onclick: function(){
	    	 			add_textarea(editor, false);
	    	 		}
	    	 	},
	    	 	{
	    	 		text: stringTable.componentSlideDocument,
	    	 		onclick: function(){
	    	 			var is_safari = navigator.userAgent.indexOf("Safari") > -1;
	    				if(!is_safari)
	    					$("#slide-file-selector").click();
	    				else
	    					$("#slide-file-input").click();
	    	 		}
	    	 	},
	    	 	{
	    	 		text: stringTable.componentSlidePicture,
	    	 		onclick: function(){
	    	 			var data = {
	    	 				fullScreen: false,
	    	 				autoSlide: 0,
	    	 				file: []
	    	 			};
	    	 			show_picture_slide(data, function(data){
	    	 				add_picture_slide(data);
	    	 			});
	    	 		}
	    	 	},
	    	 	{
	    	 		text: stringTable.componentCombination,
	    	 		onclick: function(){
	    	 			show_component_combination(function(element){
	    	 				add_component(element);
	    		    		invalidate_body_wrapper();
	    	 			});
	    	 		}
	    	 	}
	    	],
	    	onClick: function() {
	    	}
	    });
	});
	tinymce.PluginManager.add('editoraction', function(editor, url) {
		editor.addButton('editoraction', {
	    	title: stringTable.editorAction,
	    	text: stringTable.editorAction,
	    	type: 'menubutton',
	    	icon:false,
	    	menu: [
	    	    {
	    	    	text: stringTable.editorActionCopy,
	    	    	onclick: function(){
	    	    		copy();
	    	    	}
	    	    },
	    	 	{
	    	 		text: stringTable.editorActionPaste,
	    	 		onclick: function(){
	    	 			paste();
	    	 		}
	    	 	},
	    	 	{
	    	 		text: stringTable.editorActionDelete,
	    	 		onclick: function(){
	    	 			if(variableSettingMenu.selected != null){
		    				draw_general_popup(
		    					function(){
		    						if($(variableSettingMenu.selected).hasClass('body-wrapper') == true){
		    				    		var display = $("#info-window").css('display') != 'none' ? true : false;
		    				    		if(display){
		    				    			info_window_close();
		    				    		}
		    						}
		    						tinymce.activeEditor.dom.remove(variableSettingMenu.selected);
		    	    				variableSettingMenu.selected = null;
		    	    				invalidate_body_wrapper();
		    	    				$(".mce-resizehandle").hide();
		    					},
		    					null,
		    					null,
		    					stringTable.deleteSelected,
		    					stringTable.yes,
		    					stringTable.no
		    				);
		    			}
	    	 		}
	    	 	},
	    	 	{
	    	    	text: stringTable.width + ' 240px (25%)',
	    	    	onclick: function(){
	    	    		size_adjust(240);
	    	    		invalidate_body_wrapper();
	    	    	}
	    	    },
	    	 	{
	    	    	text: stringTable.width + ' 480px (50%)',
	    	 		onclick: function(){
	    	 			size_adjust(480);
	    	 			invalidate_body_wrapper();
	    	 		}
	    	 	},
	    	 	{
	    	    	text: stringTable.width + ' 720px (75%)',
	    	 		onclick: function(){
	    	 			size_adjust(720);
	    	 			invalidate_body_wrapper();
	    	 		}
	    	 	},
	    	 	{
	    	    	text: stringTable.width + ' 960px (100%)',
	    	 		onclick: function(){
	    	 			size_adjust(960);
	    	 			invalidate_body_wrapper();
	    	 		}
	    	 	},
	    	 	{
	    	 		text: stringTable.width + ' ' + stringTable.entireWidth,
	    	 		onclick: function(){
	    	 			size_adjust(0);
	    	 			invalidate_body_wrapper();
	    	 		}
	    	 	},
	    	 	{
	    	 		text: stringTable.editorActionTopSpace,
	    	 		onclick: function(){
	    	 			insert_space_at_top();
	    	 			invalidate_body_wrapper();
	    	 		}
	    	 	},
	    	 	{
	    	 		text: stringTable.editorActionBottomSpace,
	    	 		onclick: function(){
	    	 			insert_space_at_bottom();
	    	 			invalidate_body_wrapper();
	    	 		}
	    	 	},
	    	 	{
	    	 		text: stringTable.editorActionBackground,
	    	 		onclick: function(){
	    	 			var target = $("#editor-input");
	    	 			$(target).attr('data-background-image', variableSettingMenu.currentData.kv.backgroundImage);
	    	 			$(target).attr('data-background-image-mode', variableSettingMenu.currentData.kv.backgroundImageMode);
	    	 			info_window_close();
	    				info_window_show(target);
	    	 		}
	    	 	},
	    	 	{
	    	 		text: stringTable.editorActionMapReboot,
	    	 		onclick: function(){
	    	 			reboot_map();
	    	 		}
	    	 	}
	    	],
	    	onClick: function(e) {
	    	}
	    });
	});
	tinymce.PluginManager.add('pagepreview', function(editor, url) {
	    // Add a button that opens a window
		editor.addButton('pagepreview', {
			text: stringTable.preview,
			icon: false,
			onclick: function() {
				$(".center-control-panel").hide();
				wrapping();
				apply_changes();
				preview_page(variableSettingMenu.currentData);
			}
		});
	});
	tinymce.PluginManager.add('attributesetup', function(editor, url){
		editor.addButton('attributesetup', {
			text: stringTable.attributeSetup,
			icon: false,
			onclick: function(){
				attribute_setup();
			}
		});
	});
	tinymce.PluginManager.add('saveeditor', function(editor, url){
		editor.addButton('saveeditor', {
			text: stringTable.save,
			icon: false,
			onclick: function(){
				apply_changes();
				// dashboard trial
				if(serverData.session.length == 0){
					draw_general_popup(
							function(){
								window.location.href = '/signup';
							},
							null,
							null,
							stringTable.trialNotSupported,
							stringTable.yes,
							stringTable.no
					);
					return;
				}
				draw_general_popup(
						function(){
							save();
						},
						null,
						null,
						stringTable.askSave,
						stringTable.yes,
						stringTable.no
				);
			}
		});
	});
	tinymce.PluginManager.add('closeeditor', function(editor, url){
		editor.addButton('closeeditor', {
			text: stringTable.close,
			icon: false,
			onclick: function(){
				$("#editor-input").blur();
    			$("#editor-masking").remove();
	    		$("#editor-input .selected-element").removeClass('selected-element');
	    		$(".center-control-panel").hide();
	    		apply_changes();

	    		$("#editor").fadeOut(250, function(){
	    			$(".dashboard-body").show();
	    		});
			}
		});
	});
}
function editor_init(){
	tinymce.init({
	    selector: "#editor-input",
	    fixed_toolbar_container: "#editor-toolbar",
	    language : "ko_KR",
	    theme: "modern",
	    inline: true,
	    skin: "light",
	    content_css: '/resources/plugins/tinymce_4.6.1/content.css',
	    width: '960px',
        paste_data_images: true,
	    toolbar: [
	              "component editoraction attributesetup pagepreview saveeditor closeeditor",
	              "fontsizeselect fontselect forecolor underline strikethrough bold italic | alignleft aligncenter alignright alignjustify bullist numlist hr | image media link code"
	    ],
	    plugins: 'colorpicker hr image textcolor media autoresize code component pagepreview attributesetup closeeditor editoraction saveeditor link paste',
	    fontsize_formats: "8px 10px 12px 14px 16px 18px 20px 22px 24px 26px 28px 30px 32px 34px 36px 38px 40px 44px 48px 56px 62px 68px 74px 80px",
	    font_formats: "굴림체=GulimChe;" +
	    "바탕체=BatangChe;" +
	    "돋움체=DotumChe;"+
	    "궁서체=GungsuhChe;" +
	    "맑은 고딕=Malgun Gothic;" +
	    "나눔 고딕=Nanum Gothic;" +
	    "나눔 고딕 명조=Nanum Myeongjo;" +
	    "나눔 고딕 코딩=Nanum Gothic Coding;" +
	    "나눔 펜=Nanum Pen Script;" +
	    "나눔 브러쉬=Nanum Brush Script;" +
	    "한나체=Hanna;" +
	    "Andale Mono=andale mono,times;"+
        "Arial=arial,helvetica,sans-serif;"+
        "Arial Black=arial black,avant garde;"+
        "Book Antiqua=book antiqua,palatino;"+
        "Comic Sans MS=comic sans ms,sans-serif;"+
        "Courier New=courier new,courier;"+
        "Georgia=georgia,palatino;"+
        "Helvetica=helvetica;"+
        "Impact=impact,chicago;"+
        "Symbol=symbol;"+
        "Tahoma=tahoma,arial,helvetica,sans-serif;"+
        "Terminal=terminal,monaco;"+
        "Times New Roman=times new roman,times;"+
        "Trebuchet MS=trebuchet ms,geneva;"+
        "Verdana=verdana,geneva;"+
        "Webdings=webdings;"+
        "Wingdings=wingdings,zapf dingbats",
	    relative_urls: false,
	    convert_urls: false,
	    menubar:false,
	    statusbar:false,
	    force_p_newlines : false,
	    forced_root_block : false,
	    setup: function(ed){
	    	ed.on('mousedown', function(e){
	    		var display =  $(".color-setting").css('display') != 'none' ? true : false;
	    		if(display)
	    			color_setting_hide();
	    		display = $("#info-window").css('display') != 'none' ? true : false;
	    		if(display)
	    			info_window_close();

	    		var targ;
	    		if(!e)
	    			var e = window.event;
	    		if(e.target)
	    			targ = e.target;
	    		else if(e.srcElement)
	    			targ = e.srcElement;
	    		if(targ.nodeType == 3)
	    			targ = targ.parentNode;

	    		$("#editor-input .selected-element").removeClass('selected-element');

	    		// conditions
	    		if(_MSIE){
	    			if(targ.tagName == 'SPAN' ||
	    					targ.tagName == 'STRONG' ||
	    					targ.tagName == 'IMG' ||
	    					targ.tagName == 'A' ||
	    					$(targ).hasClass('component-contenteditable') == true){
	    				$(targ).parentsUntil('.body-wrapper').each(function(){
    						tinymce.activeEditor.dom.setAttrib($(this)[0], 'contenteditable', null);
		    			});
	    				var bodyWrapper = $(targ).parents('.body-wrapper');
	    				bodyWrapper = $(bodyWrapper)[0];
	    				tinymce.activeEditor.dom.setAttrib(bodyWrapper, 'contenteditable', null);
	    				tinymce.activeEditor.dom.setAttrib(targ, 'contenteditable', true);
	    			}
	    			if($(targ).hasClass('body-wrapper')){
	    				tinymce.activeEditor.dom.setAttrib(targ, 'contenteditable', true);
	    				$(targ).find('*').each(function(){
	    					tinymce.activeEditor.dom.setAttrib($(this)[0], 'contenteditable', null);
	    				});
	    			}
	    			if($(targ).parents('.google-map-body').length > 0){
	    				targ = $(targ).parents('.googlemap-wrapper').eq(0)[0];
	    			}
	    		}
	    		if($(targ).hasClass('body-wrapper')){
	    			invalidate_body_wrapper();
	    		}
	    		if($(targ).hasClass('editor-input') == true) {
	    			wrapping();
	    			variableSettingMenu.selected = null;
	    			return;
	    		}
	    		if($(targ).hasClass('box-item-td') == true ||
	    				$(targ).hasClass('box-item-inside') == true){
	    			targ = $(targ).parents('table').eq(0)[0];
	    		}
	    		variableSettingMenu.selected = targ;
	    		$(targ).addClass('selected-element');
	    	});
	    	ed.on('focus', function(e){
	    		clearBr();
	    	});
	    	ed.on('change', function(e){
	    	});
	    	ed.on('blur', function(e){
	  	    	e.preventDefault();
				return false;
	    	});
	    	ed.on('mouseup', function(e){
	    		if(_MSIE){
	    			if(e.target.className.indexOf('google-map-body') != -1){
	    				var wrapper = $(e.target).parents('.googlemap-wrapper');
	    				var id = $(wrapper).prop('id');
	    				var w = $(e.target).width();
	    				var h = $(e.target).height();

	    				var wrapperWidth = $(wrapper).width();
	    				var wrapperHeight = $(wrapper).height();

	    				//size changed
	    				if( (wrapperWidth - 5) != w || h != wrapperHeight ){

	    					var table = tinymce.activeEditor.dom.select('#' + id);
				    		var tr = tinymce.activeEditor.dom.select('#' + id + ' tr');
				    		var td = tinymce.activeEditor.dom.select('#' + id + ' td');
				    		tinymce.activeEditor.dom.setAttrib(table, 'width', w);
				    		tinymce.activeEditor.dom.setAttrib(table, 'height', h);
				    		tinymce.activeEditor.dom.setStyle(table, {
								'width': w + 'px',
								'height': h + 'px'
							});
				    		tinymce.activeEditor.dom.setAttrib(td, 'width', w);
				    		tinymce.activeEditor.dom.setAttrib(td, 'height', h);
				    		tinymce.activeEditor.dom.setStyle(td, {
								'width': w + 'px',
								'height': h + 'px'
							});
				    		$(wrapper).attr({
			    				'data-width': w+'px',
			    				'data-height': h+'px'
			    			});
				    		id = id.split('-')[2];
			    			var map = variableSettingMenu.googleMapObject[id];
			    		    google.maps.event.trigger(map,'resize');
	    				}
	    				invalidate_body_wrapper();
		    		}
	    		}
	    	});
	    	ed.on('ObjectResizeStart', function(e) {});
	    	ed.on('ObjectResized', function(e) {
	    		var className = e.target.className;
	    		var id = e.target.id;
	    		if($(e.target).hasClass('component-table') == true){
	    			var td = $(e.target).find('td');
	    			td = $(td).eq(0)[0];
	    			tinyMCE.activeEditor.dom.setStyle(td, {
						'width': $(e.target).width() + 'px'
					});
	    			return;
	    		}
	    		if(e.target.tagName == 'TABLE'){
	    			var w = e.width;
		    		var h = e.height;

		    		var table = tinyMCE.activeEditor.dom.select('#' + e.target.id);
		    		var td = tinyMCE.activeEditor.dom.select('#' + e.target.id + ' td')[0];

					tinyMCE.activeEditor.dom.setAttrib(table, 'width', w);
					tinyMCE.activeEditor.dom.setAttrib(table, 'height', h);
					tinyMCE.activeEditor.dom.setStyle(table, {
						'width': w + 'px',
						'height': h + 'px'
					});
					tinyMCE.activeEditor.dom.setAttrib(td, 'width', w);
					tinyMCE.activeEditor.dom.setAttrib(td, 'height', h);
					tinyMCE.activeEditor.dom.setStyle(td, {
						'width': w + 'px',
						'height': h + 'px'
					});
	    		}
	    		if(className.indexOf('googlemap-wrapper') != -1){
	    			var w = e.width;
		    		var h = e.height;
		    		$(e.target).attr({
	    				'data-width': w+'px',
	    				'data-height': h+'px'
	    			});

	    			var id = e.target.id;
	    			id = id.split('-')[2];
	    			var map = variableSettingMenu.googleMapObject[id];

	    			var w = e.width;
	    			var h = e.height;
	    			$(e.target).find('.google-map-body').css({
	    				'width': w + 'px',
	    				'height': h + 'px'
	    			});
	    		    google.maps.event.trigger(map,'resize');
	    		}
	    		invalidate_body_wrapper();
	    		calc_slide();
	    	});
	    	ed.on('keyDown', function(e){
	    		// TAB
	    		if(e.keyCode == 9){
	                ed.execCommand('mceInsertContent', false, '&emsp;&emsp;');
	    			e.preventDefault();
	    			return false;
	    		}
	    		// ENTER

	    		// BACKSPACE
	    		if(e.keyCode == 8){
	    			var node = tinymce.activeEditor.selection.getNode();
	    			var parentNode = node.parentNode;
	    			var removeBodyWrapper = false;
	    			var prevSibling = node.previousSibling;

	    			if($(parentNode).hasClass('editor-input') && node.childNodes.length <= 1){
	    				if(_MSIE){
	    					if(node.innerHTML == '&nbsp;'){
	    						node.innerHTML = '<br>';
	    						tinymce.activeEditor.selection.setCursorLocation(node, 0);
	    						e.preventDefault();
	    						return false;
	    					}
	    				}
	    				if(node.innerHTML.indexOf('br') != -1)
	    					removeBodyWrapper = true;
	    			}
	    			if(removeBodyWrapper){
	    				try{
    						var tagName = prevSibling.tagName;
    					} catch(err){
    						e.preventDefault();
    	    				return false;
    					}
	    				if($(prevSibling).hasClass('body-wrapper') == true){
	    					$(prevSibling).click();
	    					$(prevSibling).focus();
	    					$(prevSibling).addClass('selected-element');
	    					if(!_MSIE)
	    						tinymce.activeEditor.selection.setCursorLocation(prevSibling, 1);
	    				}
	    				$(node).remove();
	    				invalidate_body_wrapper();
	    				e.preventDefault();
	    				return false;
	    			}
	    		}
	    		// DEL
	    		if(e.keyCode == 46){
	    			if(variableSettingMenu.selected != null){
	    				draw_general_popup(
	    					function(){
	    						if($(variableSettingMenu.selected).hasClass('body-wrapper') == true){
	    				    		var display = $("#info-window").css('display') != 'none' ? true : false;
	    				    		if(display){
	    				    			info_window_close();
	    				    		}
	    						}
	    						tinymce.activeEditor.dom.remove(variableSettingMenu.selected);
	    	    				variableSettingMenu.selected = null;
	    	    				invalidate_body_wrapper();
	    	    				e.preventDefault();
	    	    				return false;
	    					},
	    					null,
	    					null,
	    					stringTable.deleteSelected,
	    					stringTable.yes,
	    					stringTable.no
	    				);
	    				e.preventDefault();
	    				return false;
	    			}
	    		}
    		});
	    	ed.on('paste', function(e){
	    		if(paste() == true){
	    			e.preventDefault();
	    			return false;
	    		} else {
	    			var plainText = '';
	    			var htmlText = '';
	    			 if (window.clipboardData && window.clipboardData.getData) { // IE
	    				 plainText = window.clipboardData.getData('Text');
	    				 plainText = window.clipboardData.getData('Html');
	    			 } else if (e.clipboardData && e.clipboardData.getData) {
	    				 plainText =  e.clipboardData.getData("text/plain");
	    				 htmlText =  e.clipboardData.getData("text/html");
	    			}
	    			draw_general_popup(
    					function(){
    		    		    document.execCommand("insertHTML", false, plainText);
    					},
    					function(){
    		    		    document.execCommand("insertHTML", false, htmlText);
    					},
    					null,
    					stringTable.pasteOnlyText,
    					stringTable.yes,
    					stringTable.no
	    			);
	    			e.preventDefault();
	    			return false;
	    		}
	    	});
	    },
	    init_instance_callback : function(ed) {
	    	var body = ed.getBody();
	    	body.style.outline = '0px';
	    	variableSettingMenu.selected = null;

	    	if(_MSIE)
	    		tinymce.activeEditor.getBody().contentEditable = false;

	    	//drop down menu position error fix
	    	$("#editor-toolbar").bind('click', function(e){
	    		var targ;
	    		if(!e)
	    			var e = window.event;
	    		if(e.target)
	    			targ = e.target;
	    		else if(e.srcElement)
	    			targ = e.srcElement;
	    		if(targ.nodeType == 3)
	    			targ = targ.parentNode;
	    		var p = $(targ).parents('.mce-menubtn');
	    		if($(p).length > 0){
	    			if($(p).hasClass('mce-active')){
	    				setTimeout(function(){
	    					$(".mce-floatpanel").each(function(){
	    						if($(this).offset().left == 0 && $(p).offset().left != 0){
	    							$(this).hide();
	    							return;
	    						}
	    						if($(this).css('display') != 'none' && $(this).css('top') == '0px'){
	    							$(this).css('top', $(p).offset().top + 24 + 'px');
	    						}
	    					});
	    				}, 10);
	    			}
	    		}
	    	});
	    }
	});
}
function body_content_init(){
	tinymce.activeEditor.execCommand("mceRepaint");
	var body = $(variableSettingMenu.currentNode).children('.node-data-body').html();
	tinymce.get('editor-input').setContent(body);
	var obj = tinymce.activeEditor.getBody();
	var attrib = {
		image: '',
		repeat: '',
		size:'',
		position:''
	};
	if(variableSettingMenu.currentData.kv.backgroundImage.length == 0)
		attrib.image = 'none';
	else
		attrib.image = "url('"+variableSettingMenu.backgroundImageFilePreFix + variableSettingMenu.currentData.kv.backgroundImage + "')";

	if(variableSettingMenu.currentData.kv.backgroundImageMode == 0){
		attrib.repeat = 'no-repeat';
		attrib.size = 'cover';
		attrib.position = 'center';
	} else {
		attrib.repeat = 'repeat';
		attrib.size = 'auto';
		attrib.position = 'top left';
	}
	background_set(obj, attrib);

	if(variableSettingMenu.currentData.kv.backgroundColor.length != 0){
		tinymce.activeEditor.dom.setStyle(obj,{
			'background-color': variableSettingMenu.currentData.kv.backgroundColor
		});
	}

	$(".body-content").each(function(){
		$(this).contents().unwrap();
	});

	$(tinymce.activeEditor.dom.select('.slide-wrapper')).each(function(){
		var id = $(this).prop('id');
		var slider = tinymce.activeEditor.dom.select('#' + id);
		var newId = (variableSettingMenu.sliderIdx++);
		newId = 'slide-wrapper-' + newId;
		tinymce.activeEditor.dom.setAttrib(slider, 'id', newId);
		tinymce.activeEditor.dom.setAttrib(slider, 'contenteditable', false);
		tinymce.activeEditor.dom.setAttrib(slider, 'data-click-ts', '0');
		add_slide_click_event(slider);
	});

	$(tinymce.activeEditor.dom.select('.box-item')).each(function(){
		var table = $(this)[0];
		var id = $(this).prop('id');
		var td = tinymce.activeEditor.dom.select('#' + id + ' td');

		var h = tinymce.activeEditor.dom.getStyle(table, 'height', false);
		var w = tinymce.activeEditor.dom.getStyle(table, 'width', false);

		try{
			h = h.split('px')[0];
			w = w.split('px')[0];
		} catch(err){
			return false;
		}

		tinymce.activeEditor.dom.setAttrib(table, 'width', w);
		tinymce.activeEditor.dom.setAttrib(table, 'height', h);
		tinymce.activeEditor.dom.setAttrib(td, 'height', h);
		tinymce.activeEditor.dom.setAttrib(td, 'width', w);
	});

	variableSettingMenu.googleMapObject = {};
	variableSettingMenu.googleMapIdx = 0;

	variableSettingMenu.daumMapObject = {};
	variableSettingMenu.daumMapIdx = 0;

	$(".lazy-loading").each(function(){
		var src = $(this).attr('data-original');
		$(this).attr('src', src);
	});

	$(tinymce.activeEditor.dom.select('.body-wrapper')).each(function(){
		$(this).attr('contenteditable', true);
		$(this).find('.component-contenteditable').attr('contenteditable', true);
	});
	var length = $(obj).children('.body-wrapper').length;
	if(length <= 1){
		var subLength = $(obj).children('.body-wrapper').find('*').length;
		if(subLength == 0){
 			var div = insert_space_at_top();
			$(div).click();
			$(div).focus();
			$(".selected-element").removeClass('selected-element');
			$(div).addClass('selected-element');
			variableSettingMenu.selected = div;
		}
	}
	wrapping();
	invalidate_body_wrapper();
}
function background_set(obj, attrib){
	$(obj).css({
		'background-image': attrib.image,
		'background-repeat': attrib.repeat,
		'background-size': attrib.size,
		'background-position': attrib.position,
	});
	tinymce.activeEditor.dom.setStyle(obj,{
		'background-image': attrib.image,
		'background-repeat': attrib.repeat,
		'background-size': attrib.size,
		'background-position': attrib.position,
	});
	if(attrib.repeat == 'no-repeat' && attrib.image != ''){
		tinymce.activeEditor.dom.addClass(obj, 'background-image-no-repeat');
	} else {
		tinymce.activeEditor.dom.removeClass(obj, 'background-image-no-repeat');
	}
}
function attribute_set(obj, attrib){
	if(attrib.status.BACKGROUND){
		tinymce.activeEditor.dom.setStyle(obj, 'background-color', attrib.background);
	}
	if(attrib.status.BACKGROUND_TRANSPARENCY){
		var backgroundColor = $(obj).css('background-color');
		if(backgroundColor.indexOf('#') != -1) {
    		r = parseInt(backgroundColor[1] + backgroundColor[2], 16);
    		g = parseInt(backgroundColor[3] + backgroundColor[4], 16);
    		b = parseInt(backgroundColor[5] + backgroundColor[6], 16);
	    	if(r < 10)
	    		r = '0' + r;
    		if(g < 10)
	    		g = '0' + g;
    		if(b < 10)
	    		b = '0' + b;
    	} else if (backgroundColor.indexOf('rgb') != -1){
    		backgroundColor = backgroundColor.split('(')[1];
    		backgroundColor = backgroundColor.split(')')[0];
    		backgroundColor = backgroundColor.split(',');
    		r = backgroundColor[0];
    		g = backgroundColor[1];
    		b = backgroundColor[2];
    	}
		var a = attrib.backgroundTransparency;
		a = a * 0.01;
		var background = 'rgba(' + r + ', ' + g + ', ' + b + ', ' + a + ')';

		var backgroundImage = $(obj).data('data-background-image');

		if(attrib.background == 'transparent' || attrib.backgroundTransparency == 100){
			tinymce.activeEditor.dom.removeClass(obj, 'background-transparency');
			tinymce.activeEditor.dom.setAttrib(obj, 'data-background-transparency', null);
		} else {9
			tinymce.activeEditor.dom.setStyle(obj, 'background', background);
			tinymce.activeEditor.dom.addClass(obj, 'background-transparency');
			tinymce.activeEditor.dom.setAttrib(obj, 'data-background-transparency', background);
		}
	}
	if(attrib.status.FONT_COLOR){
		tinymce.activeEditor.dom.setStyle(obj, 'color', attrib.color);
	}
	if(attrib.status.PLACEHOLDER){
		if(attrib.placeholder.length == 0)
			tinymce.activeEditor.dom.setAttrib(obj, 'placeholder', null);
		else
			tinymce.activeEditor.dom.setAttrib(obj, 'placeholder', attrib.placeholder);
	}
	if(attrib.status.HYPERLINK){
		if(attrib.hyperlink.length == 0){
			tinymce.activeEditor.dom.setAttrib(obj, 'data-hyperlink', null);
			tinymce.activeEditor.dom.removeClass(obj, 'hyperlink-added');
		} else {
			tinymce.activeEditor.dom.setAttrib(obj, 'data-hyperlink', attrib.hyperlink);
			tinymce.activeEditor.dom.addClass(obj, 'hyperlink-added');
		}
		if(attrib.hyperlinkTarget.length == 0){
			tinymce.activeEditor.dom.setAttrib(obj, 'data-hyperlink-target', null);
		} else {
			tinymce.activeEditor.dom.setAttrib(obj, 'data-hyperlink-target', attrib.hyperlinkTarget);
		}
	}
	if(attrib.status.BORDER){
		if(attrib.border.length == 0){
			tinymce.activeEditor.dom.removeClass(obj, 'custom-border');
			tinymce.activeEditor.dom.setStyle(obj, 'border-color', 'initial');
			tinymce.activeEditor.dom.setStyle(obj, 'border', 'none');
		} else {
			tinymce.activeEditor.dom.addClass(obj, 'custom-border');
			tinymce.activeEditor.dom.setStyle(obj, 'border-color', attrib.border);
		}
	}
	if(attrib.status.HOVER){
		if(attrib.hoverBackground.length == 0 && attrib.hoverText.length == 0){
			tinymce.activeEditor.dom.removeClass(obj, 'hover-added');
			tinymce.activeEditor.dom.setAttrib(obj, 'data-hover-background', null);
			tinymce.activeEditor.dom.setAttrib(obj, 'data-hover-text', null);
		} else {
			tinymce.activeEditor.dom.addClass(obj, 'hover-added');
			if(attrib.hoverBackground.length != 0){
				tinymce.activeEditor.dom.setAttrib(obj, 'data-hover-background', attrib.hoverBackground);
			}
			if(attrib.hoverText.length != 0){
				tinymce.activeEditor.dom.setAttrib(obj, 'data-hover-text', attrib.hoverText);
			}
		}
	}
	if(attrib.status.MARGIN){
		var display = $(obj).css('display');
		if(attrib.margin != $(obj).css('margin'))
			tinymce.activeEditor.dom.setStyle(obj, 'margin', attrib.margin);
		if(display == 'inline' && attrib.margin !== '0px 0px 0px 0px'){
			tinymce.activeEditor.dom.setStyle(obj, 'display', 'inline-block');
			tinymce.activeEditor.dom.addClass(obj, 'inline-block-fallback');
		}
	}
	if(attrib.status.LAZY_LOADING){
		if(attrib.lazyLoading){
			tinymce.activeEditor.dom.addClass(obj, 'lazy-loading');
			tinymce.activeEditor.dom.setAttrib(obj, 'data-original', $(obj).prop('src'));
		} else {
			tinymce.activeEditor.dom.removeClass(obj, 'lazy-loading');
			tinymce.activeEditor.dom.setAttrib(obj, 'data-original', null);
		}
	}
	if(attrib.status.MOBILE_SHOW){
		if(attrib.mobileShow){
			tinymce.activeEditor.dom.removeClass(obj, 'mobile-hide');
		} else {
			tinymce.activeEditor.dom.addClass(obj, 'mobile-hide');
		}
	}
	if(attrib.status.MOBILE_MAX_WIDTH){
		var mobileMaxWidth = attrib.mobileMaxWidth;
		for(var i = 0; i <= 100; i++){
			tinymce.activeEditor.dom.removeClass(obj, 'mobile-width-' + i);
		}
		if(mobileMaxWidth == '--') {
			tinymce.activeEditor.dom.removeClass(obj, 'mobile-width');
			tinymce.activeEditor.dom.setAttrib(obj, 'data-mobile-width', null);
		} else {
			tinymce.activeEditor.dom.addClass(obj, 'mobile-width-' + mobileMaxWidth.split('%')[0]);
			tinymce.activeEditor.dom.addClass(obj, 'mobile-width');
			tinymce.activeEditor.dom.setAttrib(obj, 'data-mobile-width', mobileMaxWidth);
		}
	}
	if(attrib.status.MOBILE_FONT_SIZE){
		var mobileFontSize = attrib.mobileFontSize;
		if(mobileFontSize == '--'){
			tinymce.activeEditor.dom.removeClass(obj, 'mobile-fontsize');
			tinymce.activeEditor.dom.setAttrib(obj, 'data-mobile-fontsize', null);
		} else{
			tinymce.activeEditor.dom.addClass(obj, 'mobile-fontsize');
			tinymce.activeEditor.dom.setAttrib(obj, 'data-mobile-fontsize', mobileFontSize);
		}
	}
}
function attribute_setup(){
	try{
		var pass = true;
		if($(variableSettingMenu.selected).hasClass('googlemap') == true)
			pass = false;
		else if($(variableSettingMenu.selected).hasClass('slide-wrapper') == true){
			pre_show_picture_slide(variableSettingMenu.selected);
			return;
		} else if(variableSettingMenu.selected == null){
			pass = false;
		}
		if(!pass)
			throw "not support";

	} catch(err){
		draw_general_popup(
				null,
				null,
				null,
				stringTable.notSupportedComponent,
				stringTable.ok,
				null
		);
		return;
	}

	var param = {
		selected: variableSettingMenu.selected,
		hyperlink: [],
		callback: function(data){
			try{

			} catch(err){}
		}
	};
	if($(variableSettingMenu.selected).hasClass('editor-input') == true){
		param.backgroundImage = variableSettingMenu.currentData.kv.backgroundImage;
		param.backgroundImageMode = parseInt(variableSettingMenu.currentData.kv.backgroundImageMode);
	}
	if($(variableSettingMenu.selected).hasClass('body-wrapper') == true){
		var backgroundImage = $(variableSettingMenu.selected).attr('data-background-image');
		var backgroundImageMode = $(variableSettingMenu.selected).attr('data-background-image-mode');

		if(typeof backgroundImage === 'undefined')
			backgroundImage = '';
		if(typeof backgroundImageMode === 'undefined')
			backgroundImageMode = 0;
		else
			backgroundImageMode = parseInt(backgroundImageMode);

		param.backgroundImage = backgroundImage;
		param.backgroundImageMode = backgroundImageMode;
	}

	$(".node").each(function(){
		if($(this).hasClass('add-node') == true ||
				$(this).hasClass('parent-node') == true ||
				$(this).hasClass('leaf-node-scrollpoint') == true){
			return;
		}
		var nodeData = JSON.parse($(this).children('.node-data').text());
		param.hyperlink.push(nodeData.url);
	});
	color_setting_show(param);
}
function add_box(ed){
	var occupied = [];
	$(tinyMCE.activeEditor.dom.select('.box-item')).each(function(){
		try{
			var id = $(this).prop('id');
			id = id.split('-')[2];
			id = parseInt(id);
			occupied.push(id);
		} catch(err){return;}
	});
	while(true){
		var found = false;
		for(i = 0; i < occupied.length; i++){
			if(variableSettingMenu.boxIdx == occupied[i])
				found = true;
		}
		if(found == true)
			variableSettingMenu.boxIdx += 1;
		else
			break;
	}
	var table = document.createElement('table');
	var tbody = document.createElement('tbody');
	var tr = document.createElement('tr');
	var td = document.createElement('td');
    $(table).css({
    	'display': 'inline-block',
    	'overflow': 'hidden',
    	'text-align': 'inherit',
    	'border-collapse': 'collapse'
    });
    table.className = 'box-item';
    var tableId = 'box-item-' + variableSettingMenu.boxIdx;
    table.id = tableId;

    $(table).addClass('dashed-border');
    $(table).addClass('inline-block-fallback');
    $(table).attr('cellspacing', '0');
    $(table).attr('cellpadding', '0');
    $(table).attr({
    	'width': '160',
    	'height': '160'
    });
    $(tr).prop('class', 'box-item-tr');
    $(td).prop('class', 'box-item-td');
    $(td).css({
    	'width': '100%',
    	'height': '100%',
    	'vertical-align': 'top'
    });
    $(td).attr({
    	'width': '160',
    	'height': '160'
    });
    $(tr).append(td);
    $(tbody).append(tr);
    $(table).append(tbody);
	var div = tinymce.activeEditor.dom.create('div', {'class': 'box-item-inside'});
    tinymce.activeEditor.dom.setStyle(div, {
    	'display': 'inline-block',
    	'min-height': '18px',
    	'width': '100%',
    	'height': '100%'
     });
	tinymce.activeEditor.dom.add(td, div);
	var range = tinymce.activeEditor.selection.getRng();
	range.insertNode(table);
	move_scroll_to(table);
}
function add_textarea(editor, block){
	var div =  document.createElement('div');
	$(div).addClass('dashed-border');
	$(div).addClass('component-contenteditable');
	div.innerHTML = '';
	if(!block){
		$(div).css('display', 'inline-block');
		$(div).addClass('inline-block-fallback');
	} else {
		$(div).css('display', 'block');
		$(div).css('width', '100%');
	}
	var range = tinymce.activeEditor.selection.getRng();
	range.insertNode(div);
}
function add_googlemap(editor){
	var option = {
		zoom: 6,
		center: {lat: 36.11, lng: 127.68},
		streetViewControl: false
	};
	var gmap = {};
	gmap = create_googlemap(480, 320, option, null);
	var range = tinymce.activeEditor.selection.getRng();
	range.insertNode(gmap.mapElement);
	google.maps.event.trigger(gmap.mapObject,'resize');
	move_scroll_to(gmap.mapElement);
}
function create_googlemap(w, h, option, marker){
	var occupied = [];
	$(tinyMCE.activeEditor.dom.select('.googlemap-wrapper')).each(function(){
		var id = $(this).prop('id');
		id = id.split('-')[2];
		id = parseInt(id);
		occupied.push(id);
	});
	while(true){
		var found = false;
		for(i = 0; i < occupied.length; i++){
			if(variableSettingMenu.googleMapIdx == occupied[i])
				found = true;
		}
		if(found == true)
			variableSettingMenu.googleMapIdx += 1;
		else
			break;
	}
	var parentNode = document.createElement('table');
	var googleMapNode = document.createElement('div');
	var map = new google.maps.Map(googleMapNode, option);
	var objIdx = variableSettingMenu.googleMapIdx + '';

	map.set('idx', objIdx);
	$(googleMapNode).css({
		'width': w + 'px',
		'height': h + 'px'
	});
	$(parentNode).css({
		'width': w + 'px',
		'height': h + 'px',
		'display': 'inline-block',
		'padding': '0',
		'text-align':'center',
		'cursor': 'pointer'
	});
	parentNode.className = 'googlemap-wrapper';
	parentNode.id = 'googlemap-wrapper-' + map.get('idx');
	googleMapNode.className = 'google-map-body';

	var markerText = marker == null ? '' : JSON.stringify(marker);

	$(parentNode).attr({
		'data-width': w + 'px',
		'data-height': h + 'px',
		'data-center': JSON.stringify(option.center),
		'data-zoom': option.zoom,
		'data-marker': markerText
	});
	$(googleMapNode).attr('contenteditable', false);

	var tr = document.createElement('tr');
	var td = document.createElement('td');

    $(tr).prop('class', 'box-item-tr');
    $(td).attr({'width': w});
    $(td).attr({'height': h});
    $(td).css({'position': 'relative'});
    $(td).prop('class', 'box-item-td');
    $(td).css('outline', '1px dashed #ccccbc');
	$(tr).append(td);
	$(td).append(googleMapNode);

	$(parentNode).append(tr);

	$(parentNode).find('*').each(function(){
		$(this).attr('contenteditable', false);
	});
	$(googleMapNode).find('*').each(function(){
		$(this).attr('contenteditable', false);
	});

	variableSettingMenu.googleMapObject[objIdx] = map;

	google.maps.event.addListener(variableSettingMenu.googleMapObject[objIdx], 'click', function(e){
		var position = {
			lat: e.latLng.lat(),
			lng: e.latLng.lng()
		};
		var listener = true;
		if (typeof variableSettingMenu.googleMapMarker[objIdx] !== 'undefined'){
			variableSettingMenu.googleMapMarker[objIdx].setMap(null);
			listener = false;
		}
		variableSettingMenu.googleMapMarker[objIdx] = new google.maps.Marker({
			position: position,
			map: map
		});
		variableSettingMenu.googleMapMarker[objIdx].setMap(map);

		google.maps.event.addListener(variableSettingMenu.googleMapMarker[objIdx], 'click', function() {
			variableSettingMenu.googleMapMarker[objIdx].setMap(null);
		});

		var id = map.get('idx');
		id = "googlemap-wrapper-" + id;
		var table = tinymce.activeEditor.dom.select('#' + id);
		var data = JSON.stringify(variableSettingMenu.googleMapMarker[objIdx].position);
		try{
			var pos = variableSettingMenu.googleMapMarker[objIdx].position;
			var lat, lng = '';
			if(typeof pos['A'] !== 'undefined')
				lat = pos['A']
			if(typeof pos['F'] !== 'undefined')
				lng = pos['F'];
			var d = JSON.parse(data);
			d.lat = lat;
			d.lng = lng;
			data = JSON.stringify(d);
		}catch(err){}

		tinymce.activeEditor.dom.setAttrib(table, 'data-marker', data);
		$("#" + id).attr('data-marker', data);
	});
	google.maps.event.addListener(variableSettingMenu.googleMapObject[objIdx], 'zoom_changed', function(){
		var id = map.get('idx');
		id = "googlemap-wrapper-" + id;
		var data =  map.getZoom();
		var table = tinymce.activeEditor.dom.select('#' + id);
		tinymce.activeEditor.dom.setAttrib(table, 'data-zoom', data);
		$("#" + id).attr('data-zoom', data);
	});
	google.maps.event.addListener(variableSettingMenu.googleMapObject[objIdx], 'center_changed', function(){
		var id = map.get('idx');
		id = "googlemap-wrapper-" + id;
		var centerObj = map.getCenter();
		var data = JSON.stringify(centerObj);
		try{
			var lat, lng = '';
			if(typeof centerObj['A'] !== 'undefined')
				lat = centerObj['A']
			if(typeof centerObj['F'] !== 'undefined')
				lng = centerObj['F'];
			var d = JSON.parse(data);
			d.lat = lat;
			d.lng = lng;
			data = JSON.stringify(d);
		}catch(err){}
		var table = tinymce.activeEditor.dom.select('#' + id);
		tinymce.activeEditor.dom.setAttrib(table, 'data-center', data);
		$("#" + id).attr('data-center', data);
	});
	if(marker != null){
		variableSettingMenu.googleMapMarker[objIdx] = new google.maps.Marker({
			position: {
				lat: marker.lat,
				lng: marker.lng
			}
		});
		variableSettingMenu.googleMapMarker[objIdx].setMap(variableSettingMenu.googleMapObject[objIdx]);
	}
	var rtn = {
		'mapElement': parentNode,
		'mapObject': variableSettingMenu.googleMapObject[objIdx]
	};
	return rtn;
}
function add_daummap(editor) {
    var div = document.createElement('div');
    var options = {
        level: 3,
        center: new daum.maps.LatLng(36.11, 127.68)
    };
    var map = new daum.maps.Map(div, options);
    var range = tinymce.activeEditor.selection.getRng();
    range.insertNode(div);
}
function add_component(element){
	var googlemap = false;
	if(element.className.indexOf('component-wrapper-contact') != -1){
		$(element).find('.contact-info-googlemap').children('img').remove();
		var option = {
			zoom: 6,
			center: {lat: 36.11, lng: 127.68},
			streetViewControl: false
		};
		var gmap = {};
		gmap = create_googlemap(400, 280, option, null);
		$(element).find('.contact-info-googlemap').append(gmap.mapElement);
		$(element).find('.contact-info-googlemap').find('div').css({
			'border': '0'
		});
		googlemap = true;
	}
	var parentNode = tinymce.activeEditor.selection.getNode().parentNode;
	if(parentNode.id == 'editor-input'){	// insert current position
		var range = tinymce.activeEditor.selection.getRng();
		range.insertNode(element);
	} else {	// append to the bottom
		tinymce.activeEditor.dom.add(tinymce.activeEditor.getBody(), element);
	}
	if(googlemap)
		google.maps.event.trigger(gmap.mapObject,'resize');
	move_scroll_to(element);
	$(element).find('*').each(function(){
		if($(this).hasClass('component-contenteditable') == true){
			$(this).attr('contenteditable', true);
			tinymce.activeEditor.dom.setAttrib($(this)[0], 'contenteditable', true);
		}
	});
}
function add_picture_slide(data){
	if(data.file.length == 0)
		return;

	var elem = tinymce.activeEditor.dom.create('div');
	$(elem).addClass('slide-wrapper');
	$(elem).addClass('picture-slide-wrapper');
	$(elem).attr('contenteditable', false);
	var id = 'slide-wrapper-' + (variableSettingMenu.sliderIdx++);
	$(elem).prop('id', id);
	$(elem).attr('data-slide-list', data.file.toString());
	$(elem).attr('data-slide-fullscreen', data.fullScreen);
	$(elem).attr('data-slide-autoslide', data.autoSlide);

	var chopped = data.file[0].split('_');
	var w = parseInt(chopped[1]);
	var h = parseInt(chopped[2].split('.')[0]);

	$(elem).css({
		'border': '0',
		'display': 'inline-block',
		'width': '100%',
		'margin-left': 'auto',
		'margin-right': 'auto',
		'background-color': '#D6D6D6',
		'background-image': "url('/resources/images/slideshow_icon.png')",
		'background-repeat': 'no-repeat',
		'background-position': 'center',
		'cursor': 'pointer'
	});
	elem.innerHTML = '<br>';
	var range = tinymce.activeEditor.selection.getRng();
	range.insertNode(elem);
	move_scroll_to(elem);
	var parent = $(elem).parents('.body-wrapper').eq(0)[0];
	if(data.fullScreen)
		tinymce.activeEditor.dom.addClass(parent, 'entire-width');

	var parentElem = $(elem).parent();
	var parentWidth = $(elem).parent().innerWidth();
	var parentHeight = $(elem).parent().innerHeight();
	var height = 0;
	if($(parentElem).hasClass('body-wrapper') == true){
		height = h * 960 / w;
		$(elem).css('height', height);
	} else {
		calc_slide();
	}
	add_slide_click_event(elem);
	apply_changes();
	move_scroll_to(elem);
}
function data_receiver_settingcontent(msg){
	try{
		var test = msg.type;
		test = msg.data.status;
	}catch(err){
		return;
	}
	if(msg.type == 'slideprocess-done' && msg.data.status == 'success'){
		close_general_popup_in_force();
		draw_general_popup(
				null,
				null,
				null,
				stringTable.slideDone,
				stringTable.ok,
				null
		);
		var slidePicture = [];
		for(var i = 0 ; i < msg.data.slidePicture.length; i++)
			slidePicture.push(msg.data.slidePicture[i]);
		var elem = document.createElement('div');
		var id = 'slide-wrapper-' + (variableSettingMenu.sliderIdx++);
		$(elem).prop('id', id);
		$(elem).addClass('slide-wrapper');
		$(elem).addClass('page-slide-wrapper');

		$(elem).attr('data-slide-list', msg.data.slidePicture.toString());
		$(elem).attr('contenteditable', false);
		$(elem).css({
			'border': '0',
			'width': '960px',
			'height': '600px',
			'margin-left': 'auto',
			'margin-right': 'auto',
			'background-color': '#D5D5D5',
			'background-image': "url('/resources/images/slide.png')",
			'background-repeat': 'no-repeat',
			'background-position': 'center',
			'cursor': 'pointer'
		});
		var div = insert_space_at_bottom();
		tinymce.activeEditor.dom.add($(div)[0], elem);
		add_slide_click_event(elem);
		apply_changes();
		move_scroll_to(elem);
	}
	if(msg.data.status == 'fail'){
		setTimeout(function(){
			close_general_popup_in_force();
			draw_general_popup(
					null,
					null,
					null,
					stringTable.slideFailed,
					stringTable.ok,
					null
			);
		}, 1000);
	}
}
function preview_page(data){
	draw_progress();
	var tree = [];

	var homeData = $(".home-node").children('.node-data').text();
	homeData = JSON.parse(homeData);
	tree.push(homeData);

	$(".tree-node .node-block").each(function(){
		var nodeBlockId = $(this).prop('id').split('-')[2];
		nodeBlockId = parseInt(nodeBlockId);

		$(this).children('.node').each(function(){
			var nodeData = $(this).children('.node-data').text();
			nodeData = JSON.parse(nodeData);
			nodeData.parentId = nodeBlockId;
			if(nodeBlockId == 0)
				tree.push(nodeData);
			else{
				traverse_and_push(nodeBlockId, tree, nodeData);
			}
		});
	});

	var d = {
		misc: null,
		node: data,
		tree: tree,
		session: serverData.session
	};

	$.ajax({
		url : "/requestreceiver/",
		type : "post",
		data :{
			req_type : "preview_page",
			data: JSON.stringify(d)
		},
		success : function(response){
			remove_progress();
			if(response.result == 'ok'){
				var url = response.url;
				var iframe = document.createElement('iframe');
				iframe.src = url;
				iframe.style.width = '100%';
				iframe.style.height = $("#editor-preview").height() + 'px';
				iframe.style.border = '0';
				$("#editor-preview").fadeIn(250, function(){
					$(".editor-preview-body .editor-preview-data-wrapper").append(iframe);
					$(".editor-preview-selector .editor-preview-selector-desktop").addClass('editor-preview-selected');
				});
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
function add_slide_click_event(slideObj){
	$(slideObj).bind('click', function(){
		var now = new Date().getTime();
		var ts = $(this).attr('data-click-ts');
		if(ts === '0'){
			$(this).attr('data-click-ts', now);
			return;
		}
		var s = (now - parseInt(ts));
		if (s < 200){
			$(this).attr('data-click-ts', '0');
			pre_show_picture_slide(this);
		} else {
			$(this).attr('data-click-ts', now);
		}
	});
}
function pre_show_picture_slide(obj){
	var id = $(obj).prop('id');
	var slideList = $(obj).attr('data-slide-list');
	slideList = slideList.split(',');
	var fullScreen = $(obj).attr('data-slide-fullscreen');
	var autoSlide = $(obj).attr('data-slide-autoslide');

	if (typeof fullScreen === 'undefined') {
		fullScreen = null;
	} else {
		if(fullScreen == 'true')
			fullScreen = true;
		else
			fullScreen = false;
	}
	if($(obj).hasClass('page-slide-wrapper') == true){
		 autoSlide = null;
	} else {
		if(typeof autoSlide === 'undefined'){
			autoSlide = 0;
		} else {
			autoSlide = parseInt(autoSlide);
		}
	}
	var data = {
		fullScreen: fullScreen,
		autoSlide: autoSlide,
		file: slideList
	};
	show_picture_slide(data, function(data){
		var div = tinymce.activeEditor.dom.select('#' + id);
		if(data.file.length == 0){
			tinymce.activeEditor.dom.remove(div);
			return;
		}
		tinymce.activeEditor.dom.setAttrib(div, 'data-slide-list', data.file.toString());
		if(data.fullScreen != null){
			var chopped = data.file[0].split('_');
			var w = parseInt(chopped[1]);
			var h = parseInt(chopped[2].split('.')[0]);
			var height = 960 * h / w;
			tinymce.activeEditor.dom.setAttrib(div, 'data-slide-fullscreen', data.fullScreen);
			tinymce.activeEditor.dom.setStyle(div, {
				'height': height + 'px'
			});
		}
		if(data.autoSlide != null){
			tinymce.activeEditor.dom.setAttrib(div, 'data-slide-autoslide', data.autoSlide);
		}
	});
}
function wrapping(){
	variableSettingMenu.doingWrapping = true;
	var elem = tinymce.activeEditor.dom.getRoot().firstChild;
	while(elem){
		var className = elem.className;
		var next = elem.nextSibling;
		if(typeof className === 'undefined' || $(elem).hasClass('body-wrapper') == false){
			$(elem).wrap("<div class='body-wrapper' contenteditable='true'/>");
		}
		elem = next;
	}
	variableSettingMenu.doingWrapping = false;
}
function clearBr(){
	var elem = tinymce.activeEditor.dom.getRoot().firstChild;
	while(elem){
		var className = elem.className;
		var next = elem.nextSibling;
		try{
			if(elem.tagName == 'BR')
				tinymce.activeEditor.dom.remove(elem);
		} catch(err){}
		elem = next;
	}
}
/* EDITOR ADDITIONAL PLUGIN ACTIONS */
function copy(){
	try{
		if(variableSettingMenu.selected == null)
			throw "not support";
	} catch(err){
		draw_general_popup(
				null,
				null,
				null,
				stringTable.notSupportedComponent,
				stringTable.ok,
				null
		);
		return false;
	}
	variableSettingMenu.copied = variableSettingMenu.selected.cloneNode(true);
	if($(variableSettingMenu.copied).hasClass('.box-item') == true){
		var id_list = variableSettingMenu.copied.id.split('-');
		var id = id_list.pop();
		id = parseInt(id) * 11;
		if(id == 0)
			id =  11;
		id_list.push(id);
		var newId = id_list.join('-');
		variableSettingMenu.copied.id = newId;
	}
	show_editor_message(stringTable.copied);
	return true;
}
function paste(){
	if(typeof variableSettingMenu.copied === 'undefined') {
		return false;
	}
	try{
		var range = tinymce.activeEditor.selection.getRng();                  	  // get range
		range.insertNode(variableSettingMenu.copied);
		show_editor_message(stringTable.pasteDone);
		delete variableSettingMenu['copied'];
		return true;
	} catch(err){
		return false;
	}
}
function insert_space_at_bottom(){
	var div = document.createElement('div');
	div.className = 'body-wrapper';
	div.innerHTML = '';
	var body = tinymce.activeEditor.getBody();
	$(div).attr('contenteditable', true);
	$(body).append(div);
	return div;
}
function insert_space_at_top(){
	var div = document.createElement('div');
	div.className = 'body-wrapper';
	div.innerHTML = '';
	var body = tinymce.activeEditor.getBody();
	$(div).attr('contenteditable', true);
	$(body).prepend(div);
	return div;
}
function reboot_map(){
	var googlemapWrapper = $(".googlemap-wrapper");
	if($(googlemapWrapper).length == 0){
		draw_general_popup(
				null,
				null,
				null,
				stringTable.notSupportedComponent,
				stringTable.ok,
				null
		);
		return;
	}
	$(googlemapWrapper).each(function(){
		var w = $(this).attr('data-width').split('px')[0];
		var h = $(this).attr('data-height').split('px')[0];

		var center = JSON.parse($(this).attr('data-center'));
		var zoom = parseInt($(this).attr('data-zoom'));
		var marker = $(this).attr('data-marker');
		if(marker.length != 0){
			marker = JSON.parse(marker);
		} else {
			marker = null;
		}
		if(typeof center.lat !== 'undefined'){
			center.k = center.lat;
			center.B = center.lng;
		} else{
			center.k = center.k;
			var key = '';
			for(k in center){
				if(k != 'k')
					key = k;
			}
			center.B = center[key];
		}
		if(marker != null){
			if(typeof marker.lat === 'undefined'){
				marker.lat = marker.k;
				var key = '';
				for(k in marker){
					if(k != 'k' && k != 'lat')
						key = k;
				}
				marker.lng = marker[key];
			}
			marker.lat = parseFloat(marker.lat);
			marker.lng = parseFloat(marker.lng);
		}
		var mapOptions = {
			zoom: zoom,
			center: {
				lat: parseFloat(center.k),
				lng: parseFloat(center.B)
			}
		};

		var gmap = {};
		gmap = create_googlemap(w, h, mapOptions, marker);

		$(gmap.mapElement).attr('data-width', w + 'px');
		$(gmap.mapElement).attr('data-height', h + 'px');
		$(gmap.mapElement).attr('data-center', JSON.stringify(center));
		$(gmap.mapElement).attr('data-zoom', zoom);
		$(gmap.mapElement).attr('marker', $(this).attr('data-marker'));
		$(gmap.mapElement).attr('contenteditable', false);

		if($(this).hasClass('entire-width') == true)
			$(gmap.mapElement).addClass('entire-width');

		tinymce.activeEditor.dom.replace(gmap.mapElement, this);

		window.setTimeout(function(){
			google.maps.event.trigger(gmap.mapObject,'resize');
		}, 250);
	});
}
function size_adjust(size){
	var entire = false;
	try {
		var pass = true;
		if(variableSettingMenu.selected.className.indexOf('body-wrapper') != -1 ||
				variableSettingMenu.selected.className.indexOf('slide-wrapper') != -1){
			pass = false;
		}
		if(size == 0) {
			pass = false;
			if($(variableSettingMenu.selected).hasClass('googlemap-wrapper') == true || variableSettingMenu.selected.tagName == 'IMG'){
				if( $(variableSettingMenu.selected).parent().hasClass('body-wrapper') == true ) {
					pass = true
				}
			}
			entire = true;
			size = 960;
		}
		if(!pass){
			throw "not pass";
		}

	} catch(err){
		draw_general_popup(
				null,
				null,
				null,
				stringTable.notSupportedComponent,
				stringTable.ok,
				null
		);
		return false;
	}

	if(variableSettingMenu.selected.tagName == 'TABLE'){
		var table = variableSettingMenu.selected;
		var td = tinyMCE.activeEditor.dom.select('#' + table.id + ' td');
		tinymce.activeEditor.dom.setAttrib(table, 'width', size + 'px');
		tinymce.activeEditor.dom.setStyle(table, {
			'width': size + 'px'
		});
		tinymce.activeEditor.dom.setAttrib(td, 'width', size);
		tinymce.activeEditor.dom.setStyle(td, {
			'width': size + 'px'
		});
		if( $(variableSettingMenu.selected).hasClass('googlemap-wrapper') == true){
			$(variableSettingMenu.selected).attr({
				'data-width': size + 'px'
			});

			var id = variableSettingMenu.selected.id;
			id = id.split('-')[2];
			var map = variableSettingMenu.googleMapObject[id];

			$(variableSettingMenu.selected).find('.google-map-body').css({
				'width': size + 'px'
			});
		    google.maps.event.trigger(map,'resize');
		}
	}
	else{
		tinymce.activeEditor.dom.setStyle(variableSettingMenu.selected, {
			'width': size + 'px'
		});
	}
	if(entire){
		tinymce.activeEditor.dom.setStyle(variableSettingMenu.selected, {
			'width': '100%'
		});
		var parent = null;
		parent = $(variableSettingMenu.selected).parents('.body-wrapper');
		tinymce.activeEditor.dom.addClass(variableSettingMenu.selected, 'entire-width');
		tinymce.activeEditor.dom.addClass(parent, 'entire-width');
		invalidate_body_wrapper();
	}
	if(size == 960 && $(variableSettingMenu.selected).hasClass('contact-form')){
		tinymce.activeEditor.dom.setStyle(variableSettingMenu.selected, {
			'margin-left': '0px',
			'margin-right': '0px',
			'width': '100%'
		});
	}
	$(".mce-resizehandle").hide();
	calc_slide();
}
function invalidate_body_wrapper(){
	if(typeof variableSettingMenu.invalidateTimerRunning === 'undefined')
		variableSettingMenu.invalidateTimerRunning = false;
	var core = function(){
		$(".body-wrapper-sideicon").remove();
		var body = tinymce.activeEditor.getBody();
		var compensate = parseInt($(".editor-input-wrapper").css('padding-top').split('px')[0]);
		$(body).children('.body-wrapper').each(function(){
			if($(this).height() < 1){
				$(this).remove();
				return;
			}
			var info = document.createElement('i');
			info.className = 'body-wrapper-info';
			$(info).addClass('body-wrapper-sideicon');
			var top = $(this).position().top + compensate + 'px';
			info.style.top = top;
			$(".editor-input-wrapper").append(info);

			if($(this).hasClass('scrollpoint') == true){
				var scrollpoint = document.createElement('i');
				scrollpoint.className = 'body-wrapper-scrollpoint';
				$(scrollpoint).addClass('body-wrapper-sideicon');
				scrollpoint.style.top = top;
				$(scrollpoint).bind('click', function(){
					$(info).click();
				});
				$(".editor-input-wrapper").append(scrollpoint);
			}
			if($(this).hasClass('entire-width') == true){
				var fullscreen = document.createElement('i');
				fullscreen.className = 'body-wrapper-fullscreen';
				$(fullscreen).addClass('body-wrapper-sideicon');
				fullscreen.style.top = top;
				$(fullscreen).bind('click', function(){
					$(info).click();
				});
				$(".editor-input-wrapper").append(fullscreen);
			}
		});
		$(".body-wrapper-info").bind('click', function(){
			$(".selected-element").removeClass('selected-element');
			var idx = $(".body-wrapper-info").index(this);
			var target = $(body).children('.body-wrapper').eq(idx)[0];
			variableSettingMenu.selected = target;
			$(target).addClass('selected-element');
			info_window_close();
			info_window_show(target);
		});
		variableSettingMenu.invalidateTimerRunning = false;
	};
	if(variableSettingMenu.invalidateTimerRunning == false){
		variableSettingMenu.invalidateTimerRunning = true;
		variableSettingMenu.invalidateTimer = setTimeout(function(){
			core();
		}, 100);
	} else {
		clearTimeout(variableSettingMenu.invalidateTimer);
		variableSettingMenu.invalidateTimer = setTimeout(function(){
			core();
		}, 100);
	}
}
function calc_slide(){
	$(".picture-slide-wrapper").each(function(){
		if($(this).parents('.box-item').length == 0)
			return;
		try{
			var box = $(this).parents('.box-item')[0];
			var ph = $(box).innerHeight();
			$(this).css('height', ph);
		}catch(err){
			return;
		}
	});
}
function move_scroll_to(addedElement){
	return;
	/* no use */
	var offset =  $(addedElement).offset();
	var paddingTop = parseInt($(".editor-input-wrapper").css('padding-top').split('px')[0]);
	var elementPosition = offset.top - paddingTop;
	var scrollHeight = document.getElementById('editor').scrollHeight;
	var location = elementPosition;
	if(elementPosition > scrollHeight)
		location = scrollHeight;
	else if(elementPosition < paddingTop)
		location = paddingTop;
	$("#editor").animate({
		scrollTop: location
	}, 300);
}
function apply_changes(){
	tinymce.activeEditor.dom.removeClass(tinyMCE.activeEditor.dom.select('.selected-element'), 'selected-element');
	$(".body-content").each(function(){
		$(this).contents().unwrap();
	});
	$(".body-wrapper").each(function(idx){
		var className = 'body-content';
		if($(this).hasClass('no-padding-required'))
			className += ' no-padding';
		if($(this).hasClass('zero-font-size'))
			className += ' zero-font-size';
		$($(this).hasClass('body-content-padding'))
			className += ' body-content-padding';
		$(this).wrapInner("<div class='"+className+"'>");
		$(this).removeClass('padding-top');
	});
	$(".body-content").find('.googlemap-wrapper').each(function(){
		if($(this).width() >= 960){
			var bodyContent = $(this).parents('.body-content').eq(0);
			$(bodyContent).addClass('no-padding');
		}
	});
	$(".body-content").find('.component-wrapper').each(function(){
		var bodyContent = $(this).parents('.body-content').eq(0);
		$(bodyContent).addClass('no-padding');
	});
	$(".body-content").find('.slide-wrapper').each(function(){
		var bodyContent = $(this).parents('.body-content').eq(0);
		$(bodyContent).addClass('no-padding');
	});
	$(".lazy-loading").each(function(){
		$(this).removeAttr('src');
	});

	var bodyWrapperTop = tinyMCE.activeEditor.dom.select('.body-wrapper')[0];
	try{
		var backgroundImage = $(bodyWrapperTop).attr('data-background-image');
		if(backgroundImage.length != 0 && $(bodyWrapperTop).hasClass('entire-width') == true){
			tinymce.activeEditor.dom.addClass(bodyWrapperTop, 'padding-top');
			$(bodyWrapperTop).addClass('padding-top');
		} else {
			throw "err";
		}
	} catch (err){
		tinymce.activeEditor.dom.removeClass(bodyWrapperTop, 'padding-top');
		$(bodyWrapperTop).removeClass('padding-top');
	}
	variableSettingMenu.currentData.kv.body = '' + tinymce.activeEditor.getContent();
	$(variableSettingMenu.currentNode).children('.node-data').text(JSON.stringify(variableSettingMenu.currentData));
	$(variableSettingMenu.currentNode).children('.node-data-body').html(variableSettingMenu.currentData.kv.body);
	$(".lazy-loading").each(function(){
		var src = $(this).attr('data-original');
		$(this).attr('src', src);
	});
	$(".body-content").each(function(){
		$(this).contents().unwrap();
	});
}