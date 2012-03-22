function showParamHeaders(){
	if($("#allparameters").find(".realinputvalue").length > 0){
	  $("#allparameters").show();  
	} else {
	  $("#allparameters").hide();
	}
}

$(".fakeinputname").blur( function() {
	var newparamname = $(this).val();
	$(this).parent().parent().parent().parent().find(".realinputvalue").attr("name", newparamname);
});


$(".close").click ( function() {
    $(this).parent().remove();
    showParamHeaders();
});

$("#addprambutton").click ( function() {
    $('.httpparameter:first').clone(true).appendTo("#allparameters");
    showParamHeaders();
    return false;
});

$("#addfilebutton").click ( function() {
    $('.httpfile:first').clone(true).appendTo("#allparameters");
    showParamHeaders();
    return false;
});


function postToIframe(){
	var paramform = $("#paramform");
	if($("#httpmethod").val() == "POST"){
		paramform.attr("enctype", "multipart/form-data");
	} else {
		paramform.attr("enctype", "");
	}
	paramform.attr("target", "outputframe");
	paramform.attr("action", $("#urlvalue").val());
	paramform.attr("method", $("#httpmethod").val());
	 $("#outputframe").show();
	 $("#ajaxoutput").hide();
	 $("#formspinner").show();
	paramform.submit();
	return false;	
}

function postWithAjax(){
	var mydata = {};
	var parameters = $("#allparameters").find(".realinputvalue");
	for(i = 0; i < parameters.length; i++){
		name = $(parameters).eq(i).attr("name");
		if(name == undefined || name == "undefined"){
			continue;	
		}
		value = $(parameters).eq(i).val();
		mydata[name] = value 
	}
	
	var myajax = {
		url: $("#urlvalue").val(),
		type: $("#httpmethod").val(),
		complete: function(jqXHR){
			$("#outputpre").text(jqXHR.responseText)
			$("#statuspre").text("HTTP " + jqXHR.status + " " + jqXHR.statusText);
			if(jqXHR.status >= 200 && jqXHR.status < 300){
			  $("#statuspre").addClass("alert-success");
			} else if(jqXHR.status >= 400) {
			  $("#statuspre").addClass("alert-error");
			} else {
			  $("#statuspre").addClass("alert-warning");
			}
		}
	};
	
	if(jQuery.isEmptyObject(mydata)){
		myajax.contentType = 'application/x-www-form-urlencoded';
	} else {
		myajax.data = mydata;
	}
	
	 $("#outputframe").hide();
	 $("#outputpre").empty();
	 $("#outputframe").attr("src", "")
	 $("#ajaxoutput").show();
	 $("#statuspre").text("0");	
	 $("#statuspre").removeClass("alert-success");	 
	 $("#statuspre").removeClass("alert-error");
	 $("#statuspre").removeClass("alert-warning");
	
	$.ajax(myajax);
}

$('#ajaxspinner').ajaxStart(function() {
	$(this).show();
});

$('#ajaxspinner').ajaxStop(function() {
	$(this).hide();
});

$("#submitform").click ( function() {
	checkForFormFiles()
	$("#outputframe").replaceWith('<iframe name="outputframe" id="outputframe" class="input-xxlarge"></iframe>');
	$('#outputframe').load(function() {
	    $("#formspinner").hide();
	});	
	var method = $("#httpmethod").val();
	if(method != "GET" && method != "POST"){
		alert("Form method only supports GET and POST");
		return;
	}
	postToIframe();
	return false;
});

$("#submitajax").click ( function() {
    checkForAjaxFiles();
	postWithAjax();
	return false;
});

function checkForAjaxFiles(){
  if($("#paramform").find(".input-file").length > 0){  
	  $("#errordiv").append('<div class="alert alert-error"> <a class="close" data-dismiss="alert">&times;</a> <strong>Alert!</strong> You are trying to do an Ajax request with posting files. This will not work on most browsers. Use the form request method instead to upload files. </div>');
  }
}

function checkForFormFiles(){
  var method = $("#httpmethod").val();
  if(method == "POST") return;
  if($("#paramform").find(".input-file").length > 0){  
	  $("#errordiv").append('<div class="alert alert-error"> <a class="close" data-dismiss="alert">&times;</a> <strong>Alert!</strong> You are posting a form using method ' + method + ' but your request contains files. You can only upload files using HTTP POST method. </div>');
  }
}


