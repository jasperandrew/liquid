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
    jsxElement: React.createElement(Option, {
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
    jsxElement: React.createElement(Option, {
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
  debug: true,
  debugLog: function debugLog(txt) {
    if (this.debug) {
      console.log(txt);
    }
  },
  initialize: function initialize() {
    this.httpRequest({
      json_data: {
        task_name: Liquid.curr_task,
        // will vary with tasks
        cmd_name: 'new_task'
      }
    }).then(function (text) {
      Liquid.debugLog('[new_task] ' + text);
    });
    this.dialogueManager.history.push(INIT_DIALOGUE);
    this.eventHandler.initialize();
    this.render();
    console.info('Liquid initialized!');
  },
  render: function render() {
    this.dialogueManager.render();
    this.tabManager.render();
  },
  getAllTasks: function getAllTasks() {
    this.httpRequest({
      json_data: {
        task_name: Liquid.curr_task,
        // will vary with tasks
        cmd_name: 'get_tasks_for_user'
      }
    }).then(function (text) {
      Liquid.debugLog(text);
    });
  },
  httpRequest: function httpRequest(data) {
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
        options.body += field + '=' + (_typeof(data[field]) === 'object' ? JSON.stringify(data[field]) : data[field]);
      }
    } // Liquid.debugLog(options.body);


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
      Liquid.debugLog(response_txt, e);
    }

    json['reply_contents'].forEach(function (data) {
      switch (data) {
        case 'table_data':
          _this.tabManager.handleTableData(json.table_data);

          break;

        case 'text_file':
          _this.tabManager.handleTextFile(json.text_file);

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

      if (ans_id === '' || ans_id === undefined) return;
      var json_data = {
        task_name: Liquid.curr_task,
        // will vary with tasks
        cmd_name: 'user_answer',
        answ_id: ans_id,
        qst_opaque_data: this.history[this.curr_pos].data
      };
      Liquid.httpRequest({
        json_data: json_data
      }).then(function (res_text) {
        Liquid.debugLog('[' + ans_id + '] ' + res_text);

        if (res_text === 'OK') {
          _this2.history.unshift(WAIT_DIALOGUE);

          _this2.render();
        }
      });

      switch (ans_id) {
        case 'upload':
          document.querySelector('label[for="throwin_file"]').click();
      } // this.command_map[ans_id]();

    },
    handleUserQuestion: function handleUserQuestion(json) {
      if (!json.error) this.newQuestion(json.qst_text, json.qst_id, json.qst_opaque_data, json.answ_cands);else this.newQuestion(json.error, null, null, null);
      this.render();
    },
    newQuestion: function newQuestion(text, id, data, answ_cands) {
      var options = [];

      for (var i in answ_cands) {
        var opt = answ_cands[i];
        options.push({
          jsxElement: React.createElement(Option, {
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
      ReactDOM.render(React.createElement(Dialogue, {
        prompt: this.history[0].prompt
      }), document.querySelector('#dialogue_container'));
    }
  },
  //// Manages throwin/tab layout ////
  tabManager: {
    data: [],
    // All tabs
    active_tab: 1,
    // Currently active tab
    addTab: function addTab(name, ext, source, content) {
      var n = this.data.length + 1;
      this.data.push({
        jsxElement: React.createElement(Tab, {
          key: n,
          i: n,
          tabName: name,
          format: this.getFormat(ext)
        }),
        throwin: {
          name: name,
          ext: ext,
          id: '#t' + n,
          src: source,
          format: this.getFormat(ext),
          content: content,
          object: null
        }
      });
      this.active_tab = this.data.length;
      this.render();
    },
    getFormat: function getFormat(extension) {
      switch (extension) {
        case 'tsv':
          return 'table';

        case 'txt':
        case 'sql':
          return 'text';

        default:
          return 'text';
      }
    },
    handleTableData: function handleTableData(json) {
      var content = {
        cols: [],
        rows: json.tbl_rows
      };
      json.tbl_cols.forEach(function (col) {
        return content.cols.push({
          title: col,
          field: col
        });
      });
      this.addTab(json.node_name, 'tsv', 'local', content);
    },
    handleTextFile: function handleTextFile(json) {
      this.addTab(json.node_name, json.file_extension, 'local', json.file_contents);
    },
    render: function render() {
      ReactDOM.render(React.createElement(TabContainer, null), document.querySelector('#tab_container'));
      this.data.forEach(function (tab) {
        var t = tab.throwin;

        if (t.format === 'table') {
          if (!t.object) {
            t.object = new Tabulator(t.id, {
              layout: 'fitData',
              placeholder: 'Loading...'
            });
          }

          if (t.src === 'fetch') {
            fetch(t.content).then(function (res) {
              return res.json();
            }).then(function (json) {
              // Liquid.debugLog(json);
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
            // Liquid.debugLog(t.content);
            t.object.setColumns(t.content.cols);
            t.object.setData(t.content.rows);
          }
        } else if (t.format === 'text') {
          document.querySelector(t.id).innerHTML = t.content;
        }
      });
    },
    setActiveTab: function setActiveTab(i) {
      this.active_tab = i;
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
        Liquid.httpRequest({
          'json_data': JSON.stringify(json_data),
          'file_contents': e.target.result
        }).then(function (response) {
          Liquid.handleResponse(response);
        });
      };

      reader.readAsText(file);
    }
  },
  eventHandler: {
    event_map: {
      '#throwin_file|change': 'uploadManager.uploadFromFile'
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
  }
};