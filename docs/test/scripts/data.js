"use strict";

function _typeof(obj) { if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

var DATA = {
  curr_task: 'liquid_gui',
  init: function init() {
    this.httpRequest({
      json_data: {
        task_name: this.curr_task,
        // will vary with tasks
        cmd_name: 'new_task',
        overwrite: true
      }
    }).then(function (text) {
      console.log('[NEW-TASK] ' + JSON.parse(text).status_ok.status);
    });
    this.Dialog.data.push(INIT_DIALOGUE);
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
      console.error('[DATA.httpRequest] ' + err);
      return {
        error: '[DATA.httpRequest] ' + err
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

          _this.Throwin.add('table', sec_data.node_name, extension, rawdata);

          break;

        case 'text_file':
        case 'text_file2':
          _this.Throwin.add('text', sec_data.node_name, sec_data.file_extension, sec_data.file_contents);

          break;

        case 'api_json':
          _this.Throwin.add('text', sec_data.node_name, 'json', JSON.stringify(sec_data.json, null, 2)); // TODO // change to json tab type when that is implemented


          _this.Throwin.add('json_select', sec_data.node_name + '_select', null, sec_data.json_vars);

          break;

        case 'user_question':
          _this.Dialog.handleNew(sec_data);

          break;

        default:
          console.error('[DATA.handleResponse] unrecognized reply type: ' + section);
      }
    });
  },
  Dialog: {
    data: [],
    // History of all questions
    // TODO // Create Option class and move this there
    handleAnswer: function handleAnswer(ans_id) {
      var _this2 = this;

      console.log('test');

      switch (ans_id) {
        case 'upload':
        case 'default_throwin_question_only':
          document.querySelector('label[for="throwin_file"]').click();
          return;
      }

      if (ans_id === '' || ans_id === undefined) return;
      var json_data = {
        task_name: DATA.curr_task,
        // will vary with tasks
        cmd_name: 'user_answer',
        answ_id: ans_id,
        qst_opaque_data: this.data[0].data
      };
      console.log('[ANSWER-OUT]', json_data);
      DATA.httpRequest({
        json_data: json_data
      }).then(function (res_text) {
        var res_json = JSON.parse(res_text);

        if (res_json.reply_contents.indexOf('status_ok') !== -1) {
          if (res_json.status_ok.status === 'OK') {
            _this2.data.unshift(WAIT_DIALOGUE);

            _this2.render();
          }
        }

        DATA.handleResponse(res_text);
      }); // this.command_map[ans_id]();
    },
    handleNew: function handleNew(json) {
      // console.log('[QUESTION-IN]',json);
      if (json === undefined) {
        this.data.unshift(WAIT_DIALOGUE);
      } else {
        if (!json.error) {
          this.add(json.qst_text, json.qst_id, json.qst_opaque_data, json.answ_cands);
        } else {
          this.add(json.error, null, null, null);
        }
      }

      UI.DialogView.render();
    },
    add: function add(text, id, data, answ_cands) {
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

      this.data.unshift({
        prompt: text,
        id: id,
        data: data,
        options: options
      });
    },
    get: function get(n) {
      return this.data[n] || null;
    },
    getAll: function getAll() {
      return this.data;
    }
  },
  Throwin: {
    data: [],
    // Set of all throwins
    add: function add(type, name, extension, rawdata) {
      var throwin;

      switch (type) {
        case 'text':
          throwin = new TextThrowin(name, extension, rawdata);
          break;

        case 'table':
          throwin = new TableThrowin(name, extension, rawdata);
          break;

        case 'json':
          throwin = new JSONThrowin(name, extension, rawdata);
          break;

        case 'json_select':
          throwin = new JSONSelectThrowin(name, extension, rawdata);
          break;
      }

      this.data.push(throwin);
      UI.TabView.render(this.data.length); // focus the most recent tab
    },
    get: function get(n) {
      return this.data[n - 1] || null;
    },
    getAll: function getAll() {
      return this.data;
    }
  },
  Upload: {
    file: function file() {
      var reader = new FileReader(),
          file = document.querySelector('#throwin_file').files[0];

      if (!file || file === undefined) {
        alert('Select a file from your computer');
        return;
      } // let file_type = file.name.split('.').pop();


      reader.onload = function (e) {
        var json_data = {
          task_name: DATA.curr_task,
          // will vary with tasks
          cmd_name: 'throwin_file',
          file_name: file.name
        };
        var encoded_result = e.target.result;
        DATA.httpRequest({
          'json_data': JSON.stringify(json_data),
          'file_contents': encoded_result
        }).then(function (response) {
          DATA.handleResponse(response);
        });
      };

      reader.readAsText(file);
    },
    text: function text() {
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
        task_name: DATA.curr_task,
        cmd_name: 'throwin_text',
        file_contents: text,
        node_name: name
      };
      DATA.httpRequest({
        'json_data': JSON.stringify(json_data)
      }).then(function (response) {
        DATA.handleResponse(response);
      });
    }
  }
};