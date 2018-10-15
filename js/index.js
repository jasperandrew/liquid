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
    //Just like Jasper's load table function
  }
};

var jasperTabulator = {
  var tabs = new SimpleTabs(document.getElementById('tabs'));

  var tables = [];
  tables[0] = new Tabulator("#table1", {
      height:"311px",
      layout:"fitData",
      placeholder:"No Data Set",
      columns:[]
  });
  tables[1] = new Tabulator("#table2", {
      height:"311px",
      layout:"fitData",
      placeholder:"No Data Set",
      columns:[]
  });
  tables[2] = new Tabulator("#table3", {
      height:"311px",
      layout:"fitData",
      placeholder:"No Data Set",
      columns:[]
  });

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

              tables[tableIdx].setColumns(cols);
              tables[tableIdx].setData(data)
          });
  }

  function redrawTable(){
      console.log(this.classList[0].slice(-1)-1)
      tables[this.classList[0].slice(-1)-1].redraw(true);
      this.removeEventListener('click', redrawTable);
  }

  document.querySelector("#load").addEventListener('click', function(){
      loadTableData('https://jsonplaceholder.typicode.com/users', 0);
      loadTableData('https://jsonplaceholder.typicode.com/posts', 1);
      loadTableData('https://jsonplaceholder.typicode.com/comments', 2);

      document.querySelector('li.table1').addEventListener('click', redrawTable);
      document.querySelector('li.table2').addEventListener('click', redrawTable);
      document.querySelector('li.table3').addEventListener('click', redrawTable);
  });

  window.addEventListener('resize', function(){
      tables[0].redraw();
      tables[1].redraw();
      tables[2].redraw();
  });
};

var questionHandler = {
  "questionMap": {
    "question1": {
      "questionText": "lorem ipsum",
      "answerOptions": [
        {"yes": handler},
        {"no": handler}
      ]
    }
  }
};