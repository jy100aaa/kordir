(function($){
	$.fn.autoCompletion = function(options){
		var template = "<div id='auto-completion-template'></div>";
		var position = {};
		var bAliveAutoCompletionBox = false;
		var inputObj = null;
		var currentPosition = 0;
		var keyStrokeTimer = null;
		
		var defaults = {
			textSet: [],
			boxColor:"#111",
			textColor:"#efefef",
			hoverBoxColor:"#aaa",
			hoverTextColor:"#111",
			borderBottom: '1px solid #aaa',
			maxHeight:155,
			noneCancel:true,
			showAllListOnBlank:false,
			onSelectCallBackFn:null,
			onCancelCallBackFn:null,
			marginTop:0,
			marginLeft:0,
			width:null,
			height:null,
			textIndentation:0
		};
		
		var options = $.extend(defaults, options);
		
		var printAutoCompletionList = function(){
			if(typeof inputObj == 'undefined')
				return;
			var added = false;
			var txt = $(inputObj).val();
			try{
				txt = txt.toUpperCase();
			}
			catch(err){
				
			}
			var paddingLeft = $(inputObj).css('padding-left');
			var fontSize = $(inputObj).css('font-size');
			var width;
			var height;
			var boxColor;
			var textColor;
			var hoverBoxColor;
			var hoverTextColor;
			var textLength = 0;
			
			try{
				textLength = txt.length;
			} catch(err){
				textLength = 0;
			}
			
			if(textLength == 0)
			{
				if(options.showAllListOnBlank != true)
				{
					$("#auto-completion-template .completion-item").remove();
					return;
				}
				else
				{
					for(var i = 0; i < options.textSet.length; i++)
						$("#auto-completion-template").append("<div class='completion-item'><span class='completion-item-text'>"+options.textSet[i]+"</span></div>");

				}
			}
			else
			{
				var matchingSet = {};
				var j = 0;
				var found = false;
				for(var i = 0; i < options.textSet.length; i++)
				{
					var pos = options.textSet[i].toUpperCase().indexOf(txt);
					if(pos == 0)
					{
						found = true;
						matchingSet[j++] = options.textSet[i];
					} 
				}
				$("#auto-completion-template .completion-item").remove();	
				if(found == true)
				{
					added = true;
					for(var i in matchingSet)
						$("#auto-completion-template").append("<div class='completion-item'><span class='completion-item-text'>"+matchingSet[i]+"</span></div>");
				}
			}
			$("#auto-completion-template .completion-item").css({
				"background-color":options.boxColor,
				"color":options.textColor,
				"font-size":fontSize,
				"padding-left":paddingLeft,
				"border-bottom": options.borderBottom
			});
			$("#auto-completion-template .completion-item").hover(function(){
				$(this).css({
					"background-color":options.hoverBoxColor,
					"color":options.hoverTextColor,
					"cursor":"pointer"
				});
				currentPosition = $("#auto-completion-template .completion-item").index(this);
			}, function(){
				$(this).css({
					"background-color":options.boxColor,
					"color":options.textColor,
				});
			});
			if(options.height != null){
				$("#auto-completion-template .completion-item").css({
					'height': options.height + 'px',
					'line-height': options.height + 'px'
				});
			}
			$("#auto-completion-template .completion-item span").css({
				'display':'inline-block',
				'margin-left':options.textIndentation + 'px'
			});
		};
		
		return this.each(function(){
			$('body').on("click", function(e){
				var targ;
				if(!e)
					var e = window.event;
				if(e.target)
					targ = e.target;
				else if(e.srcElement)
					targ = e.srcElement;
				if(targ.nodeType == 3)
					targ = targ.parentNode;
								
				var targClassName = '';
				targClassName = $(targ).prop('class');
							
				if(targClassName.indexOf('completion-item') != -1 && bAliveAutoCompletionBox == true)
				{
					var text = $(targ).text();
					$(inputObj).val(text);
					$(inputObj).find("*").off();
					$("#auto-completion-template").remove();
					inputObj = null;
					position = {};
					bAliveAutoCompletionBox = false;
					currentPosition = -1;
					if(options.onSelectCallBackFn != null)
						options.onSelectCallBackFn();
				}
				else if(targClassName != $(inputObj).prop("class") && bAliveAutoCompletionBox == true)
				{
					var found = false;
					var txt = $(inputObj).val();
					if(txt.length != 0)
					{
						txt = txt.toUpperCase();
						for(var i = 0; i < options.textSet.length; i++)
						{
							var pos = options.textSet[i].toUpperCase().indexOf(txt);
							if(pos == 0)
							{
								if(txt == options.textSet[i].toUpperCase())
								{
									found = true;
									$(inputObj).val(options.textSet[i]);
									break;
								}
							}
						}
						if(found == false)
						{
							if(options.noneCancel == true)
							{
								$(inputObj).val("");
								if(options.onCancelCallBackFn != null)
									options.onCancelCallBackFn();
							}
						}
						else
						{
							if(options.onSelectCallBackFn != null)
								options.onSelectCallBackFn();
						}
					}
					else
					{
						if(options.onCancelCallBackFn != null)
							options.onCancelCallBackFn();
					}
					$(inputObj).find("*").off();
					$("#auto-completion-template").remove();
					inputObj = null;
					position = {};
					bAliveAutoCompletionBox = false;
					currentPosition = -1;
				}
			});
			$(this).on('focus', function(e){
				if(($(this).val().length != 0 || options.showAllListOnBlank == true) && bAliveAutoCompletionBox == false)
				{
					inputObj = $(this);
					bAliveAutoCompletionBox = true;
					position = $(this).position();
					height = $(this).css("height");
					if(options.width == null)
						width = parseInt($(this).css("width").split("px")[0]) + parseInt($(this).css("padding-left").split("px")[0]);
					else
						width = options.width;
					var parentObj = $(this).parent();
					$(parentObj).append(template);
					$("#auto-completion-template").css({
						"position":"absolute",
						"width" : width + "px",
						"left":position.left + options.marginLeft + "px",
						"top" : position.top + 25 + options.marginTop + "px",
						"z-index":"50",
						"max-height": options.maxHeight + 'px',
						"overflow-y":"auto"
					});
					$("#auto-completion-template .completion-item").remove();
					printAutoCompletionList();
				}
			});
			$(this).on("keyup", function(e){
				if(bAliveAutoCompletionBox == false)
				{
					inputObj = $(this);
					bAliveAutoCompletionBox = true;
					position = $(this).position();
					height = $(this).css("height");
					if(options.width == null)
						width = parseInt($(this).css("width").split("px")[0]) + parseInt($(this).css("padding-left").split("px")[0]);
					else
						width = options.width;
					var parentObj = $(this).parent();
					$(parentObj).append(template);					
					$("#auto-completion-template").css({
						"position":"absolute",
						"width" : width + "px",
						"left":position.left + options.marginLeft + "px",
						"top" : position.top + 25 + options.marginTop + "px",
						"z-index":"50",
						"max-height": options.maxHeight + 'px',
						"overflow-y":"auto"
					});
					$("#auto-completion-template .completion-item").remove();
					printAutoCompletionList();
				}
				else
				{
					if(keyStrokeTimer == null){
						keyStrokeTimer = setTimeout(function(){
							$("#auto-completion-template .completion-item").remove();
							printAutoCompletionList();
							keyStrokeTimer = null;
						}, 500);
					} else {
						clearInterval(keyStrokeTimer);
						keyStrokeTimer = setTimeout(function(){
							$("#auto-completion-template .completion-item").remove();
							printAutoCompletionList();
							keyStrokeTimer = null;
						}, 500);
					}
				}
			});
		});
	};
})(jQuery);