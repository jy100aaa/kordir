$(function(){
	update_keyword();
	$(".setting-misc-control .setting-misc-save").bind('click', function(){
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
	$(".setting-misc-control .setting-misc-preview").bind('click', function(){
		preview_page();
	});
	$(".setting-misc-box .input-line #meta-keyword-input").bind('keyup', function(e){
		if(e.keyCode == 13){
			add_keyword();
		}
	});
	$(".setting-misc-box .input-line #header-backgroundcolor-input").ColorPicker({
		onShow: function(obj){
			var display = $(".viewport-check").css('display');
			if(display !== 'none')
				$(obj).css('left', '0');
		},
		onSubmit: function(hsb, hex, rgb, el) {
		},
		onBeforeShow: function () {
			$(this).ColorPickerSetColor(this.value);
		},
		onChange: function (hsb, hex, rgb) {
			var code = '#' + hex;
			variableSettingMisc.misc.header.backgroundColor = code;
			$(".setting-misc-box .input-line #header-backgroundcolor-input").val(code);

			var r = 0;
	    	var g = 0;
	    	var b = 0;
	    	var a = parseInt(variableSettingMisc.misc.header.opacity) * 0.01;
	    	r = parseInt(code[1] + code[2], 16);
    		g = parseInt(code[3] + code[4], 16);
    		b = parseInt(code[5] + code[6], 16);

	    	if(r < 10)
	    		r = '0' + r;
    		if(g < 10)
	    		g = '0' + g;
    		if(b < 10)
	    		b = '0' + b;

	    	var background = 'rgba(' + r + ', ' + g + ', ' + b + ', ' + a + ')';
	    	variableSettingMisc.misc.header.rgba = background;
			$("#box-header-footer .header-sample-box .header-sample").css({
				'backgroundColor': code,
				'background': background
			});
		},
		livePreview: false
	});

	var backgroundOpacity = 0;
	try{
		backgroundOpacity = parseInt(variableSettingMisc.misc.header.opacity);
	}catch(err){backgroundOpacity = 100;}

	$(".setting-misc-box .input-line #opacity-slider").slider({
	    range: "min",
	    min: 0,
	    max: 100,
	    value: backgroundOpacity,
	    step: 1,
	    slide: function( event, ui ) {
	    	variableSettingMisc.misc.header.opacity = ui.value;
	    	$(".setting-misc-box .input-line #opacity-value").text(ui.value);
	    	var header = $("#box-header-footer .header-sample-box .header-sample");
	    	var backgroundColor = $(header).css('background-color');
	    	var r = 0;
	    	var g = 0;
	    	var b = 0;
	    	var a = ui.value * 0.01;
	    	if(backgroundColor.indexOf('#') != -1){
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
	    	backgroundColor = 'rgba(' + r + ', ' + g + ', ' + b + ', ' + a + ')';
	    	$("#box-header-footer .header-sample-box .header-sample").css({
	    		'background': backgroundColor
	    	});
	    	variableSettingMisc.misc.header.rgba = backgroundColor;
	    }
	});

	if(variableSettingMisc.misc.header.rgba.indexOf('rgba') != -1){
		$("#box-header-footer .header-sample-box .header-sample").css({
    		'background': variableSettingMisc.misc.header.rgba
    	});
	}

	$(".setting-misc-box .input-line #header-fontcolor-input").ColorPicker({
		onShow: function(obj){
			var display = $(".viewport-check").css('display');
			if(display !== 'none')
				$(obj).css('left', '0');
		},
		onSubmit: function(hsb, hex, rgb, el) {
		},
		onBeforeShow: function () {
			$(this).ColorPickerSetColor(this.value);
		},
		onChange: function (hsb, hex, rgb) {
			var code = '#' + hex;
			variableSettingMisc.misc.header.fontColor = code;
			$(".setting-misc-box .input-line #header-fontcolor-input").val(code);
			$("#box-header-footer .header-sample-box .header-sample").css({
				'color': code
			});
			$("#box-header-footer .header-sample-box .header-sample .header-sample-right .hamburger-icon").css({
				'background-color': code
			});
		},
		livePreview: false
	});
	$(".setting-misc-box .input-line #header-highlight-input").ColorPicker({
		onShow: function(obj){
			var display = $(".viewport-check").css('display');
			if(display !== 'none')
				$(obj).css('left', '0');
		},
		onSubmit: function(hsb, hex, rgb, el) {
		},
		onBeforeShow: function () {
			$(this).ColorPickerSetColor(this.value);
		},
		onChange: function (hsb, hex, rgb) {
			var code = '#' + hex;
			variableSettingMisc.misc.header.highlight = code;
			$(".setting-misc-box .input-line #header-highlight-input").val(code);
			$("#box-header-footer .header-sample-box .header-sample .header-sample-right .menu").css({
				'border-bottom': '4px solid ' + code
			});
		},
		livePreview: false
	});

	$(".setting-misc-box .input-line #header-togglemenu-backgroundcolor-input").ColorPicker({
		onShow: function(obj){
			var display = $(".viewport-check").css('display');
			if(display !== 'none')
				$(obj).css('left', '0');
		},
		onSubmit: function(hsb, hex, rgb, el) {
		},
		onBeforeShow: function () {
			$(this).ColorPickerSetColor(this.value);
		},
		onChange: function (hsb, hex, rgb) {
			var code = '#' + hex;
			variableSettingMisc.misc.header.toggleMenuBackgroundColor = code;
			$(".setting-misc-box .input-line #header-togglemenu-backgroundcolor-input").val(code);
			$("#box-header-footer .header-sample-box .toggle-menu-wrapper .toggle-menu").css({
				'background-color': code
			});
		},
		livePreview: false
	});

	$(".setting-misc-box .input-line #header-togglemenu-fontcolor-input").ColorPicker({
		onShow: function(obj){
			var display = $(".viewport-check").css('display');
			if(display !== 'none')
				$(obj).css('left', '0');
		},
		onSubmit: function(hsb, hex, rgb, el) {
		},
		onBeforeShow: function () {
			$(this).ColorPickerSetColor(this.value);
		},
		onChange: function (hsb, hex, rgb) {
			var code = '#' + hex;
			var code = '#' + hex;
			variableSettingMisc.misc.header.toggleMenuFontColor = code;
			$(".setting-misc-box .input-line #header-togglemenu-fontcolor-input").val(code);
			$("#box-header-footer .header-sample-box .toggle-menu-wrapper .toggle-menu").css({
				'color': code
			});
		},
		livePreview: false
	});

	$(".setting-misc-box .input-line #footer-backgroundcolor-input").ColorPicker({
		onShow: function(obj){
			var display = $(".viewport-check").css('display');
			if(display !== 'none')
				$(obj).css('left', '0');
		},
		onSubmit: function(hsb, hex, rgb, el) {
		},
		onBeforeShow: function () {
			$(this).ColorPickerSetColor(this.value);
		},
		onChange: function (hsb, hex, rgb) {
			var code = '#' + hex;
			variableSettingMisc.misc.footer.backgroundColor = code;
			$(".setting-misc-box .input-line #footer-backgroundcolor-input").val(code);
			$(".setting-misc-box #footer-color-sample-box").css({
				'background-color': code
			});
		},
		livePreview: false
	});
	$(".setting-misc-box .input-line #footer-fontcolor-input").ColorPicker({
		onShow: function(obj){
			var display = $(".viewport-check").css('display');
			if(display !== 'none')
				$(obj).css('left', '0');
		},
		onSubmit: function(hsb, hex, rgb, el) {
		},
		onBeforeShow: function () {
			$(this).ColorPickerSetColor(this.value);
		},
		onChange: function (hsb, hex, rgb) {
			var code = '#' + hex;
			variableSettingMisc.misc.footer.fontColor = code;
			$(".setting-misc-box .input-line #footer-fontcolor-input").val(code);
			$(".setting-misc-box #footer-color-sample-box").css({
				'color': code
			});
		},
		livePreview: false
	});

	$(".setting-misc-box .input-line .footer-align-input").bind('click', function(){
		$(this).parent().find("input[type='radio']").each(function(){
			$(this)[0].checked = false;
		});
		$(this)[0].checked = true;
		variableSettingMisc.misc.footer.align = $(this).val();
		$("#footer-color-sample-box").css('text-align', $(this).val());
	});

	$("#file-upload-form #file-input").bind('change', function(){
		document.getElementById("file-upload-target").onload = file_upload_done;
		$(this).parent().attr('target', 'file-upload-target');

		var ext = $(this).val().split(".").pop();
		try{
			size = this.files[0].size / 1024;
		} catch(err){
			// oldie fallback -> believe the size is small and evaluate in serverside later
			size = 0;
		}
		if(file_validation('image', ext, size, 10240) == false)
			return;
		var uuid = generate_uuid();
		$(this).parent().children('.uuid').val(uuid);
		draw_progress();
		$(this).parent().submit();
	});

	$(".setting-misc-box .input-line #logo-upload-button").bind('click', function(){
		$("#file-upload-form #file-type").val('SERVICE_LOGO');
		//$("#file-upload-form #file-input").click();
	});

	$(".setting-misc-box .input-line #logo-delete-button").bind('click', function(){
		variableSettingMisc.misc.header.logo = '';
		$("#input-line-logo #logo-image").prop('src', variableSettingMisc.serviceLogoEmpty);
		$("#box-header-footer .header-sample-box .header-sample .header-company-name img").hide();
		$("#box-header-footer .header-sample-box .header-sample .header-company-name span").show();
	});

	$(".setting-misc-box .input-line #favicon-upload-button").bind('click', function(){
		$("#file-upload-form #file-type").val('FAVICON');
	});
	$(".setting-misc-box .input-line #favicon-delete-button").bind('click', function(){
		variableSettingMisc.misc.meta.favicon = '';
		$("#input-line-favicon #favicon-image").prop('src', variableSettingMisc.faviconEmpty);
	});

	// text
	$(".setting-misc-box .input-line #footer-text-input").bind('change', function(){
		variableSettingMisc.misc.footer.text = $(this).val();
	});
	$(".setting-misc-box .input-line #meta-sitetitle-input").bind('change', function(){
		variableSettingMisc.misc.meta.siteTitle = $(this).val();
	});
	$(".setting-misc-box .input-line #meta-description-input").bind('change', function(){
		variableSettingMisc.misc.meta.description = $(this).val();
	});
	$(".setting-misc-box .input-line #meta-robots-input").bind('change', function(){
		variableSettingMisc.misc.meta.robots = $(this).val();
	});
	$(".setting-misc-box .input-line #meta-sitemap-input").bind('change', function(){
		variableSettingMisc.misc.meta.sitemap = $(this).val();
	});
    $(".setting-misc-box .input-line #meta-code-input").bind('change', function(){
        variableSettingMisc.misc.meta.code = $(this).val();
    });
	$(".input-line #settings-code-input").bind('change', function(){
		variableSettingMisc.misc.settings.code = $(this).val();
	});
    $("#header-togglemenu-font-input").bind('click', function(e) {
        var $vs = $("#input-line-header-font .vertical-selection");
        if ($vs.css('display') === 'none') {
            $vs.show();
        } else {
            $vs.hide();
        }
    });
    $("#input-line-header-font .vertical-selection-item").bind('click', function(){
        var val = $(this).data('value');
        $(".header-sample-box").removeClass('bold');
        $(".header-sample-box").removeClass('font-hanna');
        $(".header-sample-box").removeClass('font-nanum-pen');
        $(".header-sample-box").addClass(val);
        variableSettingMisc.misc.header.font = val;
        var $input = $("#header-togglemenu-font-input");
        if (val === '') {
            $input.val('기본');
        } else if (val === 'bold') {
            $input.val('기본 (볼드)');
        } else if (val === 'font-hanna') {
            $input.val('한나체');
        } else if (val === 'font-hanna bold') {
            $input.val('한나체 (볼드)');
        } else if (val === 'font-nanum-pen') {
            $input.val('나눔펜');
        } else if (val === 'font-nanum-pen bold') {
            $input.val('나눔펜 (볼드)');
        }
        $("#input-line-header-font .vertical-selection").hide();
    });
    $("#box-header-footer").bind('click', function(e){
        if (e.target.id === 'input-line-header-font') {
            $("#input-line-header-font .vertical-selection").hide();
        }
    });
});
function file_upload_done(){
	remove_progress();
	var response = $("#file-upload-target").contents().text();
	var res = null;
	var success = true;
	try{
		res = JSON.parse(response);
	} catch(err) {
		success = false;
		return;
	}
	if(res.result !== 'ok')
		success = false;
	if(!success){
		draw_general_popup(
				null,
				null,
				null,
				stringTable.wrongFileType,
				stringTable.ok,
				null
		);
	}
	var filename = res.filename[0];
	if(res.file_type == "FAVICON"){
		variableSettingMisc.misc.meta.favicon = filename;
		var src = variableSettingMisc.faviconFilePrefix + filename + '.png';
		$("#input-line-favicon #favicon-image").prop('src', src);
	}
	if(res.file_type == "SERVICE_LOGO"){
		variableSettingMisc.misc.header.logo = filename;
		var src = variableSettingMisc.serviceLogoFilePrefix + filename;
		$("#input-line-logo #logo-image").prop('src', src);
		$("#box-header-footer .header-sample-box .header-sample .header-company-name img").prop('src', src);
		$("#box-header-footer .header-sample-box .header-sample .header-company-name img").show();
		$("#box-header-footer .header-sample-box .header-sample .header-company-name span").hide();
	}
}
function add_keyword(){
	var val = $(".setting-misc-box .input-line #meta-keyword-input").val();
	if(val.length == 0){
		return;
	}
	val = val.replace(',', '');

	for(var i = 0; i < variableSettingMisc.misc.meta.keyword.length; i++){
		if(variableSettingMisc.misc.meta.keyword[i] == val){
			draw_general_popup(
					null,
					null,
					null,
					stringTable.duplicateKeyword,
					stringTable.ok,
					null
			);
			return;
		}
	}
	$(".keyword-box").children('p').hide();
	$(".setting-misc-box .input-line #meta-keyword-input").val('');

	variableSettingMisc.misc.meta.keyword.push(val);

	var span = document.createElement('span');
	$(span).text(val);
	$(span).bind('click', function(){
		remove_keyword(this);
	});
	$(".keyword-box").append(span);
}
function remove_keyword(obj){
	var val = $(obj).text();
	var idx = -1;
	for(var i = 0; i < variableSettingMisc.misc.meta.keyword.length; i++){
		if(val == variableSettingMisc.misc.meta.keyword[i]){
			idx = i;
			break;
		}
	}
	if(idx != -1) {
		variableSettingMisc.misc.meta.keyword.splice(idx, 1);
		$(obj).fadeOut(150);
	}
	if(variableSettingMisc.misc.meta.keyword.length == 0){
		setTimeout(function(){
			$(".keyword-box").children('p').fadeIn(250);
		}, 150);
	}
}
function update_keyword(){
	var boxObj = $(".keyword-box");
	$(boxObj).children('p').hide();
	$(boxObj).children('span').remove();

	if(variableSettingMisc.misc.meta.keyword.length == 0)
	{
		$(".keyword-box").children('p').fadeIn(250);
		return;
	}
	for(var i = 0 ; i < variableSettingMisc.misc.meta.keyword.length; i++){
		var span = document.createElement('span');
		$(span).text(variableSettingMisc.misc.meta.keyword[i]);
		$(span).bind('click', function(){
			remove_keyword(this);
		});
		$(".keyword-box").append(span);
	}
}
function preview_page(){
	draw_progress();

	var data = {
		node: null,
		misc: variableSettingMisc.misc,
		tree: null,
		session: serverData.session
	};

	$.ajax({
		url : "/requestreceiver/",
		type : "post",
		data :{
			req_type : "preview_page",
			data: JSON.stringify(data)
		},
		success : function(response){
			remove_progress();
			if(response.result == 'ok'){
				var url = response.url;
				variableSettingMisc.popupTimeoutCallback = function(){
					close_general_popup_in_force();
					clearTimeout(variableSettingMisc.popupTimer);
				};
				var str = stringTable.pageDataTransmitted.format('60', url, 'variableSettingMisc.popupTimeoutCallback();');

				variableSettingMisc.popupTimeout = 60;
				variableSettingMisc.popupTimer = window.setInterval(function(){
					variableSettingMisc.popupTimeout -= 1;

					if(variableSettingMisc.popupTimeout > 0){
						$("#popup-timeout").text(variableSettingMisc.popupTimeout);
					}
					else{
						clearTimeout(variableSettingMisc.popupTimer);
						close_general_popup_in_force();
					}
				}, 1000);
				draw_general_popup(
						null,
						null,
						null,
						str,
						null,
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
function save(){
	draw_progress();

	var data = {
		serviceId: serverData.service_id,
		data: variableSettingMisc.misc
	};

	$.ajax({
		url : "/requestreceiver/",
		type : "post",
		data :{
			req_type : "setting_misc",
			data: JSON.stringify(data)
		},
		success : function(response){
			remove_progress();
			if(response.result == 'ok'){
				draw_general_popup(
						null,
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