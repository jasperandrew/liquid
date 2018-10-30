"use strict";

function _typeof(obj) { if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

function _possibleConstructorReturn(self, call) { if (call && (_typeof(call) === "object" || typeof call === "function")) { return call; } return _assertThisInitialized(self); }

function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }

function _getPrototypeOf(o) { _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf : function _getPrototypeOf(o) { return o.__proto__ || Object.getPrototypeOf(o); }; return _getPrototypeOf(o); }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function"); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, writable: true, configurable: true } }); if (superClass) _setPrototypeOf(subClass, superClass); }

function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }

var Dialogue =
/*#__PURE__*/
function (_React$Component) {
  _inherits(Dialogue, _React$Component);

  function Dialogue(props) {
    _classCallCheck(this, Dialogue);

    return _possibleConstructorReturn(this, _getPrototypeOf(Dialogue).call(this, props));
  }

  _createClass(Dialogue, [{
    key: "render",
    value: function render() {
      return React.createElement("div", {
        className: "dialogue"
      }, React.createElement("p", {
        className: "prompt"
      }, this.props.prompt), React.createElement("div", {
        className: "option"
      }, React.createElement("input", {
        type: "radio",
        id: "ans1",
        name: "answers",
        value: "0"
      }), React.createElement("label", {
        htmlFor: "ans1"
      }, "Upload a file from your computer")), React.createElement("div", {
        className: "option"
      }, React.createElement("input", {
        type: "radio",
        id: "ans2",
        name: "answers",
        value: "1"
      }), React.createElement("label", {
        htmlFor: "ans2"
      }, "Query a database or call an API")));
    }
  }]);

  return Dialogue;
}(React.Component);

var Tab =
/*#__PURE__*/
function (_React$Component2) {
  _inherits(Tab, _React$Component2);

  function Tab(props) {
    _classCallCheck(this, Tab);

    return _possibleConstructorReturn(this, _getPrototypeOf(Tab).call(this, props));
  }

  _createClass(Tab, [{
    key: "render",
    value: function render() {
      var id = 'tab' + this.props.i;
      return React.createElement("div", {
        className: "tab"
      }, React.createElement("input", {
        type: "radio",
        id: id,
        name: "tabs",
        defaultChecked: this.props.isChecked
      }), React.createElement("label", {
        htmlFor: id
      }, this.props.tabName), React.createElement("div", {
        className: "content"
      }, React.createElement("div", {
        className: "table",
        id: 'table' + this.props.i
      })));
    }
  }]);

  return Tab;
}(React.Component);

var TabContainer =
/*#__PURE__*/
function (_React$Component3) {
  _inherits(TabContainer, _React$Component3);

  function TabContainer(props) {
    var _this;

    _classCallCheck(this, TabContainer);

    _this = _possibleConstructorReturn(this, _getPrototypeOf(TabContainer).call(this, props));
    _this.tabs = [];
    return _this;
  }

  _createClass(TabContainer, [{
    key: "render",
    value: function render() {
      this.tabs.push(React.createElement(Tab, {
        key: "0",
        i: "0",
        isChecked: false,
        tabName: "Test"
      }));
      this.tabs.push(React.createElement(Tab, {
        key: "1",
        i: "1",
        isChecked: false,
        tabName: "bologne.txt"
      }));
      return React.createElement("div", {
        className: "tabs"
      }, this.tabs);
    }
  }]);

  return TabContainer;
}(React.Component);

ReactDOM.render(React.createElement(Dialogue, {
  prompt: "Let's begin! For your initial table/list, would you like to:"
}), document.querySelector('#dialogue_container'));
ReactDOM.render(React.createElement(TabContainer, null), document.querySelector('#tab_container')); // let tables = [];
// tables[0] = new Tabulator('#table1', {
//     layout:'fitData',
//     placeholder:'No Data Set',
//     columns:[]
// });
// tables[1] = new Tabulator('#table2', {
//     layout:'fitData',
//     placeholder:'No Data Set',
//     columns:[]
// });
// tables[2] = new Tabulator('#table3', {
//     layout:'fitData',
//     placeholder:'No Data Set',
//     columns:[]
// });

