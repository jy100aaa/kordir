$(function(){
	$(".board-bottom .paging-nav").bind('click', function(){
		if($(this).hasClass('disabled') || $(this).hasClass('current-page'))
			return;
		var page = $(this).prop('id').split('-')[2];
		hash = 'board?url=' + productVariable.tag + '&page=' + page;
		location.hash = hash
	});

	 var hash = location.hash;
	 var p = hash.split('&');
	 var url = '';
	 for(var i = 0; i < p.length; i++){
	 	if(p[i].indexOf('url') != -1){
			url = p[i].split('=')[1];
			$(".board-top .compose-button").attr('data-url', url);
			break;
		}
	}
	$(".board-top .compose-button").bind('click', function(){
		var url = $(this).attr('data-url');
		location.hash = 'productboardwrite?url=' + url;
	});

	$(".board-sort .sort-button").bind('click', function(){
		do_sort();
	});
	$(".board-top .board-sort-expand-collapse").data('data-collapse', true);
	$(".board-top .board-sort-expand-collapse").bind('click', function(){
		var toggle = $(this).data('data-collapse');
		if(toggle){
			$(this).text('▲');
			$(this).css('border-bottom', '1px solid #aaa');
			$(".product-board-wrapper .board-sort").fadeIn(150);
		} else {
			$(this).text('▼');
			$(this).css('border-bottom', '0');
			$(".product-board-wrapper .board-sort").fadeOut(150);
		}
		$(this).data('data-collapse', !toggle);
	});
	$(".board-sort .main-sort-category").bind('change', function(){
		var label = $(this).val();
		$(".board-sort .sub-sort-category").removeAttr('disabled');
		$(".board-sort .sub-sort-category").children('option').each(function(idx){
			if(idx != 0){
				var className = $(this).prop('class');
				if(className != label)
					$(this).hide();
				else
					$(this).show();
			}
		});
		$(".board-sort .sub-sort-category").children('option').eq(0).attr('selected', true);
	});

	$(".board-sort .sub-sort-category").bind('change', function(){
		var val = $(this).val();
		if(val != ''){
			var label = $(".board-sort .main-sort-category").val();
			var value = $(".board-sort .sub-sort-category").val();
			if(typeof productVariable.filter[label] === 'undefined'){
				productVariable.filter[label] = [];
				productVariable.filter[label].push(value);
			} else {
				var found = false;
				for(var i = 0; i < productVariable.filter[label].length; i++){
					if(value == productVariable.filter[label][i]){
						found = true;
					}
				}
				if(!found)
					productVariable.filter[label].push(value);
			}
		}
		update_filter();
	});

	$(".board-sort .range-select-wrapper .range-select-item").each(function(){
		try{
			var className = $(this).prop('class').split(' ')[1];
			var mm = get_min_max(productVariable.number[className].value);
			var min = mm.min;
			var max = mm.max;
			var unit = productVariable.number[className].unit;
			var inputObj = $(this).children('input');
			$(this).children('.range-slider').slider({
				range: true,
				min: min,
				max: max,
				values: [min, max],
				slide: function(event, ui){
					productVariable.number[className].min = ui.values[0];
					productVariable.number[className].max = ui.values[1];
					$(inputObj).val(ui.values[0] + unit + ' - ' + ui.values[1] + unit);
				}
			});
			$(inputObj).val('0' + unit + ' - ' + max + unit);
		} catch (err){

		}
	});
	product_window_size_adjustment();
	window.setTimeout(product_window_size_adjustment, 50);
	variable.resizeFunc[variable.currentLocation] = product_window_size_adjustment;
});
function product_window_size_adjustment(){
	var parentObj = $(".board-center");
	var childObj = $(".product-item-wrapper");
	var itemLength = $(childObj).length;

	var hh = document.getElementById('header-wrapper').clientHeight + 1;
	var wh = document.documentElement.clientHeight;
	$("#area").css('min-height', wh-hh+'px');

	if(itemLength == 0)
		return;

	if ((/Android|webOS|iPhone|iPad|iPod|BlackBerry/i.test(navigator.userAgent))){
		var ch = $(childObj).outerHeight();
		var parentMinHeight = itemLength * (ch + 10) + 30;
		$(parentObj).css('min-height', parentMinHeight + 'px');
		$(childObj).css('visibility', 'visible');
		return;
	}
	if($(".dashboard-body").css('display') == 'none'){
		window.setTimeout(product_window_size_adjustment, 50);
		return;
	}
	var pw = $(parentObj).width();
	var marginRight = 20;
	var marginLeft = 0;
	var newWidth = 0;
	var itemsPerRow = 0;
	// 4 items per row
	if(pw > 1024){
		itemsPerRow = 4;
	}
	// 3 items per row
	else if (pw > 768){
		itemsPerRow = 3;
	}
	// 2 items per row
	else {
		itemsPerRow = 2;
	}

	newWidth = (pw - marginRight * (itemsPerRow -1) - itemsPerRow* 2) / itemsPerRow;
	newWidth = Math.floor(newWidth);

	if(newWidth < 220)
		newWidth = 220;

	$(childObj).css('margin-right', '0');

	if(pw > 480){
		$(childObj).each(function(idx){
			if((idx != 0 && (idx+1)%itemsPerRow == 0 )){
				$(this).css({
					'width': newWidth + 'px',
					'visibility':'visible'
				});
			} else {
				$(this).css({
					'margin-right': marginRight + 'px',
					'width': newWidth + 'px',
					'visibility': 'visible'
				});
			}
		});

	} else {
		newWidth = pw*0.95;
		$(childObj).css({
			'visibility': 'visible',
			'width': newWidth + 'px',
			'margin-right': '0',
			'margin-left': (pw - newWidth) / 2 + 'px'
		});
	}
	var maxSubjectHeight = 0;
	var maxInfoHeight = 0;
	$(childObj).each(function(idx){
		var sh = $(this).children('.product-item-subject').height();
		var ih = $(this).children('.product-item-label-value-wrapper').outerHeight();
		if(sh > maxSubjectHeight){
			maxSubjectHeight = sh;
		}
		if(ih > maxInfoHeight){
			maxInfoHeight = ih;
		}
	});
	$(childObj).children('.product-item-subject').css('height', maxSubjectHeight+'px');
	$(childObj).children('.product-item-label-value-wrapper').css('min-height', maxInfoHeight+'px');

	var cw = $(childObj).eq(0).outerWidth();
	var ch = $(childObj).eq(0).outerHeight();
	var capa = Math.floor(pw/cw);
	var rows = Math.ceil(itemLength / capa);
	var parentMinHeight = rows * (ch + 10) + 30;
	if(rows > 1){
		$(parentObj).css('min-height', parentMinHeight + 'px');
	}
}
function update_filter(){
	var sortBasket = $(".board-sort .sort-basket");
	if(productVariable.filter.length == 0)
		$(sortBasket).hide();
	else
		$(sortBasket).show();
	$(sortBasket).html('');
	for(var label in productVariable.filter){
		for(var i = 0 ; i < productVariable.filter[label].length; i++){
			var value = productVariable.filter[label][i];
			var txt = label + ' - ' + value;
			var tag = "<span>" + txt + "</span>";
			$(sortBasket).append(tag);
			var appendedObj = $(sortBasket).children('span').last();
			$(appendedObj).data('data-label', label);
			$(appendedObj).data('data-value', value);
			$(appendedObj).bind('click', function(){
				$(this).fadeOut(150, function(){
					var l = $(this).data('data-label');
					var v = $(this).data('data-value');
					var idx = 0;
					for(var i = 0; i < productVariable.filter[l].length; i++){
						if(v == productVariable.filter[l][i])
						{
							idx = i;
							break;
						}
					}
					productVariable.filter[l].splice(idx, 1);
					$(this).remove();
					if($(sortBasket).find('span').length == 0)
						$(sortBasket).hide();
				});;
			});
		}
	}
}
function do_sort(){
	var label = [];
	var value = [];
	var rangeLabel = [];
	var min = [];
	var max = [];
	$(".board-sort .sort-basket span").each(function(){
		label.push($(this).data('data-label'));
		value.push($(this).data('data-value'));
	});

	for(v in productVariable.number){
		if(productVariable.number[v].min != -1 ){
			rangeLabel.push(v);
			min.push(productVariable.number[v].min);
			max.push(productVariable.number[v].max);
		}
	}
	var param = '&action=datasorting';
	for(var i = 0; i < label.length; i++){
		param += '&label=' + label[i];
	}
	for(var i = 0; i < value.length; i++){
		param += '&value=' + value[i];
	}
	for(var i = 0; i < rangeLabel.length; i++){
		param += '&rangelabel=' + rangeLabel[i] + '&min=' + min[i] + '&max=' + max[i];
	}
	param = encodeURI(param);

	location.hash = 'board?' + 'url=' + productVariable.tag + param;
}