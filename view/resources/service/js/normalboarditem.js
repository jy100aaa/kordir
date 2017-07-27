var boardVar = {
	password: ''
};
function delete_item(){
	draw_general_popup(
			function(){
				do_delete();
			},
			null, 
			null,
			stringTable.askDelete, 
			stringTable.yes, 
			stringTable.no
	);
}
function delete_item_sub(){
	draw_functional_popup(function(){
			draw_progress();
			boardVar.password = $("#functional-popup-panel > div > input").val();
			var data = {
				password: boardVar.password,
				serviceId: serverData.serviceId,
				seq: serverData.seq,
				tag:  serverData.tag
			};
			$.ajax({
				url : "/requestreceiver/",
				type : "post",
				data :{
					req_type : "check_board_password",
					data: JSON.stringify(data)
				},
				success : function(response){
					remove_progress();
					if(response.result == 'ok'){
						close_functional_popup();
						do_delete();
					} else {	
						$("#functional-popup-panel .functional-popup-wrapper .functional-popup-error-message").text(stringTable.wrongPassword);
					}
				},
				error : function(){
					remove_progress();
				}
			});
		},
		function(){
			close_functional_popup();
		}, 
		stringTable.checkPassword, 
		stringTable.checkPasswordIntro, 
		stringTable.ok, 
		stringTable.cancel, 
		'text');
	$("#functional-popup-panel > div > input").attr('type', 'password');
}
function do_delete(){
	draw_progress();
	var data = {
		boardType: serverData.boardType,
		tag: serverData.tag,
		seq: serverData.seq,
		userId: serverData.userId,
		serviceId: serverData.serviceId,
		password: boardVar.password
	};
	$.ajax({
		url : "/requestreceiver/",
		type : "post",
		data :{
			req_type : "boarditem_delete",
			data: JSON.stringify(data)
		},
		success : function(response){
			remove_progress();			
			if(response.result == 'ok'){
				draw_general_popup(
					function(){
						window.history.back();
					},
					null, 
					null, 
					stringTable.deleteSuccess, 
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
function connection_status_change(type){}
function connection_established(){}
