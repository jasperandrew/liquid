let tables = [];
tables[0] = new Tabulator("#table1", {
    layout:"fitData",
    placeholder:"No Data Set",
    columns:[]
});
tables[1] = new Tabulator("#table2", {
    layout:"fitData",
    placeholder:"No Data Set",
    columns:[]
});
tables[2] = new Tabulator("#table3", {
    layout:"fitData",
    placeholder:"No Data Set",
    columns:[]
});

const API_URL = 'https://spurcell.pythonanywhere.com/';

function loadTableData(url, tableIdx){
    var data = [], cols = [];

    fetch(url)
    .then(response => response.json())
    .then(json => json.forEach(row => {
        data.push(row);
    }))
    .then(function(){
        for(item in data[0]){
            if(typeof(data[0][item]) === "object"){
                var subcols = [];
                for(i in data[0][item]){
                    subcols.push({title:i, field:item + '.' + i});
                }
                cols.push({ title:item, columns:subcols });
            }else{
                cols.push({ title:item, field:item });
            }
        }

        console.log(cols,data);
        tables[tableIdx].setColumns(cols);
        tables[tableIdx].setData(data);
    });
}

/**
 * index.js
 * - All our useful JS goes here, awesome!
 */
//$(document).foundation();

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
				this.getTableFromRaw(input);
		});
	},
	"getTableFromRaw": function(source, table) {
		function push(data, name) {
			fetch(API_URL + 'throwin_file/' + name, {
				method: "POST",
				body: data
			})
			.then(response => {
                console.log(response);
                return response.json();
            })
			.catch(err => console.log('[Upload error] ' + err))
			.then(json => tableManager.setTable(table, json['col_list'], json['table_data']));
		}

		if(source === 'file'){
			let reader = new FileReader(),
				file = document.querySelector('#file').files[0];
			reader.onload = e => push(e.target.result, file.name);
			reader.readAsText(file);
		}
	},
	"getUpdatedTable": function(data, table) {
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
	"setTable": function(table, columns, data) {
        let cols = [];
        for(i in columns) cols.push({ title:columns[i].toUpperCase(), field:columns[i] });
        console.log(cols, data);
		tables[table].setColumns(cols);
		tables[table].setData(data);
	}
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

document.querySelector("#load").addEventListener('click', function(){
    //loadTableData('https://jsonplaceholder.typicode.com/users', 0);
    tableManager.getTableFromRaw('file', 0);
    loadTableData('https://jsonplaceholder.typicode.com/posts', 1);
    loadTableData('https://jsonplaceholder.typicode.com/comments', 2);
});