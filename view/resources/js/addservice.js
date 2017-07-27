$(function(){
	var minHeight = $("#content").height() - $("#header-wrapper").outerHeight();
	$("#content").css('min-height',minHeight);
	var appendStr = "";
	for(var i = 0; i < locationMainArray.code.length; i++){
		appendStr += "<option value='"+locationMainArray.code[i]+"'>"+locationMainArray.value[i]+"</option>";
	}
	$("#service-info .input-line #service-location-main-input").append(appendStr);
	appendStr = "";
	for(var i = 0; i < serviceCategoryArray.code.length; i++){
		appendStr += "<option value='"+serviceCategoryArray.code[i]+"'>"+serviceCategoryArray.value[i]+"</option>";
	}
	$("#service-info .input-line .service-category-input").append(appendStr);
	$("#service-info .input-line #service-location-main-input").bind('change', function(){
		var subInputObj = $(this).parent().children('#service-location-sub-input');
		$(subInputObj).val('-1');
		$(subInputObj).children('option').each(function(){
			var val = $(this).prop('value');
			if(val != '-1'){
				$(this).remove();
			}
		});
		var val = $(this).val();
		var str = "";
		for (k in locationSub[val]){
			str += "<option value='"+k+"' class='sub-location'>"+locationSub[val][k]+"</option>";
		}
		$(subInputObj).append(str);
	});
	
	$("#service-info .input-line .service-domain-input").bind('blur', function(){
		var val = $(this).val();
		val = val.toLowerCase();
		val = val.replace('http://', '');
		val = val.replace('https://', '');
		if(val[0] == 'w' && val[1] == 'w' && val[2] == 'w'){
			val = val.substring(4);
		}
		$(this).val(val);
	});
	window.onbeforeunload = function(){
		return stringTable.warningBeforeLeaving;
	};
	$("#cancel-button").bind("click", function(){
	    window.onbeforeunload = null;
        window.location = '/settings?nav=service-management';
	});
	$("#finish-button").bind('click', function(){
	    submit();
	});
});
function submit(){
	$(".fillinfo-warning-area span").html('');
	var inputObj = {};
	$(".write-form-box .input-line").each(function(){
		var obj = $(this).find('input, select, textarea');
		if(obj.length > 0){
			for(var i = 0; i < obj.length; i++){
				var className = $(obj).eq(i).prop('class');
				if(className != ''){
					inputObj[className] = $(obj).eq(i);
					$(obj).eq(i).css('border', '1px solid gray');
				}
			}
		}
		return true;
	});
	var data = {
        'servicePicture': "default_service.jpg",
		'serviceName': $(inputObj['service-name-input']).val(),
		'serviceTag': $(inputObj['service-tag-input']).val(),
		'serviceDomain': $(inputObj['service-domain-input']).val(),
		'serviceCategory': $(inputObj['service-category-input']).val(),
		'serviceLocationMain': $(inputObj['service-location-input service-location-main-input']).val(),
		'serviceLocationSub': $(inputObj['service-location-input service-location-sub-input']).val(),
		'serviceWebsite': $(inputObj['service-website-input']).val(),
		'serviceTelephone': $(inputObj['service-telephone-input']).val(),
		'serviceDescription': $(inputObj['service-description-input']).val()
	};
	var stopLocation = 0x0000;
	var warningText = '';
	if(data['serviceName'].length < 2){
		$(inputObj['service-name-input']).css('border', '1px solid red');
		stopLocation |= 0x0010;
		warningText += stringTable.serviceNameLength + '<br>';
	}
	if(data['serviceTag'].length < 2){
		$(inputObj['service-tag-input']).css('border', '1px solid red');
		stopLocation |= 0x0010;
		warningText += stringTable.serviceTagLength + '<br>';
	}
	if(data['serviceCategory'] == null){
		$(inputObj['service-category-input']).css('border', '1px solid red');
		stopLocation |= 0x0010;
		warningText += stringTable.serviceCategoryEmpty + '<br>';
	}
	if(data['serviceLocationMain'] == null || data['serviceLocationSub'] == null){
		if(data['serviceLocationMain'] == null)
			$(inputObj['service-location-input service-location-main-input']).css('border', '1px solid red');
		if(data['serviceLocationSub'] == null)
			$(inputObj['service-location-input service-location-sub-input']).css('border', '1px solid red');
		stopLocation |= 0x0010;
		warningText += stringTable.serviceLocationEmpty + '<br>';
	}
	if(stopLocation & 0x0011){	
	    $(".fillinfo-warning-area").children('span').html(warningText);
        $(".fillinfo-warning-area").fadeIn();
		return;
	}
	draw_progress();
	$.ajax({
		url : "/requestreceiver/",
		type : "post",
		data :{
			req_type : "addservice",
			data : JSON.stringify(data),
			id : serverData.id
		},
		success : function(res){
			var response = {};
			response = res;
			remove_progress();
			if(response.result == 'ok'){
				draw_general_popup(
						function(){
							window.onbeforeunload = null;
							window.location = '/settings?nav=service-management';
						},
						null, 
						null, 
						stringTable.fillinfoDone, 
						stringTable.ok, 
						null
				);
			} else {	
				var error_code = response.error_code;
				if(error_code == 'tag exist'){
					$(inputObj['service-tag-input']).css('border', '1px solid red');
					$(".fillinfo-warning-area").children('span').html(stringTable.serviceTagExist);
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