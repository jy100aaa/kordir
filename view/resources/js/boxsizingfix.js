$(function(){
	$('.box-sizing-fallback').each(function(){
		var fullW = $(this).outerWidth(),
       			actualW = $(this).width(),
                wDiff = fullW - actualW,
                newW = actualW - wDiff;
		$(this).css({
			'width': newW,
			'visibility': 'visible'
		});
	});
});