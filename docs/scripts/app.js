"use strict";

function _typeof(obj) { if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

/************************************************************\
*                           GLOBALS                          *
\************************************************************/
var API_URL = 'https://spurcell.pythonanywhere.com/cmd';
var INIT_DIALOGUE = {
  prompt: 'Let\'s begin.  Choose the \'wizard\' interview or just start throwing in input and output files with the blue button.',
  id: null,
  data: null,
  options: [{
    jsxElement: React.createElement(OptionComponent, {
      key: 1,
      i: 1,
      isDefault: 0,
      optText: "Start the interview wizard",
      optId: "wizard"
    }),
    isDefault: 0,
    optText: 'Start the interview wizard',
    optId: 'wizard'
  }, {
    jsxElement: React.createElement(OptionComponent, {
      key: 2,
      i: 2,
      isDefault: 0,
      optText: "Upload (\"Throw in\") a file from your computer",
      optId: "upload"
    }),
    isDefault: 0,
    optText: 'Upload ("Throw in") a file from your computer',
    optId: 'upload'
  }]
};
var WAIT_DIALOGUE = {
  prompt: 'Throw in the next file using the Throw-In button.',
  id: null,
  data: null,
  options: null
}; // TODO // Move these somewhere

function triTickFormatter(cell, formatterParams, onRendered) {
  switch (cell.getValue()) {
    case undefined:
      cell.setValue(null);
      return '☐';

    case null:
      return '☐';

    case false:
      return '☒';

    case true:
      return '☑';
  }
}

function triTickCellClick(e, cell) {
  console.log(cell.getValue());

  switch (cell.getValue()) {
    case undefined:
      cell.setValue(true);
      break;

    case null:
      cell.setValue(true);
      break;

    case false:
      cell.setValue(null);
      break;

    case true:
      cell.setValue(false);
      break;
  }
}

function jsepToString(tree) {
  var side = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : null;
  var err_str = '{ERR}';

  switch (tree.type) {
    // case 'Compound':
    case 'Identifier':
      {
        var q = side === 'r' ? '\'' : '',
            d1 = side === 'l' ? 'data[\'' : '',
            d2 = side === 'l' ? '\']' : '';
        return q + d1 + tree.name + d2 + q;
      }
    // case 'MemberExpression':

    case 'Literal':
      {
        var _q = side === 'r' ? '\'' : '',
            _d = side === 'l' ? 'data[\'' : '',
            _d2 = side === 'l' ? '\']' : '';

        return _q + _d + tree.value + _d2 + _q;
      }
    // case 'ThisExpression':
    // case 'CallExpression':

    case 'UnaryExpression':
      {
        var op;

        switch (tree.operator) {
          case 'not':
            op = '!';
            break;

          default:
            op = tree.operator;
        }

        return "".concat(tree.operator, "(").concat(jsepToString(tree.argument, 'r'), ")");
      }

    case 'BinaryExpression':
      {
        if (tree.left.type === 'Literal') {// TODO // validate column identifiers
        } else if (tree.left.type !== 'Identifier') {
          console.error("jsepToString: Left argument of a binary expression must be a column identifier");
          return err_str;
        }

        var _op;

        switch (tree.operator) {
          case '=':
          case 'is':
            _op = '==';
            break;

          case 'is not':
          case 'isn\'t':
            _op = '!=';
            break;

          case 'in':
            {
              if (tree.right.type !== 'ArrayExpression') {
                console.error("jsepToString: Invalid usage of 'in' operator");
                return err_str;
              }

              var arr = '[';

              for (var i in tree.right.elements) {
                if (!['Literal', 'Identifier'].includes(tree.right.elements[i].type)) {
                  console.error("jsepToString: Invalid usage of 'in' operator");
                  return err_str;
                }

                arr += jsepToString(tree.right.elements[i], 'r') + ',';
              }

              arr += ']';
              return "".concat(arr, ".includes(").concat(jsepToString(tree.left, 'l'), ")");
            }

          case 'contains':
            {
              if (!['Literal', 'Identifier'].includes(tree.right.type)) {
                console.error("jsepToString: Invalid usage of 'contains' operator");
                return err_str;
              }

              return "".concat(jsepToString(tree.left, 'l'), ".includes(").concat(jsepToString(tree.right, 'r'), ")");
            }

          case 'regex':
            {
              if (!['Literal', 'Identifier'].includes(tree.right.type)) {
                console.error("jsepToString: Invalid usage of 'regex' operator");
                return err_str;
              }

              var regex = new RegExp(jsepToString(tree.right, null)).toString();
              return "".concat(regex, ".test(").concat(jsepToString(tree.left, 'l'), ")");
            }

          default:
            _op = tree.operator;
        }

        return "(".concat(jsepToString(tree.left, 'l'), " ").concat(_op, " ").concat(jsepToString(tree.right, 'r'), ")");
      }

    case 'LogicalExpression':
      return "(".concat(jsepToString(tree.left, 'l'), " ").concat(tree.operator, " ").concat(jsepToString(tree.right, 'r'), ")");
    // case 'ConditionalExpression':
    // case 'ArrayExpression':

    default:
      console.error("jsepToString: Unsupported expression type '".concat(tree.type, "'"));
      return err_str;
  }
}

function arbitraryFilter(data, filterParams) {
  // one > 2 & two < 5
  var replace = {
    '&': '&&',
    '|': '||'
  }; // TODO // implement NOT operator

  var filter = filterParams.split('').join('');

  for (var r in replace) {
    var regex = new RegExp("([^".concat(r, "])\\").concat(r, "([^").concat(r, "])"));
    filter = filter.replace(regex, "$1".concat(replace[r], "$2"));
  }

  console.log(filter); // try {
  // 	let parsed_tree = jsep(filter);
  // 	console.log(parsed_tree);
  // 	if(parsed_tree.type !== 'BinaryExpression'){
  // 		console.log('Invalid expression type');
  // 		return true;
  // 	}
  // } catch(e) {
  // 	console.log(`JSEP: ${e.message}`);
  // 	return true;
  // }
  // console.log(parse('( one > 2 && two < 5 || blah == 9 ) || (three == 1)'));

  var func_str = 'return ' + jsepToString(jsep(filter));
  console.log(func_str);

  try {
    var result = new Function('data', func_str);
    return result(data);
  } catch (e) {
    console.error("Filter: ".concat(e));
    return false;
  }
}
/************************************************************\
*                         LIQUID APP                         *
\************************************************************/


var Liquid = {
  curr_task: 'liquid_gui',
  initialize: function initialize() {
    this.httpRequest({
      json_data: {
        task_name: Liquid.curr_task,
        // will vary with tasks
        cmd_name: 'new_task',
        overwrite: true
      }
    }).then(function (text) {
      console.log('[NEW-TASK] ' + JSON.parse(text).status_ok.status);
    });
    this.dialogueManager.history.push(INIT_DIALOGUE);
    this.render();
    this.eventHandler.initialize();
    console.info('Liquid initialized!');
  },
  render: function render() {
    this.dialogueManager.render();
    this.tabManager.render();
    this.menu.render(); //this.menu.updateTaskList(1);

    console.info('Liquid rendered!');
  },
  httpRequest: function httpRequest(data) {
    console.log('[DATA-OUT]', data);
    var options = null;

    if (data !== undefined) {
      options = {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: ''
      };

      for (var field in data) {
        if (options.body !== '') options.body += '&';
        options.body += field + '=' + encodeURIComponent(_typeof(data[field]) === 'object' ? JSON.stringify(data[field]) : data[field]);
      }
    }

    return fetch(API_URL, options).then(function (response) {
      return response.text();
    })["catch"](function (err) {
      console.error('[Liquid.httpRequest] ' + err);
      return {
        error: '[Liquid.httpRequest] ' + err
      };
    });
  },
  handleResponse: function handleResponse(response_txt) {
    var _this = this;

    var response_json;

    try {
      response_json = JSON.parse(response_txt);
    } catch (e) {
      console.error('[Error] Non-JSON response received:\n\n' + response_txt);
      alert('[Error] Non-JSON response received:\n\n' + response_txt);
      return;
    }

    console.log('[DATA-IN]', response_json);
    response_json['reply_contents'].forEach(function (section) {
      var sec_data = response_json[section];

      switch (section) {
        case 'status_ok':
          /* Handle change/hide dialogue */
          console.log('STATUS-OK');
          break;

        case 'table_data':
          var rawdata = {
            rows: sec_data.tbl_rows,
            cols: sec_data.tbl_cols
          };
          var extension = 'tsv';

          _this.tabManager.addTab('table', sec_data.node_name, extension, rawdata);

          break;

        case 'text_file':
        case 'text_file2':
          _this.tabManager.addTab('text', sec_data.node_name, sec_data.file_extension, sec_data.file_contents);

          break;

        case 'api_json':
          _this.tabManager.addTab('text', sec_data.node_name, 'json', JSON.stringify(sec_data.json, null, 2)); // TODO // change to json tab type when that is implemented


          _this.tabManager.addTab('json_select', sec_data.node_name + '_select', null, sec_data.json_vars);

          break;

        case 'user_question':
          _this.dialogueManager.handleUserQuestion(sec_data);

          break;

        case 'liquid_served_url':
          window.open('https://spurcell.pythonanywhere.com' + sec_data.relative_url);

        default:
          console.error('[Liquid.handleResponse] unrecognized reply type: ' + section);
      }
    });
  },
  //// Manages question/answer dialogue ////
  dialogueManager: {
    history: [],
    // History of all questions
    curr_pos: 0,
    // Current history position (0 is the latest one, increasing numbers are older)
    command_map: {
      '': function _() {}
    },
    handleAnswer: function handleAnswer(ans_id) {
      var _this2 = this;

      switch (ans_id) {
        case 'upload':
        case 'default_throwin_question_only':
          document.querySelector('label[for="throwin_file"]').click();
          return;
      }

      if (ans_id === '' || ans_id === undefined) return;
      var json_data = {
        task_name: Liquid.curr_task,
        // will vary with tasks
        cmd_name: 'user_answer',
        answ_id: ans_id,
        qst_opaque_data: this.history[this.curr_pos].data
      }; // console.log('[ANSWER-OUT]',json_data);

      Liquid.httpRequest({
        json_data: json_data
      }).then(function (res_text) {
        var res_json = JSON.parse(res_text);

        if (res_json.reply_contents.indexOf('status_ok') !== -1) {
          if (res_json.status_ok.status === 'OK') {
            _this2.history.unshift(WAIT_DIALOGUE);

            _this2.render();
          }
        }

        Liquid.handleResponse(res_text);
      }); // this.command_map[ans_id]();
    },
    handleUserQuestion: function handleUserQuestion(json) {
      // console.log('[QUESTION-IN]',json);
      if (json === undefined) {
        this.history.unshift(WAIT_DIALOGUE);
      } else {
        if (!json.error) {
          this.newQuestion(json.qst_text, json.qst_id, json.qst_opaque_data, json.answ_cands);
        } else {
          this.newQuestion(json.error, null, null, null);
        }
      }

      this.render();
    },
    newQuestion: function newQuestion(text, id, data, answ_cands) {
      var options = [];

      for (var i in answ_cands) {
        var opt = answ_cands[i];
        options.push({
          jsxElement: React.createElement(OptionComponent, {
            key: i + 1,
            i: i + 1,
            isDefault: 0,
            optText: opt.answ_text,
            optId: opt.answ_id
          }),
          isDefault: 0,
          opt_text: opt.answ_text,
          opt_id: opt.answ_id
        });
      }

      this.history.unshift({
        prompt: text,
        id: id,
        data: data,
        options: options
      });
    },
    render: function render() {
      ReactDOM.render(React.createElement(DialogueComponent, {
        prompt: this.history[0].prompt
      }), document.querySelector('#dialogue_container'));
    }
  },
  //// Manages throwin/tab layout ////
  tabManager: {
    tabs: [],
    // All tabs
    active_tab: 1,
    // Currently active tab
    addTab: function addTab(type, name, extension, rawdata) {
      var new_tab;

      switch (type) {
        case 'text':
          new_tab = new TextTab(name, extension, rawdata);
          break;

        case 'table':
          new_tab = new TableTab(name, extension, rawdata);
          break;

        case 'json':
          new_tab = new JSONTab(name, extension, rawdata);
          break;

        case 'json_select':
          new_tab = new JSONSelectTab(name, extension, rawdata);
          break;
      }

      this.tabs.push(new_tab);
      this.active_tab = this.tabs.length;
      this.render();
    },
    getTab: function getTab(n) {
      if (this.tabs[n - 1]) return this.tabs[n - 1];
      return false;
    },
    getAllTabs: function getAllTabs() {
      return this.tabs;
    },
    getActiveTab: function getActiveTab() {
      return this.getTab(this.active_tab);
    },
    render: function render() {
      ReactDOM.render(React.createElement(TabViewComponent, null), document.querySelector('#tab_container'));
      this.tabs.forEach(function (tab) {
        if (tab.getType() === 'table') {
          if (!tab.getTableObject()) {
            var data = tab.getRawData();
            var obj = new Tabulator('#t' + tab.getID(), {
              layout: 'fitData',
              placeholder: 'Loading...',
              movableColumns: true,
              rowFormatter: data.formatter
            });
            obj.setColumns(data.cols);
            obj.setData(data.rows);
            tab.setTableObject(obj); // TODO // Make this stuff go away

            window.setTimeout(function () {
              return obj.addColumn({
                title: 'select',
                field: 'selection',
                visible: false,
                formatter: triTickFormatter,
                cellClick: triTickCellClick
              }, true);
            }, 10);
          }
        }
      });
    },
    setActiveTab: function setActiveTab(i) {
      this.active_tab = i;
    },
    submitJSONvars: function submitJSONvars(tab_selector) {
      var selected = {};
      document.querySelectorAll('.throwin ' + tab_selector + ' input:checked').forEach(function (input) {
        selected[input.attributes['keyname'].value] = input.attributes['keyval'].value;
      });
      var json_data = {
        task_name: Liquid.curr_task,
        cmd_name: 'user_input',
        input_type: 'json_vars_selection',
        json_vars_selection: selected,
        qst_opaque_data: Liquid.dialogueManager.history[Liquid.dialogueManager.curr_pos].data
      };
      Liquid.httpRequest({
        json_data: json_data
      }).then(function (response) {
        Liquid.handleResponse(response);
      });
    }
  },
  //// Manages user-created file uploads ////
  uploadManager: {
    uploadFromFile: function uploadFromFile() {
      var reader = new FileReader(),
          file = document.querySelector('#throwin_file').files[0];

      if (!file || file === undefined) {
        alert('Select a file from your computer');
        return;
      } // let file_type = file.name.split('.').pop();


      reader.onload = function (e) {
        var json_data = {
          task_name: Liquid.curr_task,
          // will vary with tasks
          cmd_name: 'throwin_file',
          file_name: file.name
        };
        var encoded_result = e.target.result;
        Liquid.httpRequest({
          'json_data': JSON.stringify(json_data),
          'file_contents': encoded_result
        }).then(function (response) {
          Liquid.handleResponse(response);
        });
      };

      reader.readAsText(file);
    },
    uploadFromText: function uploadFromText() {
      var text = prompt('Type or paste content here');

      if (text === null | text === '') {
        console.log('Text input canceled');
        return;
      }

      var name = prompt('Give this file a name');

      if (name === null | name === '') {
        console.log('Name input canceled');
        return;
      }

      var json_data = {
        task_name: Liquid.curr_task,
        cmd_name: 'throwin_text',
        file_contents: text,
        node_name: name
      };
      Liquid.httpRequest({
        'json_data': JSON.stringify(json_data)
      }).then(function (response) {
        Liquid.handleResponse(response);
      });
    }
  },
  eventHandler: {
    event_map: {
      '#throwin_file|change': 'uploadManager.uploadFromFile',
      '#throwin_text|click': 'uploadManager.uploadFromText',
      '#task_list h2|click': 'menu.updateTaskList'
    },
    initialize: function initialize() {
      var _this3 = this;

      var _loop = function _loop(event) {
        var a = event.split('|'),
            target = a[0],
            action = a[1],
            elem = document.querySelector(target),
            b = _this3.event_map[event].split('.'),
            command = function command(e) {
          Liquid[b[0]][b[1]](e);
        };

        elem.removeEventListener(action, command);
        elem.addEventListener(action, command);
      };

      for (var event in this.event_map) {
        _loop(event);
      }
    }
  },
  menu: {
    task_list: ['these', 'are', 'placeholders'],
    updateTaskList: function updateTaskList(do_render) {
      var _this4 = this;

      Liquid.httpRequest({
        json_data: {
          task_name: Liquid.curr_task,
          // will vary with tasks
          cmd_name: 'get_tasks_for_user'
        }
      }).then(function (text) {
        var json = JSON.parse(text);
        console.log('updateTaskList', json);
        _this4.task_list = json.user_task_list;
        if (do_render) _this4.render();
      });
    },
    toggleCheckboxes: function toggleCheckboxes(n) {
      var tab = Liquid.tabManager.getTab(n);

      if (tab !== false) {
        if (tab.getType() !== 'table') {
          console.error("tab ".concat(n, " isn't a table tab"));
          return false;
        }

        var tab_object = tab.getTableObject();
        tab_object.toggleColumn('selection');
      } else {
        console.log("invalid  tab: ".concat(n));
      }
    },
    render: function render() {
      ReactDOM.render(React.createElement(NavComponent, null), document.querySelector('nav')); //this.updateTaskList();
    }
  }
};

function nestedTableTest() {}

function sendTableData() {
  var name = window.prompt('Give a name for the selection column:', 'select');
  var tab = Liquid.tabManager.getActiveTab();

  if (tab.getType() !== 'table') {
    console.error("tab ".concat(n, " isn't a table tab"));
    return false;
  }

  var object = tab.getTableObject();
  var table = {
    cols: object.getColumnDefinitions(),
    rows: object.getData()
  };
  var json_data = {
    cmd_name: 'user_input',
    input_type: 'checkbox_values',
    tag_col_name: name,
    tabulator_table: table,
    task_name: 'dentists'
  };
  Liquid.httpRequest({
    'json_data': JSON.stringify(json_data)
  }).then(function (response) {
    Liquid.handleResponse(response);
  });
}

function addCheckColumn() {
  var col_name = window.prompt('Give a name for the new checkbox column:', 'checked');
  Liquid.tabManager.getActiveTab().getTableObject().addColumn({
    title: col_name,
    field: col_name,
    formatter: triTickFormatter,
    cellClick: triTickCellClick
  }, true);
}

function addTextColumn() {
  var col_name = window.prompt('Give a name for the new text column:', 'notes');
  Liquid.tabManager.getActiveTab().getTableObject().addColumn({
    title: col_name,
    field: col_name,
    editor: true
  }, true);
}

function filterColumn() {
  var col = window.prompt('Which column do you want to filter?');
  var fnc = window.prompt('What function do you want to filter with? (=,!=,like,<,<=,>,>=,in,regex)');
  var val = window.prompt('What value do you want to filter by?');
  Liquid.tabManager.getActiveTab().getTableObject().setFilter(col, fnc, val);
}

function filterCustom() {
  var str = window.prompt('Type the filter string here');
  Liquid.tabManager.getActiveTab().getTableObject().setFilter(arbitraryFilter, str);
}

function clearFilters() {
  Liquid.tabManager.getActiveTab().getTableObject().clearFilter();
}

function lockDialogue() {
  UI.toggleClass('.dialogue', 'locked');
}