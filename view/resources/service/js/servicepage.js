$(function(){
    $(".body-wrapper").each(function(){
        if($(this).parent().hasClass('body-wrapper')){
            $(this).unwrap();
        }
    });
    // remove contenteditable to all elements
    $('[contenteditable]').removeAttr('contenteditable');

    // PROCESSING ATTRIBUTE SETTINGS
    if($('html').is('.ie6, .ie7, .ie8, ie9') == true){
        try{
            // #backstretch
            var contentBackground = $("#content").css('background-image');
            var contentBackgroundRepeat = $("#content").css('background-repeat');
            if(contentBackgroundRepeat.indexOf('no-repeat') != -1){
                var u = contentBackground;
                u = u.replace('url(', '');
                u = u.replace(')', '');
                u = u.replace(/"/g, "");
                $("#content").backstretch(u);
            }
        }catch(err){console.log('err: ' + err);}
    }
    $(".hyperlink-added").each(function(){
        var hyperlink = $(this).attr('data-hyperlink');
        var hyperlinkTarget = $(this).attr('data-hyperlink-target');

        if(hyperlinkTarget == '' || hyperlinkTarget == null || typeof hyperlinkTarget == 'undefined')
            hyperlinkTarget = '_blank';

        if(hyperlink.indexOf('/') == -1)
            return;
        $(this).bind('click', function(){
            window.open(hyperlink, hyperlinkTarget);
        });
    });
    $("img.lazy-loading").show().lazyload({
        placeholder: 'https://kordir.s3.amazonaws.com/images/transparent.gif',
        threshold: 240,
        effect: 'fadeIn',
        effectspeed: 1000
    });
    $(".mobile-fontsize").each(function(idx){
        var addedClassName = 'mobile-fontsize-' + idx;
        var fontsize = $(this).attr('data-mobile-fontsize');
        $(this).addClass(addedClassName);
        var query = "@media all and (max-width:480px){." + addedClassName + "{";
        query += "font-size: " + fontsize + " !important;";
        query += "}}";
        try{
            document.querySelector('style').textContent += query;
        } catch (err){
            $(this).css('font-size', fontsize);
        }
    });
    $(".mobile-maxwidth").each(function(idx){
        var addedClassName = 'mobile-maxwidth-' + idx;
        var maxWidth = $(this).attr('data-mobile-maxwidth');
        $(this).addClass(addedClassName);
        var query = "@media all and (max-width:480px){img." + addedClassName + " {";
        query += "max-width: " + maxWidth + " !important;";
        query += "}}";
        try{
            document.querySelector('style').textContent += query;
        }catch(err){
            $(this).css('max-width', maxWidth);
        }
    });
    $(".hover-added").hover(function(){
        var background = $(this).attr('data-hover-background');
        var text = $(this).attr('data-hover-text');

        var originalBackgroundColor = $(this).css('background-color');
        var originalTextColor = $(this).css('color');

        $(this).attr('data-original-background', originalBackgroundColor);
        $(this).attr('data-original-text', originalTextColor);

        if(typeof background === 'string'){
            $(this).css('background-color', background);
        }
        if(typeof text === 'string'){
            $(this).css('color', text);
        }
    }, function(){
        var originalBackgroundColor = $(this).attr('data-original-background');
        var originalTextColor = $(this).attr('data-original-text');
        $(this).css({
            'background-color': originalBackgroundColor,
            'color': originalTextColor
        });
    });
    $("td").each(function(){
        var t = $(this).parents('table').eq(0);
        var w = $(t).width();
        var h = $(t).height();
        $(this).css({
            'width': w + 'px'
        });
    });
    if(oldIE) {
        $(".background-transparency").each(function(){
            var rgba = $(this).attr('data-background-transparency');
            if(rgba.indexOf('rgba') != -1){
                rgba = rgba.replace('rgba(', '');
                rgba = rgba.replace(')', '');
                rgba = rgba.replace(/ /gi, "");
                rgba = rgba.split(',');
                var r, g, b, a = 0;
                r = parseInt(rgba[0]).toString(16);
                g = parseInt(rgba[1]).toString(16);
                b = parseInt(rgba[2]).toString(16);
                a = parseInt(parseFloat(rgba[3]) * 100);
                a = Math.round(a * 255 / 100);
                a = a.toString(16);
                if(r.length == 1)
                    r = '0' + r;
                if(g.length == 1)
                    g = '0' + g;
                if(b.length == 1)
                    b = '0' + b;
                if(a.length == 1)
                    a = '0' + a;
                var hex = '#' + a + r + g + b;
                var filter = "progid:DXImageTransform.Microsoft.gradient(GradientType=0,startColorstr='" + hex + "', endColorstr='" + hex + "')";
                $(this).css('filter', filter);
                $(this).css('zoom', '1');
            }
        });
        var bg = $("#content").css('background-image');
        var repeat = $("#content").css('background-repeat');
        if(bg.indexOf('url') != -1 && repeat == 'no-repeat'){
            $("#content").css({
                'background-size': '100% 100%',
                'background-image': bg,
                'background-attachment': 'inherit',
                '-webkit-background-size': '100% 100%',
                '-moz-background-size': '100% 100%',
                '-o-background-size': '100% 100%',
                '-ms-background-size': '100% 100%'
            });
        }
    }

	if( $(".viewport-check").css('display') == 'none' )
		variable.mobileWidth = false;
	else
		variable.mobileWidth = true;

	table_size_init();
	slide_init();
	googlemap_init();
	iframe_init();
	$("img.entire-width").each(function(){
		$(this).parents('.body-content').css({
			'padding': '0',
			'width': '100%'
		});
	});
	if (!(/Android|webOS|iPhone|iPad|iPod|BlackBerry/i.test(navigator.userAgent))){
		variable.resizeFunc.push(pictureSlideAdjust);
		variable.resizeFunc.push(pageSlideAdjust);
	}
	$(".contact-form button").bind('click', function(){
		submit_request_form($(this).parent());
	});

	$(window).resize(function(){
		if(this.resizeTO)
			clearTimeout(this.resizeTO);
	    this.resizeTO = setTimeout(function() {
	        $(this).trigger('resizePage');
	    }, 300);
	});
	$(window).bind('resizePage', function() {
		resize();
	});
	serviceVariable.pageInitTimer = setInterval(function(){
		try{
			if(document.readyState == "complete"){
				clearInterval(serviceVariable.pageInitTimer);
				for(func in serviceVariable.resizeFunc)
					serviceVariable.resizeFunc[func]();
				var hash = location.hash;
				if(hash.indexOf('#') != -1){
					hash = hash.replace('#', '');
					hash_changed(hash);
				}
			}
		}catch(err){}
	},300);

	// quick fix
	$(".picture-text-vertical-box-five").each(function(){
		var imgHeight = $(this).find('img').height();
		$(this).css('min-height', imgHeight + 10 + 'px');
	});
});
function table_size_init(){
	$("table").each(function(){
		var parentWidth = $(this).parent().width();
		var thisWidth = $(this).width();
		if(thisWidth >= parentWidth)
			$(this).addClass('oversize-table');

		if(variable.mobileWidth){
			if($(this).hasClass('mobile-width')){
				var td = $(this).children().children().children('td');
				var ow = parseInt($(td).attr('width'));
				var oh = parseInt($(td).attr('height'));
				var tw = $(this).width();
				$(td).css('height', tw*oh/ow + 'px');
			}
		}
	});
}
function slide_init(){
	try{
		$(".picture-slide-wrapper").each(function(){
			var fullscreen = $(this).attr('data-slide-fullscreen');
			var autoSlide = $(this).attr('data-slide-autoslide');

			if(fullscreen == "true"){
				fullscreen = true;
			} else {
				fullscreen = false;
			}
			if(fullscreen){
				$(this).unwrap();
				$(this).parents('.body-wrapper').addClass('entire-width');
				$(this).parents('.body-wrapper').css('vertical-align', 'bottom');
			}
			try{autoSlide = parseInt(autoSlide);} catch(err){autoSlide = 0;}

			if(autoSlide > 0){
				pictureSlideOptions.$AutoPlay = true;
				pictureSlideOptions.$AutoPlayInterval = autoSlide * 1000;
				pictureSlideOptions.$PauseOnHover = 0;
			}

			var id = 'picture-slide-' +  (variable.slideIdx++);
			$(this).prop('id', id);
			var slideList = [];
			var slideListText = $(this).attr('data-slide-list');

			var slidePrefix = $(this).attr('data-slide-prefix');

			if(slideListText.indexOf(',') != -1){
				slideList = slideListText.split(',');
			} else {
				slideList.push(slideListText);
			}
			var w = slideList[0].split('_')[1];
			var h = slideList[0].split('_')[2].split('.')[0];
			w = parseInt(w);
			h = parseInt(h);

			var html = $(".picture-slide-html-data").html();
			$(this).html(html);

			var containerWidth = 0;

			if(fullscreen){
				var scrollbarWidth = $.scrollbarWidth();
				if(typeof scrollbarWidth !== 'number'){
					scrollbarWidth = 50;
				}
				containerWidth = screen.availWidth - scrollbarWidth;
			} else {
				containerWidth = $(this).parent().innerWidth();
				fullscreen = false;
			}
			var containerHeight = Math.round(h * containerWidth / w);
			var thisHeight = $(this).height();

			if(!fullscreen && containerHeight > thisHeight)
				containerHeight = thisHeight;

			$(this).css({
				'width': containerWidth + 'px',
				'height': containerHeight + 'px',
				'z-index': 1
			});
			$(this).children('.slide-wrapper').css({
				'width': containerWidth + 'px',
				'height': containerHeight + 'px'
			});
			$(this).children('.picture-arrow').css({
				'margin-top': -26 + 'px'
			});
			var str = '';
			for(var i = 0; i < slideList.length; i++){
				var file = '';
				if(	slideList[i].indexOf('saWwsRICUE') != -1 ||
							slideList[i].indexOf('GWZanLrnJb') != -1 ||
							slideList[i].indexOf('tRgxMOvbpW') != -1 ){
					file = variable.fileSuffix + '5' + '/' + slideList[i];
				} else if(typeof slidePrefix !== 'undefined' && slidePrefix.length > 0) {
					file = slidePrefix + slideList[i];
				} else{
					file = variable.fileSuffix + variable.serviceId + '/' + slideList[i];
				}
				str += "<div><img class='picture-slide-image' u='image' src='"+file+"'></div>";
			}
			$(this).children('.slide-wrapper').html(str);
			var jssor_slider = new $JssorSlider$(id, pictureSlideOptions);
			var obj = {
				obj: jssor_slider,
				fullscreen: fullscreen,
				containerWidth: containerWidth,
				width: w,
				height: h
			};
			variable.pictureSlideObject.push(obj);
		});
	} catch(err){}

	try{
		$(".page-slide-wrapper").each(function(){
			var id = 'page-slide-' + (variable.slideIdx++);
			var slideList = [];
			var slideListText = $(this).attr('data-slide-list');
			if(slideListText.indexOf(',') != -1){
				slideList = slideListText.split(',');
			} else {
				slideList.push(slideListText);
			}

			$(this).prop('id', id);

			var html = $(".page-slide-html-data").html();
			$(this).html(html);

			$(this).css({
				'width': '960px',
				'margin': '0'
			});
			var str = '';

			var fileSuffix = variable.fileSuffix + variable.serviceId + '/';

			for(var i = 0; i < slideList.length; i++){
				var file = fileSuffix + slideList[i];
				str += "<div><img u='image' src='"+file+"'><img u='thumb' src='"+file+"'></div>";
				var anchor = document.createElement('a');
				$(anchor).prop('href', file);
				$(this).children('.hidden-anchor').append(anchor);
			}
			$(this).children('.slide-wrapper').html(str);
			var jssor_slider = new $JssorSlider$(id, pageSlideOptions);
			variable.slideObject.push(jssor_slider);

			$(this).hover(function(){
				$(".slide-fullscreen").show();
			}, function(){
				$(".slide-fullscreen").fadeOut(150);
			});
			$(".hidden-anchor a").photoSwipe({
				loop: false,
				captionAndToolbarFlipPosition: true
			});
			$(this).find('.slide-fullscreen').bind('click', function(){
				$(".hidden-anchor a").eq(0).click();
			});
		});
	} catch(err) {}

	if(variable.slideObject.length != 0)
		pageSlideAdjust();

	if(variable.pictureSlideObject.length != 0)
		pictureSlideAdjust();
}
function pictureSlideAdjust(){
	if(variable.pictureSlideObject.length == 0)
		return;
	var bodyWidth = document.body.clientWidth;
	if(bodyWidth){
		for(var i = 0; i < variable.pictureSlideObject.length; i++){
			var fullscreen = variable.pictureSlideObject[i].fullscreen;
			var containerWidth = 0;
			var containerHeight = 0;

			if(fullscreen){
				containerWidth = document.body.clientWidth;
			} else {
				containerWidth = variable.pictureSlideObject[i].containerWidth;
			}
			if(variable.mobileWidth){
				containerWidth = document.body.clientWidth;
			} else {
				if(fullscreen){
					var scrollbarWidth = $.scrollbarWidth();
					if(typeof scrollbarWidth !== 'number'){
						scrollbarWidth = 50;
					}
					if($("#content").innerWidth() > 960)
						containerWidth = $("#content").innerWidth();
					else
						containerWidth = variable.pictureSlideObject[i].containerWidth;
				} else {
					containerWidth = variable.pictureSlideObject[i].containerWidth;
				}
			}
			variable.pictureSlideObject[i].obj.$SetScaleWidth(Math.min(containerWidth, 2560));
		}
	} else {
		window.setTimeout(pictureSlideAdjust, 50);
	}
}
function pageSlideAdjust(){
	if(variable.slideObject.length == 0)
		return;
	var pw = variable.slideObject[0].$Elmt.parentNode.clientWidth;
	if(pw){
		var padding =  $(variable.slideObject[0].$Elmt.parentNode).css('padding-left');
		if(padding.indexOf('px') != -1){
			padding = padding.split('px')[0];
			padding = parseInt(padding);
			pw = pw - padding*2;
		}
		for(var i = 0; i < variable.slideObject.length; i++){
			variable.slideObject[i].$SetScaleWidth(Math.min(pw, 960));
			var compensatedPadding = variable.slideObject[i].$GetScaleHeight() / 568 * 100;
			$(".page-slide-wrapper").eq(i).css('padding-bottom', compensatedPadding + 'px');
		}
	} else {
		window.setTimeout(slideAdjust, 50);
	}
}
function iframe_init(){
	$("#content iframe").each(function(){
		var w = $(this).width();
		var h = $(this).height();
		$(this).attr('data-width', w + 'px');
		$(this).attr('data-height', h + 'px');
		$(this).data('data-mobile', variable.mobileWidth);

		if(variable.mobileWidth == false)
			return;
		var src = $(this).prop('src');
		var allowance = (window.innerWidth > 0) ? window.innerWidth : screen.width;
		allowance -= 40;
		if(w > allowance){
			h = allowance * h / w;
			w = allowance;

			if(h < 280)
				h = 280;

			$(this).css({
				'position': 'relative',
				'width': '100%',
				'height': h + 'px',
				'margin-left': 'auto',
				'margin-right': 'auto'
			});
		}
	});
}
function googlemap_init(){
	$(".googlemap-wrapper").each(function(){
		var hasMarker = false;
		var node = document.createElement('div');
		$(this).find('*').remove();
		var w = $(this).attr('data-width');
		var h = $(this).attr('data-height');
		$(node).attr('data-width', w);
		$(node).attr('data-height', h);
		var allowance = (window.innerWidth > 0) ? window.innerWidth : screen.width;
		var wn =  parseInt(w.split('px')[0]);
		var hn = parseInt(h.split('px')[0]);
		if(allowance < wn){
			h = (allowance * hn / wn) + 'px';
		}
		if(parseInt(h.split('px')[0]) < 300)
			h = '300px';
		w = '100%';

		node.className = 'googlemap';

		if(variable.mobileWidth){
			node.style.width = w;
			node.style.height = h;
			$(node).data('data-mobile', true);
		} else {
			if($(this).hasClass('entire-width') == true) {
				node.style.width = '100%';
				$(node).addClass('entire-width');
			} else {
				node.style.width = $(node).attr('data-width');
			}
			node.style.height = $(node).attr('data-height');
			$(node).data('data-mobile', false);
		}
		$(node).css({
			'display': 'inline-block',
			'margin-left': 'auto',
			'margin-right': 'auto',
			'position': 'relative'
		});

		var center = JSON.parse($(this).attr('data-center'));
		var zoom = parseInt($(this).attr('data-zoom'));
		var marker = $(this).attr('data-marker');

		if(typeof center.lat === 'undefined'){
			var key = '';
			for(k in center){
				if(k != 'k')
					key = k;
			}
			center.lng = center[key];
			center.lat = center.k;
		}
		if(marker.length != 0){
			hasMarker = true;
			marker = JSON.parse(marker);
			if(typeof marker.lat === 'undefined'){
				var key = '';
				for(k in marker){
					if(k != 'k' && k != 'lat')
						key = k;
				}
				marker.lng = parseFloat(marker[key]);
				marker.lat = parseFloat(marker.k);
			}
		}
		var draggable = true;
		if ((/Android|webOS|iPhone|iPad|iPod|BlackBerry/i.test(navigator.userAgent)))
			draggable = false;

		var mapOptions = {
			zoom: zoom,
			scrollwheel: false,
			draggable: draggable,
			center: {
				lat: parseFloat(center.lat),
				lng: parseFloat(center.lng)
			}
		};
		var map = new google.maps.Map(node, mapOptions);
		if(hasMarker){
			var mrk = new google.maps.Marker({
				position: {
					lat: marker.lat,
					lng: marker.lng
				}
			});
			mrk.setMap(map);
		}
		$(node).data('data-map', map);

		if($(this).hasClass('entire-width') == true){
			$(this).parents('.body-content').css({
				'padding': '0',
				'width': '100%'
			});
		}
		$(this).replaceWith(node);
		$(this).css('visibility', 'visible');
	});
}
function resize(){
	if( $(".viewport-check").css('display') == 'none' )
		variable.mobileWidth = false;
	else
		variable.mobileWidth = true;

	var currentWidth = (window.innerWidth > 0) ? window.innerWidth : screen.width;

	// google map
	$(".googlemap").each(function(){
		var w = $(this).attr('data-width');
		var h = $(this).attr('data-height');
		var wn =  parseInt(w.split('px')[0]);
		var hn = parseInt(h.split('px')[0]);

		if(variable.mobileWidth){
			if($(this).data('data-mobile') == true)
				return;
			else
				$(this).data('data-mobile', true);

			var allowance = (window.innerWidth > 0) ? window.innerWidth : screen.width;
			//allowance -= 40;

			if(allowance < wn){
				w = allowance + 'px';
				h = (allowance * hn / wn) + 'px';
			}
			if(parseInt(h.split('px')[0]) < 320)
				h = '320px';
			w = '100%';
		} else {
			if($(this).data('data-mobile') == false)
				return;
			else
				$(this).data('data-mobile', false);
		}

		if($(this).hasClass('entire-width') == true)
			w = '100%';

		$(this).css({
			'width': w,
			'height': h
		});
		var map = $(this).data('data-map');
		google.maps.event.trigger(map,'resize');
	});

	iframe_init();

	table_size_init();

	// registered resize functions
	for(var i = 0; i < variable.resizeFunc.length; i++){
		variable.resizeFunc[i]();
	}
}
// actions
function submit_request_form(form){
	var name = $(form).children('.contact-name');
	var email = $(form).children('.contact-email');
	var title = $(form).children('.contact-title');
	var content = $(form).children('.contact-content');
	var pass = true;

	$(form).find('input').removeClass('orange-border');
	$(form).find('textarea').removeClass('orange-border');

	var errorMsg = '';

	if($(name).val().length < 2){
		$(name).addClass('orange-border');
		pass = false;
		errorMsg += stringTable.nameLength + '<br>';
	}
	if(validate_email($(email).val()) == false){
		$(email).addClass('orange-border');
		pass = false;
		errorMsg += stringTable.emailWrong + '<br>';
	}
	if($(title).val().length < 2){
		$(title).addClass('orange-border');
		pass = false;
		errorMsg += stringTable.subjectLength + '<br>';
	}
	if($(content).val().length < 5){
		$(content).addClass('orange-border');
		pass = false;
		errorMsg += stringTable.bodyLenghtSub + '<br>';
	}
	if(!pass){
		draw_general_popup(null, null, null, errorMsg, stringTable.close, null);
		return;
	}
	var data = {
		serviceId: variable.serviceId,
		name: $(name).val(),
		email: $(email).val(),
		title: $(title).val(),
		content: $(content).val()
	};
	draw_progress();
	$.ajax({
		url : "/requestreceiver/",
		type : "post",
		data :{
			req_type : "submit_request_form",
			data: JSON.stringify(data)
		},
		success : function(response){
			remove_progress();
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
			draw_general_popup(function(){
				$(name).val('');
				$(email).val('');
				$(title).val('');
				$(content).val('');
			}, null, null, stringTable.requestFormSuccess, stringTable.close, null);
		},
		error : function(){
			remove_progress();
			draw_general_popup(null, null, null, stringTable.tryAgain, stringTable.close, null);
		}
	});
}
function connection_status_change(type){}
function connection_established(){}