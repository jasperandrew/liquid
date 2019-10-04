const DATA = {
    curr_task: 'liquid_gui',

    init() {
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

		response_json['reply_contents'].forEach(section => {
			let sec_data = response_json[section];
			switch(section){
				case 'status_ok': 
					/* Handle change/hide dialogue */ console.log('STATUS-OK'); break;
				case 'table_data':
					let rawdata = {
						rows:sec_data.tbl_rows,
						cols:sec_data.tbl_cols
					};
					let extension = 'tsv';
					this.Throwin.add('table', sec_data.node_name, extension, rawdata);
					break;
				case 'text_file':
				case 'text_file2':
					this.Throwin.add('text', sec_data.node_name, sec_data.file_extension, sec_data.file_contents);
					break;
				case 'api_json':
					this.Throwin.add('text', sec_data.node_name, 'json', JSON.stringify(sec_data.json, null, 2)); // TODO // change to json tab type when that is implemented
					this.Throwin.add('json_select', sec_data.node_name+'_select', null, sec_data.json_vars);
					break;
				case 'user_question':
					this.Dialog.handleNew(sec_data); break;
				case 'liquid_served_url':
					let url = 'https://spurcell.pythonanywhere.com' + sec_data.relative_url;
					this.Throwin.add('webpage', sec_data.node_name, 'url', url);
					break;
				default:
					console.error('[DATA.handleResponse] unrecognized reply type: ' + section);
			}
		});
	},

    Dialog: {
        data: [], // History of all questions

        // TODO // Create Option class and move this there
        handleAnswer(ans_id) {
			console.log('test');
			switch(ans_id){
				case 'upload':
				case 'default_throwin_question_only':
					document.querySelector('label[for="throwin_file"]').click();
					return;
			}
			if(ans_id === '' || ans_id === undefined) return;
			let json_data = {
				task_name: DATA.curr_task, // will vary with tasks
				cmd_name: 'user_answer',
				answ_id: ans_id,
				qst_opaque_data: this.data[0].data
			};

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
        
        handleNew(json) {
			// console.log('[QUESTION-IN]',json);
			if(json === undefined){
				this.data.unshift(WAIT_DIALOGUE);
			}else{
				if(!json.error){
					this.add(json.qst_text, json.qst_id, json.qst_opaque_data, json.answ_cands);
				}else{
					this.add(json.error, null, null, null);
				}
			}
			UI.DialogView.render();
        },
        
        add(text, id, data, answ_cands) {
			let options = [];
			for(let i in answ_cands){
				let opt = answ_cands[i];
				options.push({
					jsxElement: <OptionComponent key={i+1} i={i+1} isDefault={0} optText={opt.answ_text} optId={opt.answ_id}/>,
					isDefault: 0,
					opt_text: opt.answ_text,
					opt_id: opt.answ_id,
				});
			}
			this.data.unshift({
				prompt: text,
				id: id,
				data: data,
				options: options
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
        getAll() { return this.data; },
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

		text() {
			let text = prompt('Type or paste content here');
			if(text === null | text === ''){
				console.log('Text input canceled');
				return;
			}
			let name = prompt('Give this file a name');
			if(name === null | name === ''){
				console.log('Name input canceled');
				return;
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