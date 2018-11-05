"use strict";

/************************************************************\
*                           GLOBALS                          *
\************************************************************/
var API_URL = 'https://spurcell.pythonanywhere.com/cmd';
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
          optId: ""
        }),
        isDefault: 0,
        optText: 'Upload a file from your computer',
        optId: ''
      }, {
        jsxElement: React.createElement(Option, {
          key: 2,
          i: 2,
          isDefault: 0,
          optText: "Call a web API or database",
          optId: ""
        }),
        isDefault: 0,
        optText: 'Call a web API or database',
        optId: ''
      }]
    });
    this.eventHandler.initialize();
    this.renderAll();
    console.log('Liquid initialized!');
  },
  renderAll: function renderAll() {
    this.dialogueManager.render();
    this.tabManager.render();
  },
  httpRequest: function httpRequest(url, data) {
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
        options.body += field + '=' + data[field];
      }
    }

    console.log(url, options.body);
    return fetch(url, options).then(function (response) {
      return response.text();
    }).catch(function (err) {
      console.log('[RequestError] ' + err);
      return {
        error: err
      };
    });
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
    curr_pos: 0,
    // Current history position (0 is the latest one, increasing numbers are older)
    command_map: {
      '': function _() {}
    },
    handleAnswer: function handleAnswer(ans_id) {
      if (ans_id === '' || ans_id === undefined) return;
      var json_data = {
        task_name: 'liquid_gui',
        // will vary with tasks
        cmd_name: 'user_answer',
        answ_id: ans_id
      };
      Liquid.httpRequest(API_URL, {
        'json_data': JSON.stringify(json_data)
      }).then(function (json) {
        console.log(json);
      }); // this.command_map[ans_id]();
    },
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
            fetch(t.content).then(function (res) {
              return res.json();
            }).then(function (json) {
              // console.log(json);
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
    uploadFromFile: function uploadFromFile() {
      var reader = new FileReader(),
          file = document.querySelector('#file').files[0];

      if (!file || file === undefined) {
        alert('Select a file from your computer');
        return;
      }

      var file_type = file.name.split('.').pop();

      if (file_type !== 'tsv') {
        alert('Don\'t currently support .' + file_type + ' files, just .tsv');
        return;
      }

      reader.onload = function (e) {
        var json_data = {
          task_name: 'liquid_gui',
          // will vary with tasks
          cmd_name: 'throwin_file',
          file_name: file.name
        };
        Liquid.httpRequest(API_URL, {
          'json_data': JSON.stringify(json_data),
          'file_contents': e.target.result
        }).then(function (json) {
          json = JSON.parse(json);
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
    }
  },
  eventHandler: {
    event_map: {
      'click|#load': 'uploadManager.uploadFromFile'
    },
    initialize: function initialize() {
      var _this = this;

      var _loop = function _loop(event) {
        var a = event.split('|'),
            action = a[0],
            target = a[1],
            elem = document.querySelector(target),
            b = _this.event_map[event].split('.'),
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
document.querySelector('#load').addEventListener('click', function () {
  ;
}); // console.log({
// 	reply_contents: ['user_question', 'table_data'], // An array containing the other sections contained in the response
// 	user_question: { // All of the data pertaining to a new user question
// 		qst_prompt: 'Question prompt',
// 		qst_id: 'qst1',
// 		qst_opts: [
// 			{
// 				opt_text: 'Option 1',
// 				opt_id: 'opt1'
// 			},{
// 				opt_text: 'Option 2',
// 				opt_id: 'opt2'
// 			}
// 		]
// 	},
// 	table_data: { // All of the data pertaining to a table
// 		new_tbl: true, // Whether or not this table is a new table or an updated table
// 		tbl_name: 'table1.tsv', // The name of the table
// 		tbl_cols: [ // Column data, in order
// 			{
// 				title: 'Column 1', // The "pretty" name for the column. Can just be the same as the field.
// 				field: 'col1' // The actual name of the field in the row data
// 			},{
// 				title: 'Column 2',
// 				field: 'col2'
// 			}
// 		],
// 		tbl_rows: [ // Row data, exactly the same as 'table_data' in the current spec
// 			{
// 				col1: 'row1 col1',
// 				col2: 'row1 col2'
// 			},{
// 				col1: 'row2 col1',
// 				col2: 'row2 col2'
// 			}
// 		]
// 	}
// });