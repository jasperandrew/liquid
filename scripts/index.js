/**
 * index.js
 * - All our useful JS goes here, awesome!
 */
$(document).foundation();

var eventHandler = {
	"eventMap": {
		 'click .upload': 'tableManager.uploadEventHandler',
	},
	"init": function() {
		this.eventManager(tableManager, this.eventMap);
	},
	"eventManager": function(namespace, eventMap) {
		$.each(eventsMap, function(eventTypeSelector, handler) {
			var a = eventTypeSelector.split(' ');
			var eventType = a[0];
			var selector = a[1];
			$(selector).off(eventType);
			if(handler.indexOf('.') > -1){
				var submodule = handler.split('.')[0];
				var submoduleHandler = handler.split('.')[1];
				$(selector).on(eventType, function(event) {
						namespace[submodule][submoduleHandler](event);
				});
			} else {
					$(selector).on(eventType, function(event) {
							namespace[handler](event);
					});
			}
		});
	}
};

var tableManager = {
	"uploadEventHandler": function(upload) {
		$(upload).on('change', function (input) {
				this.pushRawData(input);
		});
	},
	"pushRawData": function(input, table) {
		var nodeType;
		//Check for file type and set node name based on file extension
		return $.ajax({
				type: "post",
				data: {
					"fileData": input,
					"cmd_name": "throw_in",
					"file_name": input.name,
					"node_name": nodeType,
				},
				dataType: "json",
				url: liquidShawnUrl
			}).done(function(response) {
				this.updateTable(table, response);
			}).fail(function(error) {
				console.error('Error retrieving table: ', error);
			});
	},
	"pushTableData": function(data, table) {
		return $.ajax({
				type: "post",
				data: data,
				dataType: "json",
				url: liquidShawnUrl
			}).done(function(response) {
				this.updateTable(table, response);
			}).fail(function(error) {
				console.error('Error retrieving table: ', error);
			});
	},
	//table is the jquery selector to select which table to update
	"updateTable": function(table, response) {
		console.log(table, response);
	}
};

var jasperTabulator = {
};

// var questionHandler = {
// 	"questionMap": {
// 		"question1": {
// 			"questionText": "lorem ipsum",
// 			"answerOptions": [
// 				{"yes": handler},
// 				{"no": handler}
// 			]
// 		}
// 	}
// };

function createCORSRequest(method, url){
	var xhr = new XMLHttpRequest();
	if ("withCredentials" in xhr){
		xhr.open(method, url, true);
	} else if (typeof XDomainRequest != "undefined"){
		xhr = new XDomainRequest();
		xhr.open(method, url);
	} else {
		xhr = null;
	}
	return xhr;
}

function test() {
	var data = new FormData(),
		input = $('#file')[0].files[0];

	data.append('file', input);

	// $.ajax({
	// 	url : 'https://spurcell.pythonanywhere.com/throwin_file/' + input.name,
	// 	type : 'POST',
	// 	data : data,
	// 	processData: false,  // tell jQuery not to process the data
	// 	contentType: false,  // tell jQuery not to set contentType
	// 	success : function(response) {
	// 		console.log(response);
	// 	}
	// });
	
	var request = createCORSRequest("get", "http://spurcell.pythonanywhere.com/throwin_file/");
	if (request){
		request.onload = function() {
			console.log(request.responseText);
		};
		request.onreadystatechange = function() {
			console.log(request.responseText);
		};
		request.send(data);
	}

	//tableManager.pushRawData()
}