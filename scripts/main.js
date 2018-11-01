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

/**************************************************************************
 * JSX stuff
 */
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

var Throwin =
/*#__PURE__*/
function (_React$Component2) {
  _inherits(Throwin, _React$Component2);

  function Throwin(props) {
    _classCallCheck(this, Throwin);

    return _possibleConstructorReturn(this, _getPrototypeOf(Throwin).call(this, props));
  }

  _createClass(Throwin, [{
    key: "render",
    value: function render() {
      return React.createElement("div", {
        className: this.props.type,
        id: 't' + this.props.i
      });
    }
  }]);

  return Throwin;
}(React.Component);

var Tab =
/*#__PURE__*/
function (_React$Component3) {
  _inherits(Tab, _React$Component3);

  function Tab(props) {
    _classCallCheck(this, Tab);

    return _possibleConstructorReturn(this, _getPrototypeOf(Tab).call(this, props));
  }

  _createClass(Tab, [{
    key: "render",
    value: function render() {
      var _this = this;

      var id = 'tab' + this.props.i;
      return React.createElement("div", {
        className: "tab"
      }, React.createElement("input", {
        type: "radio",
        id: id,
        name: "tabs",
        defaultChecked: this.props.isChecked
      }), React.createElement("label", {
        onClick: function onClick() {
          return tabManager.setActiveTab(_this.props.i);
        },
        htmlFor: id
      }, this.props.tabName), React.createElement("div", {
        className: "throwin"
      }, React.createElement(Throwin, {
        type: this.props.type,
        i: this.props.i
      })));
    }
  }]);

  return Tab;
}(React.Component);

var TabContainer =
/*#__PURE__*/
function (_React$Component4) {
  _inherits(TabContainer, _React$Component4);

  function TabContainer(props) {
    _classCallCheck(this, TabContainer);

    return _possibleConstructorReturn(this, _getPrototypeOf(TabContainer).call(this, props));
  }

  _createClass(TabContainer, [{
    key: "render",
    value: function render() {
      var tabs = [];
      tabManager.data.forEach(function (tab) {
        tabs.push(tab.tabElement);
      });
      return React.createElement("div", {
        className: "tabs"
      }, tabs);
    }
  }]);

  return TabContainer;
}(React.Component);
/**************************************************************************
 * 
 */


var tabManager = {
  data: [],
  activeTab: 1,
  setActiveTab: function setActiveTab(i) {
    this.activeTab = i;
    console.log(this.activeTab);
  },
  addTab: function addTab(name, contentType, contentSource, content) {
    var n = this.data.length + 1;
    this.data.push({
      tabElement: React.createElement(Tab, {
        key: n,
        i: n,
        isChecked: n === this.activeTab ? true : false,
        tabName: name,
        type: contentType
      }),
      throwin: {
        name: name,
        id: '#t' + n,
        type: contentType,
        src: contentSource,
        content: content,
        object: null
      }
    });
  },
  render: function render() {
    ReactDOM.render(React.createElement(TabContainer, null), document.querySelector('#tab_container'));
    this.data.forEach(function (tab) {
      var t = tab.throwin;

      if (t.type === 'table') {
        if (!t.object) {
          t.object = new Tabulator(t.id, {
            layout: 'fitData',
            placeholder: 'Loading...'
          });
        }

        if (t.src === 'fetch') {
          fetch(t.content).then(function (response) {
            return response.json();
          }).then(function (json) {
            t.content = {
              cols: [],
              rows: []
            };
            t.src = 'local';
            json.forEach(function (row) {
              return t.content.rows.push(row);
            });

            for (var item in t.content.rows[0]) {
              t.content.cols.push({
                title: item,
                field: item,
                editor: 'input'
              });
            }

            t.object.setColumns(t.content.cols);
            t.object.setData(t.content.rows);
          });
        } else {
          console.log(t.content);
          t.object.setColumns(t.content.cols);
          t.object.setData(t.content.rows);
        }
      } else if (t.type === 'text') {
        document.querySelector(t.id).innerHTML = t.content;
      }
    });
  }
};
var testTable = {
  cols: [{
    title: 'A',
    field: 'a'
  }, {
    title: 'B',
    field: 'b'
  }],
  rows: [{
    a: 1,
    b: 2
  }, {
    a: 3,
    b: 4
  }]
};
tabManager.addTab('Hard-coded Table', 'table', 'local', testTable);
tabManager.addTab('Web API Call', 'table', 'fetch', 'https://jsonplaceholder.typicode.com/posts');
tabManager.addTab('Hard-coded Text', 'text', 'local', 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.');
tabManager.render();
ReactDOM.render(React.createElement(Dialogue, {
  prompt: "Let's begin! For your initial table/list, would you like to:"
}), document.querySelector('#dialogue_container'));
var API_URL = 'https://spurcell.pythonanywhere.com/'; // let eventHandler = {
// 	'eventMap': {
// 		 'click .upload': 'tableManager.uploadEventHandler',
// 	},
// 	'init': function() {
// 		this.eventManager(tableManager, this.eventMap);
// 	},
// 	'eventManager': function(namespace, eventMap) {
// 		$.each(eventsMap, function(eventTypeSelector, handler) {
// 			var a = eventTypeSelector.split(' ');
// 			var eventType = a[0];
// 			var selector = a[1];
// 			$(selector).off(eventType);
// 			if(handler.indexOf('.') > -1){
// 				var submodule = handler.split('.')[0];
// 				var submoduleHandler = handler.split('.')[1];
// 				$(selector).on(eventType, function(event) {
// 						namespace[submodule][submoduleHandler](event);
// 				});
// 			} else {
// 					$(selector).on(eventType, function(event) {
// 							namespace[handler](event);
// 					});
// 			}
// 		});
// 	}
// };

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
        cmd_name: 'throwin_file',
        file_name: name
      };
      fetch(API_URL + 'cmd', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: encodeURI('json_data=' + JSON.stringify(json_data) + '&file_contents=' + filestr)
      }).then(function (response) {
        //console.log(response.text());
        return response.json();
      }).catch(function (err) {
        return console.log('[UploadError] ' + err);
      }).then(function (json) {
        console.log(json);
        var content = {
          cols: [],
          rows: json.table_data
        };
        json.col_list.forEach(function (col) {
          return content.cols.push({
            title: col,
            field: col
          });
        });
        tabManager.addTab(name, 'table', 'local', content);
        tabManager.render();
      }); // .then(json => tableManager.setTable(table, json['col_list'], json['table_data']));
    }

    if (source === 'file') {
      var reader = new FileReader(),
          file = document.querySelector('#file').files[0];

      if (!file) {
        alert('Select a file from your computer');
        return;
      }

      reader.onload = function (e) {
        // console.log(e.target.result);
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
  tableManager.getTableFromRaw('file');
});