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

/************************************************************\
*                           GLOBALS                          *
\************************************************************/
var API_URL = 'https://spurcell.pythonanywhere.com/';
/************************************************************\
*                         JSX CLASSES                        *
\************************************************************/
//// Dialogue question/answer stuff ////

var Option =
/*#__PURE__*/
function (_React$Component) {
  _inherits(Option, _React$Component);

  function Option(props) {
    _classCallCheck(this, Option);

    return _possibleConstructorReturn(this, _getPrototypeOf(Option).call(this, props));
  }

  _createClass(Option, [{
    key: "render",
    value: function render() {
      return React.createElement("div", {
        className: "option"
      }, React.createElement("input", {
        type: "radio",
        id: 'opt' + this.props.i,
        name: "options",
        value: this.props.optId
      }), React.createElement("label", {
        htmlFor: 'opt' + this.props.i
      }, this.props.optText));
    }
  }]);

  return Option;
}(React.Component);

var Dialogue =
/*#__PURE__*/
function (_React$Component2) {
  _inherits(Dialogue, _React$Component2);

  function Dialogue(props) {
    _classCallCheck(this, Dialogue);

    return _possibleConstructorReturn(this, _getPrototypeOf(Dialogue).call(this, props));
  }

  _createClass(Dialogue, [{
    key: "render",
    value: function render() {
      var options = [];
      Liquid.dialogueManager.history[0].options.forEach(function (opt) {
        options.push(opt.jsxElement);
      });
      return React.createElement("div", {
        className: "dialogue"
      }, React.createElement("p", {
        className: "prompt"
      }, this.props.prompt), options);
    }
  }]);

  return Dialogue;
}(React.Component); //// Throwin/tab layout stuff ////