var API_URL = 'https://spurcell.pythonanywhere.com/';

function loadTableData(url, tableIdx) {
  var data = [],
      cols = [];
  fetch(url).then(function (response) {
    return response.json();
  }).then(function (json) {
    return json.forEach(function (row) {
      data.push(row);
    });
  }).then(function () {
    for (item in data[0]) {
      if (_typeof(data[0][item]) === 'object') {
        var subcols = [];

        for (i in data[0][item]) {
          subcols.push({
            title: i,
            field: item + '.' + i
          });
        }

        cols.push({
          title: item,
          columns: subcols
        });
      } else {
        cols.push({
          title: item,
          field: item
        });
      }
    }

    console.log(cols, data);
    tables[tableIdx].setColumns(cols);
    tables[tableIdx].setData(data);
  });
} //$(document).foundation();


var eventHandler = {
  'eventMap': {
    'click .upload': 'tableManager.uploadEventHandler'
  },
  'init': function init() {
    this.eventManager(tableManager, this.eventMap);
  },
  'eventManager': function eventManager(namespace, eventMap) {
    $.each(eventsMap, function (eventTypeSelector, handler) {
      var a = eventTypeSelector.split(' ');
      var eventType = a[0];
      var selector = a[1];
      $(selector).off(eventType);

      if (handler.indexOf('.') > -1) {
        var submodule = handler.split('.')[0];
        var submoduleHandler = handler.split('.')[1];
        $(selector).on(eventType, function (event) {
          namespace[submodule][submoduleHandler](event);
        });
      } else {
        $(selector).on(eventType, function (event) {
          namespace[handler](event);
        });
      }
    });
  }
};
var tableManager = {
  'uploadEventHandler': function uploadEventHandler(upload) {
    $(upload).on('change', function (input) {
      this.getTableFromRaw(input);
    });
  },
  'getTableFromRaw': function getTableFromRaw(source, table) {
    function push(filestr, name) {
      var json_data = {
        task_name: 'liquid_gui',
        // will vary with tasks
        cmd_name: 'throwin'
      }; // console.log(encodeURI('json_data=' + JSON.stringify(json_data) + '&file_contents=' + filestr));

      fetch(API_URL + 'cmd', {
        method: 'POST',
        // headers: {
        //   'Accept': 'application/json, text/plain, */*',
        //   'Content-Type': 'application/json'
        // },
        body: encodeURI('json_data=' + JSON.stringify(json_data) + '&file_contents=' + filestr)
      }).then(function (response) {
        console.log(response);
        return response.json();
      }).catch(function (err) {
        return console.log('[Upload error] ' + err);
      }); // .then(json => tableManager.setTable(table, json['col_list'], json['table_data']));
    }

    if (source === 'file') {
      var reader = new FileReader(),
          file = document.querySelector('#file').files[0];

      reader.onload = function (e) {
        console.log(e.target.result);
        push(e.target.result, file.name);
      };

      reader.readAsText(file);
    }
  },
  'getUpdatedTable': function getUpdatedTable(data, table) {
    return $.ajax({
      type: 'post',
      data: data,
      dataType: 'json',
      url: liquidShawnUrl
    }).done(function (response) {
      this.updateTable(table, response);
    }).fail(function (error) {
      console.error('Error retrieving table: ', error);
    });
  },
  'setTable': function setTable(table, columns, data) {
    var cols = [];

    for (i in columns) {
      cols.push({
        title: columns[i].toUpperCase(),
        field: columns[i]
      });
    }

    console.log(cols, data);
    tables[table].setColumns(cols);
    tables[table].setData(data);
  }
}; // var questionHandler = {
// 	'questionMap': {
// 		'question1': {
// 			'questionText': 'lorem ipsum',
// 			'answerOptions': [
// 				{'yes': handler},
// 				{'no': handler}
// 			]
// 		}
// 	}
// };

document.querySelector('#load').addEventListener('click', function () {
  //loadTableData('https://jsonplaceholder.typicode.com/users', 0);
  tableManager.getTableFromRaw('file', 0); // loadTableData('https://jsonplaceholder.typicode.com/posts', 1);
  // loadTableData('https://jsonplaceholder.typicode.com/comments', 2);
});