function delete_boarditem(data){
	draw_progress();
	$.ajax({
		url : "/requestreceiver/",
		type : "post",
		data :{
			req_type : "boarditem_delete",
			data: JSON.stringify(data)
		},
		success : function(response){
			console.log('response: ' + JSON.stringify(response));
			remove_progress();
			if(response.result == 'ok'){
				window.history.back();
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