let testPresets = [
    {
        name: "Get Example ",
        urlvalue: "https://httpbin.org/get",
        httpmethod: "GET",
        headers: [
            { name: 'CUST-customheader', value: 'Any Value' }],
        parameters: [{ name: 'my-qs-param', value: 'qs-value' }],
        remindermessage: "These Presets Are Stored In testPresets",
        encodeparameters: false
    },
    {
        name: "Post Example",
        urlvalue: "https://httpbin.org/post",
		httpmethod: "POST",
		contenttype: "application/json",
		body: '{ "a-json": "object" }',
        remindermessage: "These Presets Are Stored In testPresets"
    },
];

let prevApiResponseText;

function selectPreset() {
    let sp = testPresets.find(p => { return p.name === $("#presetselect").val() });
    resetForm();

    $("#httpmethod").val(sp.httpmethod);

    if (sp.remindermessage) {
        $("#remindermessage").text(sp.remindermessage);
        $("#reminderalertbox").show();
    } else {
        $("#reminderalertbox").hide();
    }

    if (sp.contenttype) {
		$("#contenttype").val(sp.contenttype);
		showBody(true);
    }

	if (sp.body) {
		$("#body").val(sp.body);
		showBody(true);
    }

    if (sp.headers) {
        sp.headers.forEach(h => {
            var newheaders = $('.httpparameter:first').clone(true);
            newheaders.find(".fakeinputname").val(h.name);
            newheaders.find(".realinputvalue").attr("name", h.name).val(h.value);
            newheaders.appendTo("#allheaders");
        })
        showHeaders();
    }

    if (sp.parameters) {
        sp.parameters.forEach(p => {
            var newparameters = $('.httpparameter:first').clone(true);
            newparameters.find(".fakeinputname").val(p.name);
            newparameters.find(".realinputvalue").attr("name", p.name).val(p.value);
            newparameters.appendTo("#allparameters");
        })
        showHeaders();
    }

    if (sp.encodeparameters) { $("#encodeparameterstickbox").prop('checked', true); }

    $("#urlvalue").val(sp.urlquerystring ? sp.urlvalue + "?" + sp.urlquerystring : sp.urlvalue);

}

$("#presetselect").change(function(e) {
    e.preventDefault();
    selectPreset();
});

$(document).ready(function() {
    testPresets.forEach(p => {
        $("#presetselect").append(new Option(p.name, p.name));
    })

});

function showHeaders() {
    showAuthHeaders();
    showHeaderHeaders();
	showParamHeaders();
	showBody();
}

function showAuthHeaders() {
    if ($("#authentication").find(".realinputvalue").length > 0) {
        $("#addauthbutton").hide();
        $("#authentication").show();
    } else {
        $("#addauthbutton").show();
        $("#authentication").hide();
    }
}

function showHeaderHeaders() {
    if ($("#allheaders").find(".realinputvalue").length > 0) {
        $("#allheaders").show();
    } else {
        $("#allheaders").hide();
    }
}

function showParamHeaders() {
    if ($("#allparameters").find(".realinputvalue").length > 0) {
        $("#allparameters").show();
    } else {
        $("#allparameters").hide();
    }
}

function showBody(body) {
	if(body) {
		$("#allbody").show();
		$("#addbodybutton").hide();
	} else {
		$("#allbody").hide();
		$("#addbodybutton").show();
	}
}

function resetForm() {
	$(".httpauth").not(':first').remove();
	$(".httpparameter").not(':first').remove();
	$(".httpfile").not(':first').remove();
	$("#encodeparameterstickbox").prop('checked', false);
	$("#contenttype").val("");
	$("#body").val("");
	$("#urlvalue").val("");
	$("#httpmethod").val("GET");
	$("#submitajaxicon").removeClass("icon-refresh icon-refresh-animate");
	$("#submitajaxicon").addClass("icon-download-alt");
	showHeaders();
}

//this specifies the parameter names
$(".fakeinputname").blur(function() {
    var newparamname = $(this).val();
    $(this).parent().parent().parent().parent().find(".realinputvalue").attr("name", newparamname);
});

$(".close").click(function(e) {
    e.preventDefault();
    $(this).parent().remove();
    showHeaders();
});

$("#addauthbutton").click(function(e) {
    e.preventDefault();
    if ($("#authentication").find(".realinputvalue").length == 0) {
        $('.httpauth:first').clone(true).appendTo("#authentication");
    }
    showHeaders();
});

$("#addheaderbutton").click(function(e) {
    e.preventDefault();
    $('.httpparameter:first').clone(true).appendTo("#allheaders");
    showHeaders();
});

$("#addprambutton").click(function(e) {
    e.preventDefault();
    $('.httpparameter:first').clone(true).appendTo("#allparameters");
    showHeaders();
});

$("#addfilebutton").click(function(e) {
    e.preventDefault();
    $('.httpfile:first').clone(true).appendTo("#allparameters");
    showHeaders();
});

$("#addbodybutton").click(function(e) {
	e.preventDefault();
	$('#allbody').show();
	showBody(true);
  });
  
$("#resetformbutton").click(function(e) {
	e.preventDefault();
	$("#presetselect").prop('selectedIndex',0);
    resetForm();
});

