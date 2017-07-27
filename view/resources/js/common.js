var CONSTANTS = {
	USER_STATUS: {
		FILLINFO: 0x0010,
		EMAIL: 0x0001
	}
};
function createXMLHTTPObject() {
	try {
        return new XMLHttpRequest();
    }catch(e){}
    try {
        return new ActiveXObject("Msxml3.XMLHTTP");
    }catch(e){}
    try {
        return new ActiveXObject("Msxml2.XMLHTTP.6.0");
    }catch(e){}
    try {
        return new ActiveXObject("Msxml2.XMLHTTP.3.0");
    }catch(e){}
    try {
        return new ActiveXObject("Msxml2.XMLHTTP");
    }catch(e){}
    try {
        return new ActiveXObject("Microsoft.XMLHTTP");
    }catch(e){}
    return null;
}
function get_min_max(array){
	var r = {
		min: array[0],
		max: array[0]
	};
	for(var i = 0; i < array.length; i++){
		if(array[i] < r.min)
			r.min = array[i];
		if(array[i] > r.max)
			r.max = array[i];
	}
	return r;
}
function validate_email(email)
{
	var mailformat = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
	if(email.match(mailformat))
		return true;
	else
		return false;
}
function get_clicked_property(e, prop)
{
	var targ;
	if(!e)
		var e = window.event;
	if(e.target)
		targ = e.target;
	else if(e.srcElement)
		targ = e.srcElement;
	if(targ.nodeType == 3)
		targ = targ.parentNode;

	return $(targ).prop(prop);
}
function draw_upload_progress_popup(xhr, interval, uuid, initStr, successStr, okStr, cancelStr, successcbf, cancelcbf, successDestroy){
	var htmlStr = "<div id='general-popup-panel' class='border-shadow'>";
	htmlStr += "<div class='general-popup-wrapper'>";
	htmlStr += "<div class='general-popup-head'></div>";
	htmlStr += "<div class='general-popup-msg black-font'>";
		htmlStr += "<div class='general-popup-text'></div>";
		htmlStr += "<div class='progress-bar-wrapper'><span class='progress-bar'></span></div>";
		htmlStr += "<div class='progress-number-wrapper'><span class='progress-number'>0</span>%</div>";
	htmlStr += "</div>";
	htmlStr += "<div class='general-popup-button-wrapper'>";
	htmlStr += "<button class='general-popup-button btn' data-progress='ongoing'></button>";
	htmlStr += "</div>";
	htmlStr += "</div>";
	htmlStr += "</div>";

	$('body').prepend("<div id='masking'></div>");
	$("body").prepend(htmlStr);
	var buttonObj = $(".general-popup-button-wrapper .general-popup-button");
	var bar = $(".general-popup-wrapper .general-popup-msg .progress-bar-wrapper .progress-bar");
	var number = $(".general-popup-wrapper .general-popup-msg .progress-number-wrapper .progress-number");

	if(initStr != null)
		$(".general-popup-wrapper .general-popup-msg .general-popup-text").prepend(initStr);

	$(buttonObj).text(cancelStr);
	$(buttonObj).bind('click', function(){
		$('#masking').remove();
		$("#general-popup-panel").remove();
		window.clearTimeout(interval);
		interval = null;
		var progress = $(this).attr('data-progress');
		if(progress == 'ongoing'){
			if(xhr != null)
				xhr.abort();
			if(cancelcbf != null){
				cancelcbf();
				$('#masking').remove();
				$("#general-popup-panel").remove();
			}
		} else {
			if(successcbf != null){
				successcbf();
			}
			$('#masking').remove();
			$("#general-popup-panel").remove();
		}
	});

	interval = window.setInterval(function(){

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
					$(bar).css('width', percentage + '%');
					percentage = parseInt(percentage);
					$(number).text(percentage);
				}
				if(res.state == 'done')
				{
					$(bar).css('width', '100%');
					$(number).text('100');
					$(buttonObj).attr('data-progress', 'done');
					$(".general-popup-wrapper .general-popup-msg .general-popup-text").html(successStr);

					$(buttonObj).text(okStr);
					$(".progress-bar-wrapper").remove();
					$(".progress-number-wrapper").remove();

					if(successDestroy){
						if(successcbf != null){
							$('#masking').remove();
							$("#general-popup-panel").remove();
							successcbf();
						}
					}
					window.clearTimeout(interval);
				}
			},
			error:function(){
				window.clearInterval(interval);
			}
		});


	}, 1000);
}
function draw_progress(){
	$('body').prepend("<div id='masking-progress'></div>");
	$("#masking-progress").append("<img src='http://kordir.com/resources/images/progress_white_background.gif' style='width:32px; height:32px; border:0px; position:fixed; left:50%; top:50%; margin-left:-16px; margin-top:-16px;'>");
}
function remove_progress(){
	$("#masking-progress").remove();
}
function draw_general_popup(cbf1, cbf2, titleStr, msgStr, buttonStr1, buttonStr2){
	var oldIE = false;
    if ($('html').is('.ie6, .ie7')) {
        oldIE = true;
    }
	$('body').prepend("<div id='masking'></div>");
	if(!oldIE){
		$("body").prepend(
				"<div id='general-popup-panel' class='border-shadow'>" +
				"<div class='general-popup-wrapper'>" +
				"<div class='general-popup-head'><span class='title'>" + (titleStr ? titleStr : '') + "</span></div>"+
				"<div class='general-popup-msg black-font'></div>"+
				"<div class='general-popup-button-wrapper'>" +
				"<button class='general-popup-button btn'></button>" +
				"<button class='general-popup-button btn'></button>" +
				"</div>" +
				"</div>" +
				"</div>"
		);
	} else {
		$("body").prepend(
				"<div id='general-popup-panel' class='border-shadow'>" +
				"<div class='general-popup-wrapper'>" +
                "<div class='general-popup-head'><span class='title'>" + (titleStr ? titleStr : '') + "</span></div>"+
				"<table height='165'><tbody><tr><td class='general-popup-msg black-font'></td></tr></tbody></table>" +
				"<div class='general-popup-button-wrapper'>" +
				"<button class='general-popup-button btn'></button>" +
				"<button class='general-popup-button btn'></button>" +
				"</div>" +
				"</div>" +
				"</div>"
		);
	}
	if(msgStr != null)
		$(".general-popup-wrapper .general-popup-msg").html(msgStr);

	var buttonObj = $(".general-popup-button-wrapper .general-popup-button");

	if(buttonStr1 != null)
		$(buttonObj[0]).text(buttonStr1);
	else
		$(buttonObj[0]).css('display', 'none');

	if(buttonStr2 != null)
		$(buttonObj[1]).text(buttonStr2);
	else
		$(buttonObj[1]).css('display', 'none');

	$(buttonObj[0]).bind('click', function(){
		$('#masking').remove();
		$("#general-popup-panel").remove();
		if(cbf1 != null)
			cbf1();
	});

	$(buttonObj[1]).bind('click', function(){
		$('#masking').remove();
		$("#general-popup-panel").remove();
		if(cbf2 != null)
			cbf2();
	});
}
function close_general_popup_in_force()
{
	$('#masking').remove();
	$("#general-popup-panel").remove();
}
function isMobile(){
	if ((/Android|webOS|iPhone|iPad|iPod|BlackBerry/i.test(navigator.userAgent)))
		return true;
	else
		return false;
}
function addHyperLink(text){
	var exp = /(\b(https?|ftp|file):\/\/[-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|])/ig;
    return text.replace(exp,"<a href='$1' target='_blank'>$1</a>");
}
function draw_functional_popup(cbf1, cbf2, titleStr, msgStr, buttonStr1, buttonStr2, inputType){
	var tags = "<div id='functional-popup-panel'>";
	tags += "<div class='functional-popup-wrapper border-shadow'>";
	tags += "<div class='functional-popup-title'><span>" + (titleStr ? titleStr : '') + "</span></div>";
	tags += "<div class='functional-popup-message'>"+msgStr+"</div>";
	if(inputType == 'text')
	tags += "<input type='text' class='functional-popup-input'>";
	if(inputType == 'password')
	tags += "<input type='password' class='functional-popup-input'>";
	tags += "<span class='functional-popup-error-message'></span>";
	tags += "<div class='functional-popup-button-wrapper'>";
	tags += "<button class='functional-popup-button btn'>"+buttonStr1+"</button>";
	tags += "<button class='functional-popup-button btn'>"+buttonStr2+"</button>";
	tags += "</div>";
	tags += "</div>";
	tags += "</div>";

	$('body').prepend("<div id='masking'></div>");
	$("body").prepend(tags);

	var buttonObj = $(".functional-popup-button-wrapper .functional-popup-button");

	$(buttonObj[0]).bind('click', function(){
		if(cbf1 != null)
			cbf1();
		else{
			$('#masking').remove();
			$("#functional-popup-panel").remove();
		}
	});

	$(buttonObj[1]).bind('click', function(){
		if(cbf2 != null)
			cbf2();
		else{
			$('#masking').remove();
			$("#functional-popup-panel").remove();
		}
	});
}
function close_functional_popup(){
	$('#masking').remove();
	$("#functional-popup-panel").remove();
}
function logout(){
	draw_general_popup(
			function(){
				window.location.href = '/logout';
			},
			null,
			null,
			stringTable.logout,
			stringTable.yes,
			stringTable.no
	);
}
function change_language(lang){
	var url = '/i18n/setlang/';
	draw_progress();
	$.ajax({
		url: url,
		type: 'post',
		data:{
			'language': lang
		},
		success: function(res){
			remove_progress();
			location.reload();
		},
		error: function(){
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
function generate_uuid() {
    var uuid = ""
    for (var i=0; i < 16; i++) {
        uuid += Math.floor(Math.random() * 16).toString(16);
    }
    return uuid;
}
function file_validation(type, ext, size, sizeLimit)
{
	size = Math.round(size);

	if(size > sizeLimit)
	{
		draw_general_popup(
				null,
				null,
				null,
				stringTable.fileSizeExceed,
				stringTable.ok,
				null
		);
		return false;
	}

	if(typeof ext == 'undefined')
	{
		draw_general_popup(
				null,
				null,
				null,
				stringTable.wrongFileType,
				stringTable.ok,
				null
		);
		return false;
	}

	if(type == 'video')
	{
		ext = ext.toUpperCase();
		if( !(ext == 'MP4' || ext == 'MPEG4' || ext == 'AVI' || ext == 'MPG' || ext == 'MPEG' || ext == 'MOV' || ext ==  'WMV' || ext == 'FLV' || ext == '3GP' || ext == '3G2' || ext == 'MKV') )
		{
			draw_general_popup(
					null,
					null,
					null,
					stringTable.wrongFileType,
					stringTable.ok,
					null
			);
			return false;
		}
	}
	if(type == 'html'){
		ext = ext.toUpperCase();
		if( !(ext == 'HTML' || ext == 'HTM') ){
			draw_general_popup(
					null,
					null,
					null,
					stringTable.wrongFileType,
					stringTable.ok,
					null
			);
			return false;
		}
	}
	if(type == 'image')
	{
		ext = ext.toUpperCase();
		if( !(ext == 'BMP' || ext == 'JPG' || ext == 'JPEG' || ext == 'PNG' || ext == 'ICO' || ext == 'GIF') )
		{
			draw_general_popup(
					null,
					null,
					null,
					stringTable.wrongFileType,
					stringTable.ok,
					null
			);
			return false;
		}
	}
	if(type == 'slide')
	{
		ext = ext.toUpperCase();
		if( !(ext == 'PPT' || ext == 'PPTX' || ext == 'PDF') )
		{
			draw_general_popup(
					null,
					null,
					null,
					stringTable.wrongFileType,
					stringTable.ok,
					null
			);
			return false;
		}
	}
	return true;
}
function show_button_progress(o){
	var w = $(o).width();
	$(o).html("<img src='/resources/images/upload_progress.gif' style='width:"+w+"px; height:auto;'>");
	$(o).removeClass('btn');
}
function hide_button_progress(o, t){
	$(o).remove('img');
	$(o).text(t);
	$(o).addClass('btn');
}
function button_lockdown(obj, mode){
	if(mode == true){
		$(obj).addClass('lockdown');
		$(obj).removeClass('btn');
	}
	if(mode == false){
		$(obj).addClass('btn');
		$(obj).removeClass('lockdown');
	}
}
function get_current_time(){
	var now = new Date();
	var year = now.getFullYear();
	var month = now.getMonth() + 1;
	month = month < 10 ? '0' + month : month;
	var date = now.getDate();
	date = date < 10 ? '0' + date : date;
	var hour = now.getHours();
	hour = hour < 10 ? '0' + hour : hour;
	var minute = now.getMinutes();
	minute = minute < 10 ? '0' + minute : minute;
	var second = now.getSeconds();
	second = second < 10 ? '0' + second : second;

	return year + '-' + month + '-' + date + ' ' + hour + ':' + minute + ':' + second;
}
function open_popup(url){
	var w = $(window).width();
	var h = 480;
	if(w > 640)
		w = 640;
	else
		w = Math.round(w * 0.9);
	var newwindow=window.open(url, '_blank', "height="+h+",width="+w);
	if (window.focus)
		{newwindow.focus()}
	return false;
}
function comma_separation(num){
    num = '' + num;
    var processed = '';
    for(var i = num.length - 1; i >= 0; i--){
        processed += num[i];
        if(i % 3 === 0 && i !== 0) {
            processed += ',';
        }
    }
    return processed;
}
function cssLoad(url, callback) {
    var promise,
        resolutions = [],
        rejections = [],
        resolved = false,
        rejected = false,
        count, id;

    this.count = (this.count) ? ++this.count : 1;
    count = this.count;
    id = 'load-css-'+count;

    promise = {
        done: function(callback) {
            resolutions.push(callback);
            if ( resolved ) callback();
            return promise;
        },
        fail: function(callback) {
            rejections.push(callback);
            if ( rejected ) callback();
            return promise;
        }
    };
    function resolve() {
        resolved = true;
        for ( var i=0, len=resolutions.length; i<len; i++ ) resolutions[i]();
    }
    function reject() {
        rejected = true;
        for ( var i=0, len=rejections.length; i<len; i++ ) rejections[i]();
    }

    var link = document.createElement('link');
    link.setAttribute('id', id);
    link.setAttribute('rel', 'stylesheet');
    link.setAttribute('type', 'text/css');
    if ( typeof link.addEventListener !== 'undefined' ) {
        link.addEventListener('load', resolve, false);
        link.addEventListener('error', reject, false);
    } else if ( typeof link.attachEvent !== 'undefined' ) {
        link.attachEvent('onload', function() {
            // IE 8 gives us onload for both success and failure
            // and also readyState is always "completed", even
            // for failure.  The only way to see if a stylesheet
            // load failed from an external domain is to try and
            // access its cssText, and then catch the error
            // ... sweet :/
            var txt, cur, i = document.styleSheets.length;
            try {
                while ( i-- ) {
                    cur = document.styleSheets[i];
                    if ( cur.id === id ) {
                        txt = cur.cssText;
                        resolve();
                        return;
                    }
                }
            } catch(e) {}
            if ( !resolved ) {
                reject();
            }
        });
    }
    document.getElementsByTagName('head')[0].appendChild(link);
    link.setAttribute('href', url);
    return promise;
}
//plugins

$.scrollbarWidth=function(){var a,b,c;if(c===undefined){a=$('<div style="width:50px;height:50px;overflow:auto"><div/></div>').appendTo('body');b=a.children();c=b.innerWidth()-b.height(99).innerWidth();a.remove()}return c};


(function($){
	$.fn.setDefaultString = function(options){
		var defaults = {
			str: ''
		};
		var beforeKeyDown = '';
		var options = $.extend(defaults, options);
		return this.each(function(){
			$(this).val(defaults.str);
			$(this).bind('keydown', function(e){
				var val = $(this).val();
				if(val.length == defaults.str.length && e.keyCode == 8)
					e.preventDefault();
				return;
			});
			$(this).bind('keyup', function(){
				var val = $(this).val();
				if(val.indexOf(defaults.str) == -1){
					$(this).val(defaults.str);
				}
			});
		});
	};
})(jQuery);

(function($){
	$.fn.adjustHeight = function(options){
		var defaults = {
			height: 20
		};
		var options = $.extend(defaults, options);
		return this.each(function(){

			var t = $(this).text();
			var h = $(this).height();

			if(h > options.height){
				for(var i = t.length; i > 0; i--){
					$(this).text(t.substring(0, i-1));
					h = $(this).height();
					if(h < options.height){
						t = t.substring(0, i-5) + '...';
						$(this).text(t);
						break;
					}
				}
			}
		});
	};
})(jQuery);

(function($){
	$.fn.inputLengthSet = function(options){
		var position = {};		// <-- containing absolute position
		var template = "<div id='length-aid' style='display:none'><span class='current-length'></span> / <span class='allowed-length'></span></div>";
		var defaults = {
			maxLength: 0,
			posX:0,
			posY:0,
			fontSize:12,
			fontColor:'#4d4d4d',
			offset: 0
		};
		var options = $.extend(defaults, options);
		var strLength = function(str) {
		    var l= 0;

		    for(var idx=0; idx < str.length; idx++) {
		        var c = escape(str.charAt(idx));

		        if( c.length==1 ) l ++;
		        else if( c.indexOf("%u")!=-1 ) l += 2;
		        else if( c.indexOf("%")!=-1 ) l += c.length/3;
		    }

		    return l - defaults.offset;
		};
		return this.each(function(){
			$(this).focus(function(){
				//console.log('focus');
				$(this).parent().append(template);
				position = $(this).position();
				$("#length-aid").css({
					'position':'absolute',
					'font-size':options.fontSize + 'px',
					'width':'100px',
					'color':options.fontColor,
					'top':position.top + options.posY + 'px',
					'left':position.left + options.posX +'px'
				});
				$("#length-aid .current-length").text(strLength($(this).val()));
				$("#length-aid .allowed-length").text(options.maxLength);
				$("#length-aid").show();
			});
			$(this).blur(function(){
				var str = $(this).val();
				if(strLength(str) > options.maxLength){
					var idx = 0;
					var l = 0;
					for(idx = 0; idx < str.length; idx++) {
						var c = escape(str.charAt(idx));
					    if( c.length==1 ) l ++;
					    else if( c.indexOf("%u")!=-1 ) l += 2;
					    else if( c.indexOf("%")!=-1 ) l += c.length/3;
					    if(l - defaults.offset >= options.maxLength)
					    	break;
					}
					$(this).val(str.substring(0, idx));
					$("#length-aid .current-length").text(strLength($(this).val()));
				}
				$("#length-aid").remove();
			});
			$(this).keyup(function(e){
				var txt = $(this).val();
				if(strLength(txt) > options.maxLength){
					$(this).val(txt.substring(0,options.maxLength-1));
				}
				$("#length-aid .current-length").text(strLength($(this).val()));
			});
			$(this).keypress(function(e){
				if(e.keyCode == 8 || e.keyCode == 46)
					return;
				var str = $(this).val();
				if(strLength(str) >= options.maxLength)
					e.preventDefault();
				return;
			});
		});
	};
})(jQuery);

jQuery.fn.ForceNumericOnly =
function()
{
    return this.each(function()
    {
        $(this).keydown(function(e)
        {
            var key = e.charCode || e.keyCode || 0;
            // allow backspace, tab, delete, arrows, numbers and keypad numbers ONLY
            // home, end, period, and numpad decimal
            return (
                key == 8 ||
                key == 9 ||
                key == 46 ||
                key == 110 ||
                key == 190 ||
                (key >= 35 && key <= 40) ||
                (key >= 48 && key <= 57) ||
                (key >= 96 && key <= 105));
        });
    });
};
jQuery.fn.ForceAlphabetNumericOnly =
function(){
	 return this.each(function(){
        $(this).keydown(function(e){
            var key = e.charCode || e.keyCode || 0;
            // allow backspace, tab, delete, arrows, numbers and keypad numbers ONLY
            // home, end, period, and numpad decimal
            return (
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
    });
};
Object.size = function(obj) {
    var size = 0, key;
    for (key in obj) {
        if (obj.hasOwnProperty(key)) size++;
    }
    return size;
};
if (!String.prototype.format) {
	String.prototype.format = function() {
		var args = arguments;
		return this.replace(/{(\d+)}/g, function(match, number) {
			return typeof args[number] != 'undefined' ? args[number] : match;
		});
	};
}

/**
 * Clears the selected form elements.
 */
$.fn.clearFields = $.fn.clearInputs = function(includeHidden) {
    var re = /^(?:color|date|datetime|email|month|number|password|range|search|tel|text|time|url|week)$/i; // 'hidden' is not in this list
    return this.each(function() {
        var t = this.type, tag = this.tagName.toLowerCase();
        if (re.test(t) || tag == 'textarea') {
            this.value = '';
        }
        else if (t == 'checkbox' || t == 'radio') {
            this.checked = false;
        }
        else if (tag == 'select') {
            this.selectedIndex = -1;
        }
        else if (t == "file") {
            if (/MSIE/.test(navigator.userAgent)) {
                $(this).replaceWith($(this).clone(true));
            } else {
                $(this).val('');
            }
        }
        else if (includeHidden) {
            // includeHidden can be the value true, or it can be a selector string
            // indicating a special test; for example:
            //  $('#myForm').clearForm('.special:hidden')
            // the above would clean hidden inputs that have the class of 'special'
            if ( (includeHidden === true && /hidden/.test(t)) ||
                 (typeof includeHidden == 'string' && $(this).is(includeHidden)) )
                this.value = '';
        }
    });
};

/*
 *
SAMPLES
	draw_progress();
	$.ajax({
		url : "/requestreceiver/",
		type : "post",
		data :{
			req_type : ""
		},
		success : function(response){
			remove_progress();
			if(response.result == 'ok'){
			} else {
			}
		},
		error : function(){
			remove_progress();
		}
	});
*/