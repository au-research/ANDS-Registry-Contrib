$(document).on('click', '#linkChecker', function(){
	var app_id = $(this).attr('app_id');
	$('#viewLinkCheckerLogModal .modal-body').html('<p>Loading...</p><div class="progress progress-striped active"><div class="bar" style="width: 100%;"></div></div>');
	$('#viewLinkCheckerLogModal').modal('show');
	$.ajax({
		url:apps_url+'mydois/runDoiLinkChecker', 
		type: 'POST',
		data: {app_id:app_id},
		success: function(data){
			$('#viewLinkCheckerLogModal .modal-body').html(data.message);																				
		},
	});
});