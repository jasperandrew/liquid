const DATA = {
    curr_task: 'liquid_gui',

    init() {
        this.httpRequest({
            json_data: {
                cmd_name: 'init',
            }
        })
        .then(text => {
            this.handleResponse(text);
        });

        this.httpRequest({
            json_data: {
                task_name: this.curr_task, // will vary with tasks
                cmd_name: 'new_task',
                overwrite: true
            }
        })
        .then(text => {
            console.log('[NEW-TASK] ' + JSON.parse(text).status_ok.status);
        });

        this.Dialog.data.push(INIT_DIALOGUE);
    },

    httpRequest(data) {
        console.log('[DATA-OUT]',data);
        let options = null;
        if(data !== undefined){
            options = {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/x-www-form-urlencoded'
                },
                body: ''
            }

            for(let field in data){
                if(options.body !== '') options.body += '&';
                options.body += field + '=' + encodeURIComponent(typeof(data[field]) === 'object' ? JSON.stringify(data[field]) : data[field]);
            }
        }

        return fetch(API_URL, options)
        .then(response => response.text())
        .catch(err => {
            console.error('[DATA.httpRequest] ' + err);
            return { error: '[DATA.httpRequest] ' + err };
        });
    },
    
    handleResponse: function(response_txt) {
        let response_json;
        try {
            response_json = JSON.parse(response_txt);
        } catch(e) {
            console.error('[Error] Non-JSON response received:\n\n' + response_txt);
            alert('[Error] Non-JSON response received:\n\n' + response_txt);
            return;
        }
        console.log('[DATA-IN]',response_json);

        function processReplyData(type, data) {
            switch(type){
                case 'init_data':
                    UI.HeaderMenu.initMenus(data.menus);
                case 'status_ok': 
                    /* Handle change/hide dialogue */ 
                    console.log('STATUS-OK'); break;
                case 'table_data':
                    let rawdata = {
                        rows:data.tbl_rows,
                        cols:data.tbl_cols
                    };
                    let extension = 'tsv';
                    DATA.Throwin.add('table', data.node_name, extension, rawdata);
                    break;
                case 'text_file':
                case 'text_file2':
                    DATA.Throwin.add('text', data.node_name, data.file_extension, data.file_contents);
                    break;
                case 'api_json':
                    DATA.Throwin.add('text', data.node_name, 'json', JSON.stringify(data.json, null, 2)); // TODO // change to json tab type when that is implemented
                    DATA.Throwin.add('json_select', data.node_name+'_select', null, data.json_vars);
                    break;
                case 'user_question':
                    DATA.Dialog.handleNew(data, 'button'); break;
                case 'user_text_input':
                    DATA.Dialog.handleNew(data, 'text'); break;
                case 'liquid_served_url':
                    let url = 'https://spurcell.pythonanywhere.com' + data.relative_url;
                    DATA.Throwin.add('webpage', data.node_name, 'url', url);
                    break;
                case 'exec_menu_item':
                    UI.HeaderMenu.runMenuFunc(data.menu_item_id);
                    break;
                case 'error_message':
                    alert('⚠ ' + data.message);
                    break;
                case 'reply_contents': break; // TODO // remove eventually
                default:
                    console.warn('[DATA.handleResponse] unrecognized reply type: ' + type);
            }
        }

        for(let section in response_json){
            let sec_data = response_json[section], 
                typename = typenameof(sec_data);
            switch(typename){
                case 'Object': processReplyData(section, sec_data); break;
                case 'Array': sec_data.forEach(d => { processReplyData(section, d) }); break;
                default: console.error('[DATA.handleResponse] unrecognized data format: ' + typename)
            }
        }
    },

    Dialog: {
        data: [], // History of all questions

        // TODO // Create Option class and move this there
        handleAnswer(ans_id, type) {
            let json_data;
            switch(type){
                case 'button':
                    switch(ans_id){
                        case 'upload':
                        case 'default_throwin_question_only':
                        case 'default_throwin_question_throw':
                            document.querySelector('label[for="throwin_file"]').click();
                            return;
                        default:
                            json_data = {
                                task_name: DATA.curr_task, // will vary with tasks
                                cmd_name: 'user_answer',
                                answ_id: ans_id,
                                qst_opaque_data: this.data[0].data
                            };
                    }
                    break;
                case 'text':
                    let input = document.querySelector('.option > input[type="text"]');
                    json_data = {
                        task_name: DATA.curr_task, // will vary with tasks
                        cmd_name: 'user_answer_text_input',
                        qst_id: ans_id,
                        text_answer: input.value,
                        qst_opaque_data: this.data[0].data
                    };
                    input.value = '';
                    break;
                default:
            }

            if(ans_id === '' || ans_id === undefined) return;

            console.log('[ANSWER-OUT]',json_data);

            DATA.httpRequest({
                json_data: json_data
            })
            .then(res_text => {
                let res_json = JSON.parse(res_text);

                if(res_json.reply_contents.indexOf('status_ok') !== -1){
                    if(res_json.status_ok.status === 'OK'){
                        this.data.unshift(WAIT_DIALOGUE);
                        this.render();	
                    }
                }
                DATA.handleResponse(res_text);
            });

            // this.command_map[ans_id]();
        },
        
        handleNew(json, type) {
            // console.log('[QUESTION-IN]',json);
            if(json === undefined){
                this.data.unshift(WAIT_DIALOGUE);
            }else{
                this.add(json, type);
                // if(!json.error){
                // 	this.add(json.qst_text, json.qst_id, json.qst_opaque_data, json.answ_cands);
                // }else{
                // 	this.add(json.error, null, null, null);
                // }
            }
            UI.DialogView.render();
        },
        
        add(json, type) {
            let reply_opts = [];
            switch(type){
                case 'button':
                    for(let i in json.answ_cands){
                        let opt = json.answ_cands[i];
                        reply_opts.push({
                            jsxElement: <ReplyButtonComponent key={i+1} i={i+1} isDefault={0} optText={opt.answ_text} optId={opt.answ_id}/>,
                            isDefault: 0,
                            opt_text: opt.answ_text,
                            opt_id: opt.answ_id,
                        });
                    }
                    break;
                case 'text':
                    reply_opts.push({
                        jsxElement: <ReplyTextComponent key={1} i={1} optId={json.qst_id} optText={'Press [Enter] to submit'}/>,
                    });
                    break;
                default:
            }
            this.data.unshift({
                prompt: json.qst_text,
                id: json.qst_id,
                data: json.qst_opaque_data,
                type: type,
                reply_opts: reply_opts
            });
        },

        get(n) { return this.data[n] || null; },
        getAll() { return this.data; },
    },

    Throwin: {
        data: [], // Set of all throwins

        add(type, name, extension, rawdata) {
            let throwin;
            switch(type){
                case 'text': throwin = new TextThrowin(name, extension, rawdata); break;
                case 'table': throwin = new TableThrowin(name, extension, rawdata); break;
                case 'json': throwin = new JSONThrowin(name, extension, rawdata); break;
                case 'json_select': throwin = new JSONSelectThrowin(name, extension, rawdata); break;
                case 'webpage': throwin = new WebPageThrowin(name, extension, rawdata); break;
            }
            this.data.push(throwin);
            UI.TabView.render(this.data.length); // focus the most recent tab
        },

        get(n) { return this.data[n-1] || null; },
        getAll() { return this.data; }
    },

    Upload: {
        file() {
            let reader = new FileReader(),
                file = document.querySelector('#throwin_file').files[0];
            
            if(!file || file === undefined){
                alert('Select a file from your computer');
                return;
            }

            // let file_type = file.name.split('.').pop();

            reader.onload = e => {
                let json_data = {
                    task_name: DATA.curr_task, // will vary with tasks
                    cmd_name: 'throwin_file',
                    file_name: file.name
                };

                let encoded_result = (e.target.result);

                DATA.httpRequest({
                    'json_data': (JSON.stringify(json_data)),
                    'file_contents': encoded_result
                })
                .then(response => { DATA.handleResponse(response) });
            }
            reader.readAsText(file);
        },

        text(text) {
            let name;
            if(text === null || text === undefined){
                text = prompt('Type or paste content here');
                if(text === null | text === ''){
                    console.log('Text input canceled');
                    return;
                }

                name = prompt('Give this file a name');
                if(name === null | name === ''){
                    console.log('Name input canceled');
                    return;
                }
            }else{
                name = text.split(' ').join('_') + '.txt';
            }
            
            let json_data = {
                task_name: DATA.curr_task,
                cmd_name:'throwin_text',
                file_contents: text,
                node_name: name
            }

            DATA.httpRequest({
                'json_data': JSON.stringify(json_data)
            })
            .then(response => { DATA.handleResponse(response) });
        }
    }
}