function postWithAjax(myajax) {
    myajax = myajax || {};
    myajax.url = $("#urlvalue").val() + buildArguments();
    myajax.type = $("#httpmethod").val();
    if (checkForAuth()) {
        myajax.username = $("#authentication input:first").val();
        myajax.password = $("#authentication input").eq(1).val();
    }
    myajax.complete = function(jqXHR) {
        prevApiResponseText = jqXHR.responseText;

        $("#statuspre").html(
            "HTTP " + jqXHR.status + " " + jqXHR.statusText + " <a target='_blank' href='https://developer.mozilla.org/en-US/docs/Web/HTTP/Status/" + jqXHR.status + "'>(details)</a>");

        if (jqXHR.status == 0) {
            httpZeroError();
        } else if (jqXHR.status >= 200 && jqXHR.status < 300) {
            $("#statuspre").addClass("alert-success");
        } else if (jqXHR.status >= 400) {
            $("#statuspre").addClass("alert-error");
        } else {
            $("#statuspre").addClass("alert-warning");
        }

        let responseText;
        try {
            responseText = JSON.parse(jqXHR.responseText);
            if (responseText && typeof responseText === "object") {
                if (responseText.token) {
                    var token = responseText.token;
                    var base64Url = token.split('.')[1];
                    var base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
                    var jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
                        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
                    }).join(''));
                    responseText = JSON.stringify(JSON.parse(jsonPayload), undefined, 2);
                } else {
                    responseText = JSON.stringify(responseText, null, 2)
                }
            }
        }
        catch (e) {
            responseText = jqXHR.responseText
        }

        $("#outputpre").text(responseText);
        $("#headerpre").text(jqXHR.getAllResponseHeaders());
    }

    if (jQuery.isEmptyObject(myajax.data)) {
        myajax.contentType = 'application/x-www-form-urlencoded';
    }

    $("#outputframe").hide();
    $("#outputpre").empty();
    $("#headerpre").empty();
    $("#outputframe").attr("src", "")
    $("#ajaxoutput").show();
    $("#statuspre").text("0");
    $("#statuspre").removeClass("alert-success");
    $("#statuspre").removeClass("alert-error");
    $("#statuspre").removeClass("alert-warning");

    $("#submitajaxicon").toggleClass("icon-download-alt icon-refresh icon-refresh-animate");
    var req = $.ajax(myajax).always(function() {
        $("#submitajaxicon").toggleClass("icon-download-alt icon-refresh icon-refresh-animate");
    });
}

$("#submitajax").click(function(e) {
	e.preventDefault();
	if (checkForBody()){
		postWithAjax({
			headers: createHeaderData(),
			data: createBodyData(),
			cache: false,
			contentType: getContentType()
		});
	} else if(checkForFiles()){
	  postWithAjax({
		headers: createHeaderData(),
		data : createMultipart(), 
		cache: false,
		contentType: false,
		processData: false  
	  });
	} else {
	  postWithAjax({
		headers : createHeaderData(),
		data : createUrlData()
	  });    
	}
});

$("#viewResultInNetTab").click(function(e) {
    e.preventDefault();
    //var newWindow = window.open("", "Title", "toolbar=no,location=no,directories=no,status=no,menubar=no,scrollbars=yes,resizable=yes,width=900,height=500");
    var newWindow = window.open("", "Title");
    newWindow.document.write(prevApiResponseText);
    newWindow.document.close();
});

function checkForFiles() {
    return $("#paramform").find(".input-file").length > 0;
}

function checkForAuth() {
    return $("#paramform").find("input[type=password]").length > 0;
}

function checkForBody() {
	return $("#paramform").find("#body").val().length > 0;
}

function buildArguments() {
	if(checkForBody()) {
		var parameters = $("#allparameters").find(".realinputvalue"), arguments  = "";
		for (i = 0; i < parameters.length; i++) {
			name = $(parameters).eq(i).attr("name");
			if (name == undefined || name == "undefined") {
				continue;
			}
			value = $(parameters).eq(i).val();
			arguments += (arguments.length === 0 ? "" : "&") + name + "=" + encodeURIComponent(value);
		}
		if(arguments.length === 0) {
			return "";
		} else {
			return "?" + arguments;
		}
	}
	return "";
}

function createUrlData(){
    var mydata = {};
    var parameters = $("#allparameters").find(".realinputvalue");
    for (i = 0; i < parameters.length; i++) {
        name = $(parameters).eq(i).attr("name");
        if (name == undefined || name == "undefined") {
            continue;
        }
        value = $(parameters).eq(i).val();
        mydata[name] = value
    }
    if (!$("#encodeparameterstickbox").is(":checked")) {
        return (mydata);
    } else {
        let encodedQueryString = "";
        Object.keys(mydata).forEach(key => { encodedQueryString += key + "=" + mydata[key] + "&" });
        encodedQueryString.slice(0, -1)
        return (btoa(encodedQueryString));
    }
}

function createMultipart(){
    //create multipart object
    var data = new FormData();

    //add parameters
    var parameters = $("#allparameters").find(".realinputvalue");
    for (i = 0; i < parameters.length; i++) {
        name = $(parameters).eq(i).attr("name");
        if (name == undefined || name == "undefined") {
            continue;
        }
        if(parameters[i].files){
            data.append(name, parameters[i].files[0]);
        } else {
            data.append(name, $(parameters).eq(i).val());
        }
    }
    return(data)
}

function createHeaderData(){
    var mydata = {};
    var parameters = $("#allheaders").find(".realinputvalue");
    for (i = 0; i < parameters.length; i++) {
        name = $(parameters).eq(i).attr("name");
        if (name == undefined || name == "undefined") {
            continue;
        }
        value = $(parameters).eq(i).val();
        mydata[name] = value
    }
    return(mydata);
}

function createBodyData() {
	return $("#body").val();
}

function getContentType() {
	return $("#contenttype").val();
}

function httpZeroError() {
    $("#errordiv").append('<div class="alert alert-error"> <a class="close" data-dismiss="alert">&times;</a> <strong>Oh no!</strong> Javascript returned an HTTP 0 error. One common reason this might happen is that you requested a cross-domain resource from a server that did not include the appropriate CORS headers in the response. Better open up your Firebug...</div>');
}