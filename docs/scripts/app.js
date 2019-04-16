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
};
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
    }).catch(function (err) {
      console.error('[Liquid.httpRequest] ' + err);
      return {
        error: '[Liquid.httpRequest] ' + err
      };
    });
  },
  handleResponse: function handleResponse(response_txt) {
    var _this = this;

    var json;

    try {
      json = JSON.parse(response_txt);
    } catch (e) {
      console.error('[Error] Non-JSON response received:\n\n' + response_txt);
      alert('[Error] Non-JSON response received:\n\n' + response_txt);
      return;
    }

    console.log('[DATA-IN]', json);
    json['reply_contents'].forEach(function (data) {
      switch (data) {
        case 'status_ok':
          /* Handle change/hide dialogue */
          console.log('STATUS-OK');
          break;

        case 'table_data':
          _this.tabManager.handleTableData(json.table_data);

          break;

        case 'text_file':
        case 'text2':
          _this.tabManager.handleTextFile(json[data]);

          break;

        case 'api_json':
          _this.tabManager.handleJSON(json.api_json, true);

          break;

        case 'user_question':
          _this.dialogueManager.handleUserQuestion(json.user_question);

          break;

        default:
          console.error('[Liquid.handleResponse] unrecognized reply type: ' + data);
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
    addTab: function addTab(name, ext, data) {
      var n = this.tabs.length + 1;
      var short_name = name.split('/').pop();
      this.tabs.push({
        jsxElement: React.createElement(TabComponent, {
          key: n,
          n: n,
          title: short_name,
          format: Tab.getFormat(ext),
          data: data
        }),
        throwin: {
          name: name,
          ext: ext,
          n: n,
          format: Tab.getFormat(ext),
          data: data,
          object: null
        }
      });
      this.active_tab = this.tabs.length;
      this.render();
    },
    getTab: function getTab(n) {
      if (this.tabs[n - 1]) return this.tabs[n - 1];
      return false;
    },
    getCurrentTab: function getCurrentTab() {
      return this.getTab(this.active_tab);
    },
    handleTableData: function handleTableData(json) {
      var content = {
        cols: [],
        rows: json.tbl_rows
      };

      if (typeof json.tbl_cols[0] === "string") {
        // Temporary check to see if cols are string or object
        json.tbl_cols.forEach(function (col) {
          return content.cols.push({
            title: col,
            field: col,
            editor: true
          });
        });
      } else {
        content.cols = json.tbl_cols;
      }

      this.addTab(json.node_name, 'tsv', content);
    },
    handleTextFile: function handleTextFile(json) {
      this.addTab(json.node_name, json.file_extension, json.file_contents);
    },
    handleJSON: function handleJSON(data, selection) {
      this.addTab(data.node_name, 'json', JSON.stringify(data.json, null, 2));

      if (selection) {
        this.addTab(data.node_name + '_select', 'json_select', data.json_vars);
      }
    },
    render: function render() {
      ReactDOM.render(React.createElement(TabViewComponent, null), document.querySelector('#tab_container'));
      this.tabs.forEach(function (tab) {
        var t = tab.throwin;

        if (t.format === 'table') {
          if (!t.object) {
            t.object = new Tabulator('#t' + t.n, {
              layout: 'fitData',
              placeholder: 'Loading...',
              movableColumns: true,
              rowFormatter: t.data.formatter
            }); //Liquid.menu.toggleCheckboxes(t.i);

            window.setTimeout(function () {
              return t.object.addColumn({
                title: 'select',
                field: 'selection',
                editor: 'tick',
                editorParams: {
                  tristate: true
                },
                visible: false,
                formatter: 'tickCross'
              }, true);
            }, 10);
            console.log(t);
            t.object.setColumns(t.data.cols);
            t.object.setData(t.data.rows);
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
        var tab_object = tab.throwin.object;
        tab_object.toggleColumn('selection'); // if(check_col === false){
        // 	tab_object.addColumn({title:'select',field:'selection',editor:'tick',editableTitle:true,formatter:'tickCross'},true);
        // }else{
        // 	check_col.hide();
        // }
      } else {
        console.log('invalid  tab: ' + n);
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
  var object = Liquid.tabManager.tabs[Liquid.tabManager.active_tab - 1].throwin.object;
  var table = {
    cols: object.getColumnDefinitions(),
    rows: object.getData()
  };
  var json_data = {
    cmd_name: 'user_input',
    input_type: 'checkbox_values',
    tag_col_name: 'jaspers_faves',
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
  Liquid.tabManager.getCurrentTab().throwin.object.addColumn({
    title: col_name,
    field: col_name,
    editor: 'tick',
    formatter: 'tickCross'
  }, true);
}