var Throwin =
/*#__PURE__*/
function (_React$Component3) {
  _inherits(Throwin, _React$Component3);

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
function (_React$Component4) {
  _inherits(Tab, _React$Component4);

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
          return Liquid.tabManager.setActiveTab(_this.props.i);
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
function (_React$Component5) {
  _inherits(TabContainer, _React$Component5);

  function TabContainer(props) {
    _classCallCheck(this, TabContainer);

    return _possibleConstructorReturn(this, _getPrototypeOf(TabContainer).call(this, props));
  }

  _createClass(TabContainer, [{
    key: "render",
    value: function render() {
      var tabs = [];
      Liquid.tabManager.data.forEach(function (tab) {
        tabs.push(tab.jsxElement);
      });
      return React.createElement("div", {
        className: "tabs"
      }, tabs);
    }
  }]);

  return TabContainer;
}(React.Component);
/************************************************************\
*                         LIQUID APP                         *
\************************************************************/


var Liquid = {
  initialize: function initialize() {
    this.dialogueManager.history.push({
      prompt: 'Initial',
      id: null,
      data: null,
      options: [{
        jsxElement: React.createElement(Option, {
          key: 1,
          i: 1,
          isDefault: 0,
          optText: "Upload a file from your computer",
          optId: "upload"
        }),
        isDefault: 0,
        optText: 'Upload a file from your computer',
        optId: 'upload'
      }, {
        jsxElement: React.createElement(Option, {
          key: 2,
          i: 2,
          isDefault: 0,
          optText: "Call a web API or database",
          optId: "call"
        }),
        isDefault: 0,
        optText: 'Call a web API or database',
        optId: 'call'
      }]
    });
  },
  renderAll: function renderAll() {
    this.dialogueManager.render();
    this.tabManager.render();
  },
  handleResponse: function handleResponse(responseJSON) {
    if (responseJSON['reply_type'] === 'user_question') {
      this.dialogueManager.newQuestion(responseJSON);
    }
  },
  //// Manages question/answer dialogue ////
  dialogueManager: {
    history: [],
    // History of all questions
    currPos: 0,
    // Current history position (0 is the latest one, increasing numbers are older)
    newQuestion: function newQuestion(responseJSON) {
      var options = [];

      for (var i in responseJSON['answ_cands']) {
        var opt = responseJSON['answ_cands'][i];
        options.push({
          jsxElement: React.createElement(Option, {
            key: i + 1,
            i: i + 1,
            isDefault: 0,
            optText: opt['answ_text'],
            optId: opt['answ_id']
          }),
          isDefault: 0,
          optText: opt['answ_text'],
          optId: opt['answ_id']
        });
      }

      this.history.unshift({
        prompt: responseJSON['qst_text'],
        id: responseJSON['qst_id'],
        data: responseJSON['qst_data'],
        options: options
      }); // console.log(this.history);
    },
    render: function render() {
      ReactDOM.render(React.createElement(Dialogue, {
        prompt: this.history[0].prompt
      }), document.querySelector('#dialogue_container'));
    }
  },
  //// Manages throwin/tab layout ////
  tabManager: {
    data: [],
    // All tabs
    activeTab: 1,
    // Currently active tab
    addTab: function addTab(name, contentType, contentSource, content) {
      var n = this.data.length + 1;
      this.data.push({
        jsxElement: React.createElement(Tab, {
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
            // console.log(t.content);
            t.object.setColumns(t.content.cols);
            t.object.setData(t.content.rows);
          }
        } else if (t.type === 'text') {
          document.querySelector(t.id).innerHTML = t.content;
        }
      });
    },
    setActiveTab: function setActiveTab(i) {
      this.activeTab = i;
    }
  },
  //// Manages user-created file uploads ////
  uploadManager: {
    // uploadEventHandler: function(upload) {
    // 	$(upload).on('change', function (input) {
    // 			this.newTableFromFile(input);
    // 	});
    // },
    newTableFromFile: function newTableFromFile() {
      var reader = new FileReader(),
          file = document.querySelector('#file').files[0];

      if (!file) {
        alert('Select a file from your computer');
        return;
      }

      reader.onload = function (e) {
        var json_data = {
          task_name: 'liquid_gui',
          // will vary with tasks
          cmd_name: 'throwin_file',
          file_name: file.name
        };
        fetch(API_URL + 'cmd', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
          },
          body: encodeURI('json_data=' + JSON.stringify(json_data) + '&file_contents=' + e.target.result)
        }).then(function (response) {
          //console.log(response);
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
          Liquid.tabManager.addTab(file.name, 'table', 'local', content);
          Liquid.tabManager.render();
          Liquid.dialogueManager.newQuestion(json);
          Liquid.dialogueManager.render();
        });
      };

      reader.readAsText(file);
    },
    getUpdatedTable: function getUpdatedTable(data, table) {
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
  }
}; // let eventHandler = {
// 	'eventMap': {
// 		 'click .upload': 'uploadManager.uploadEventHandler',
// 	},
// 	'init': function() {
// 		this.eventManager(uploadManager, this.eventMap);
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

document.querySelector('#load').addEventListener('click', function () {
  Liquid.uploadManager.newTableFromFile('file');
}); // Liquid.tabManager.addTab('Hard-coded Table', 'table', 'local', {
// 	cols: [
// 		{title: 'Ay', field: 'a'},
// 		{title: 'Be', field: 'b'}
// 	],
// 	rows: [
// 		{ a:1, b:2 },
// 		{ a:3, b:4 }
// 	]
// });
// Liquid.tabManager.addTab('Web API Call', 'table', 'fetch', 'https://jsonplaceholder.typicode.com/posts');
// Liquid.tabManager.addTab('Hard-coded Text', 'text', 'local', 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.');

Liquid.initialize();
Liquid.renderAll();
console.log({
  reply_contents: ['user_question', 'table_data'],
  // An array containing the other sections contained in the response
  user_question: {
    // All of the data pertaining to a new user question
    qst_prompt: 'Question prompt',
    qst_id: 'qst1',
    qst_opts: [{
      opt_text: 'Option 1',
      opt_id: 'opt1'
    }, {
      opt_text: 'Option 2',
      opt_id: 'opt2'
    }]
  },
  table_data: {
    // All of the data pertaining to a table
    new_tbl: true,
    // Whether or not this table is a new table or an updated table
    tbl_name: 'table1.tsv',
    // The name of the table
    tbl_cols: [// Column data, in order
    {
      title: 'Column 1',
      // The "pretty" name for the column. Can just be the same as the field.
      field: 'col1' // The actual name of the field in the row data

    }, {
      title: 'Column 2',
      field: 'col2'
    }],
    tbl_rows: [// Row data, exactly the same as 'table_data' in the current spec
    {
      col1: 'row1 col1',
      col2: 'row1 col2'
    }, {
      col1: 'row2 col1',
      col2: 'row2 col2'
    }]
  }
});