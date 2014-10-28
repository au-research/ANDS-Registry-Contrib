$(document).on('click', '#linkChecker', function(){
	var app_id = $(this).attr('app_id');
	$('#viewLinkCheckerLogModal .modal-body').html('<p>Loading...</p><div class="progress progress-striped active"><div class="bar" style="width: 100%;"></div></div>');
	$('#viewLinkCheckerLogModal').modal('show');
	$.ajax({
		url:apps_url+'mydois/runDoiLinkChecker', 
		type: 'POST',
		data: {app_id:app_id},
		success: function(data){
			if(data.status=='SUCCESS'){
				$('#viewLinkCheckerLogModal .modal-body').html(data.message);																				
			}
		}
	});
});
$(document).on('change','input:radio[name="xml_input"]',function(e){
    var toDisplay = this.value;
	var radio = $('input[name="xml_input"]')
	$.each(radio,function(){$('#'+this.value).css('display','none')});
    $('#'+toDisplay).css('display','block')

})
$(document).on('click', '#doi_mint_confirm', function(){
    if($(this).hasClass('disabled')) return false;
    $(this).button('loading');
    $("#loading").html('Loading....')
    var theButton = this;
    var doi = $("input[name='doi']").val();
    var doi_url = $("input[name='url']").val();
    var xml = $("input[name='xml']").val();
    var client_id = $("input[name='client_id']").val();
    var app_id= $("input[name='app_id']").val();
    var url = apps_url+'mydois/mint.json/?manual_mint=true&url='+doi_url+'&app_id='+app_id;

    $.ajax({
        url: url,
        type: 'POST',
        data: {doi_id:doi, xml:xml, client_id:client_id},
        success: function(data){
            if(data.response.type=='failure'){
                var message =  data.response.message;
                if(data.response.verbosemessage!='') message = message + ' <br /><i>'+data.response.verbosemessage+'</i>'
                $('#mint_result').css('white-space','normal')
                $('#mint_result').html(message).addClass('label label-important');
                $(theButton).button('reset');
                $("#loading").html('');
            }else{
                $('#mint_result').html(message).removeClass('label label-important');
                $('#mint_result').html(data.response.message);
                $("#loading").html('');
                $('#doi_mint_confirm').addClass('hide');
                $('#doi_mint_close').removeClass('hide');
            }
        },
        error: function(data){
            console.log(data.response)
        }
    });
})

$(document).on('click', '#doi_mint_close', function(){
    location.reload();
})
$(document).on('click', '#doi_mint_close_x', function(){
    location.reload();
})
$(document).on('change','#fileupload',function(e){
    $('#mint_result').html('').removeClass('label label-important');
    var file = this.files[0];
    type = file.type;
    if(type=='text/xml'){
        var fd = new FormData;
        fd.append('file', file);

        var xhr = new XMLHttpRequest();
        var uploadurl = apps_url+'mydois/uploadFile';

        xhr.file = file; // not necessary if you create scopes like this
        xhr.addEventListener('progress', function(e) {
            var done = e.position || e.loaded, total = e.totalSize || e.total;
            //console.log('xhr progress: ' + (Math.floor(done/total*1000)/10) + '%');
        }, false);
        if ( xhr.upload ) {
            xhr.upload.onprogress = function(e) {
                var done = e.position || e.loaded, total = e.totalSize || e.total;
               // console.log('xhr.upload progress: ' + done + ' / ' + total + ' = ' + (Math.floor(done/total*1000)/10) + '%');
            };
        }
        xhr.onreadystatechange = function(e) {
            if ( 4 == this.readyState ) {
                var jsonObj = eval('('+this.response+')')
                console.log(jsonObj.xml)
                $("#xmldisplay").html('<pre>'+ htmlEntities(jsonObj.xml)+'</pre>').text()
                $("input[name='xml']").val(jsonObj.xml);
            }
        };
        xhr.open('post', uploadurl, true);
        xhr.send(fd);
    }else{
        $('#mint_result').html('Only files of type text/xml accepted').addClass('label label-important');
    }
});

function htmlEntities(str) {
    return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}
