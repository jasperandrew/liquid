/************************************************************\
*                           GLOBALS                          *
\************************************************************/
const API_URL = 'https://spurcell.pythonanywhere.com/cmd';
const INIT_DIALOGUE = {
	prompt: 'Let\'s begin.  Choose the \'wizard\' interview or just start throwing in input and output files with the blue button.',
	id: null,
	data: null,
	options: [
		{
			jsxElement: <Option key={1} i={1} isDefault={0} optText='Start the interview wizard' optId='wizard'/>,
			isDefault: 0,
			optText: 'Start the interview wizard',
			optId: 'wizard',
		},
		{
			jsxElement: <Option key={2} i={2} isDefault={0} optText='Upload ("Throw in") a file from your computer' optId='upload'/>,
			isDefault: 0,
			optText: 'Upload ("Throw in") a file from your computer',
			optId: 'upload',
		}
	]
};
const WAIT_DIALOGUE = {
	prompt: 'Throw in the next file using the Throw-In button.',
	id: null,
	data: null,
	options: null
};

/************************************************************\
*                         LIQUID APP                         *
\************************************************************/
const Liquid = {
	curr_task: 'liquid_gui',

	initialize() {
		this.httpRequest({
			json_data: {
				task_name: Liquid.curr_task, // will vary with tasks
				cmd_name: 'new_task',
				overwrite: true
			}
		})
		.then(text => {
			console.log('[NEW-TASK] ' + JSON.parse(text).status_ok.status);
		});

		this.dialogueManager.history.push(INIT_DIALOGUE);
		this.render();
		this.eventHandler.initialize();
		console.info('Liquid initialized!');
	},

	render() {
		this.dialogueManager.render();
		this.tabManager.render();
		this.menu.render();
		//this.menu.updateTaskList(1);
		console.info('Liquid rendered!');
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
			console.error('[Liquid.httpRequest] ' + err);
			return { error: '[Liquid.httpRequest] ' + err };
		});
	},

	handleResponse: function(response_txt) {
		let json;
		try {
			json = JSON.parse(response_txt);
		} catch(e) {
			console.error('[Error] Non-JSON response received:\n\n' + response_txt);
			alert('[Error] Non-JSON response received:\n\n' + response_txt);
			return;
		}
		console.log('[DATA-IN]',json);

		json['reply_contents'].forEach(data => {
			switch(data){
				case 'status_ok': 
					/* Handle change/hide dialogue */ console.log('STATUS-OK'); break;
				case 'table_data':
					this.tabManager.handleTableData(json.table_data); break;
				case 'text_file':
					this.tabManager.handleTextFile(json.text_file); break;
				case 'api_json':
					this.tabManager.handleJSON(json.api_json, true); break;
				case 'user_question':
					this.dialogueManager.handleUserQuestion(json.user_question); break;
				default:
					console.error('[Liquid.handleResponse] unrecognized reply type: ' + data);
			}
		});
	},

	//// Manages question/answer dialogue ////
	dialogueManager: {
		history: [], // History of all questions
		curr_pos: 0, // Current history position (0 is the latest one, increasing numbers are older)
		command_map: {
			'': function(){}
		},

		handleAnswer(ans_id) {
			switch(ans_id){
				case 'upload':
					document.querySelector('label[for="throwin_file"]').click(); return;
			}
			if(ans_id === '' || ans_id === undefined) return;
			let json_data = {
				task_name: Liquid.curr_task, // will vary with tasks
				cmd_name: 'user_answer',
				answ_id: ans_id,
				qst_opaque_data: this.history[this.curr_pos].data
			};

			// console.log('[ANSWER-OUT]',json_data);

			Liquid.httpRequest({
				json_data: json_data
			})
			.then(res_text => {
				let res_json = JSON.parse(res_text);

				if(res_json.reply_contents.indexOf('status_ok') !== -1){
					if(res_json.status_ok.status === 'OK'){
						this.history.unshift(WAIT_DIALOGUE);
						this.render();	
					}
				}
				Liquid.handleResponse(res_text);
			});

			// this.command_map[ans_id]();
		},

		handleUserQuestion(json) {
			// console.log('[QUESTION-IN]',json);
			if(json === undefined){
				this.history.unshift(WAIT_DIALOGUE);
			}else{
				if(!json.error){
					this.newQuestion(json.qst_text, json.qst_id, json.qst_opaque_data, json.answ_cands);
				}else{
					this.newQuestion(json.error, null, null, null);
				}
			}
			this.render();
		},

		newQuestion(text, id, data, answ_cands) {
			let options = [];
			for(let i in answ_cands){
				let opt = answ_cands[i];
				options.push({
					jsxElement: <Option key={i+1} i={i+1} isDefault={0} optText={opt.answ_text} optId={opt.answ_id}/>,
					isDefault: 0,
					opt_text: opt.answ_text,
					opt_id: opt.answ_id,
				});
			}
			this.history.unshift({
				prompt: text,
				id: id,
				data: data,
				options: options
			});
		},

		render() {
			ReactDOM.render(<Dialogue prompt={this.history[0].prompt}/>, document.querySelector('#dialogue_container'));
		}
	},

	//// Manages throwin/tab layout ////
	tabManager: {
		data: [], // All tabs
		active_tab: 1, // Currently active tab
		
		addTab(name, ext, source, content) {
			let n = this.data.length + 1;
			let short_name = name.split('/').pop();
			this.data.push({
				jsxElement: <Tab key={n} i={n} tabName={short_name} format={this.getFormat(ext)} content={content}/>,
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

		getFormat(extension) {
			switch(extension){
				case 'json_select':
					return 'json_select';
				case 'tsv':
					return 'table';
				// case 'txt':
				// case 'sql':
				default:
					return 'text';
			}
		},

		handleTableData(json) {
			let content = {
				cols: [],
				rows: json.tbl_rows
			};
			if(typeof(json.tbl_cols[0]) === "string"){ // Temporary check to see if cols are string or object
				json.tbl_cols.forEach(col => content.cols.push({ title:col, field:col, editor:true }));
			}else{
				content.cols = json.tbl_cols;
			}

			this.addTab(json.node_name, 'tsv', 'local', content);
		},

		handleTextFile(json) {
			this.addTab(json.node_name, json.file_extension, 'local', json.file_contents);
		},

		handleJSON(data, selection) {
			this.addTab(data.node_name, 'json', 'local', JSON.stringify(data.json, null, 2));
			if(selection){
				this.addTab(data.node_name+'_select', 'json_select', 'local', data.json_vars);
			}
		},
	
		render() {
			ReactDOM.render(<TabContainer/>, document.querySelector('#tab_container'));
			this.data.forEach(tab => {
				let t = tab.throwin;
				if(t.format === 'table'){
					if(!t.object){
						t.object = new Tabulator(t.id, {
							layout:'fitData',
							placeholder:'Loading...',
							movableColumns: true
						});
					}
					if(t.src === 'fetch'){
						fetch(t.content)
						.then(res => res.json())
						.then(json => {
							// console.log(json);
							t.content = { cols: [], rows: [] };
							t.src = 'local';
	
							json.forEach(row => t.content.rows.push(row));
	
							for(let item in t.content.rows[0]){
								t.content.cols.push({ title:item, field:item, editor:'input' });
							}
	
							t.object.setColumns(t.content.cols);
							t.object.setData(t.content.rows);
						});
					}else{
						t.object.setColumns(t.content.cols);
						t.object.setData(t.content.rows);
					}
				}
			});
		},

		setActiveTab(i) {
			this.active_tab = i;
		},

		submitJSONvars(tab_selector) {
			let selected = {};
			document.querySelectorAll('.throwin ' + tab_selector + ' input:checked').forEach(input => {
				selected[input.attributes['keyname'].value] = input.attributes['keyval'].value;
			});

			let json_data = {
				task_name: Liquid.curr_task,
				cmd_name: 'user_input',
				input_type: 'json_vars_selection',
				json_vars_selection: selected,
				qst_opaque_data: Liquid.dialogueManager.history[Liquid.dialogueManager.curr_pos].data
			}

			Liquid.httpRequest({
				json_data: json_data
			})
			.then(response => { Liquid.handleResponse(response) });
		}
	},

	//// Manages user-created file uploads ////
	uploadManager: {
		uploadFromFile() {
			let reader = new FileReader(),
				file = document.querySelector('#throwin_file').files[0];
			
			if(!file || file === undefined){
				alert('Select a file from your computer');
				return;
			}

			// let file_type = file.name.split('.').pop();

			reader.onload = e => {
				let json_data = {
					task_name: Liquid.curr_task, // will vary with tasks
					cmd_name: 'throwin_file',
					file_name: file.name
				};

				let encoded_result = (e.target.result);

				Liquid.httpRequest({
					'json_data': (JSON.stringify(json_data)),
					'file_contents': encoded_result
				})
				.then(response => { Liquid.handleResponse(response) });
			}
			reader.readAsText(file);
		}
	},

	eventHandler: {
		event_map: {
			 '#throwin_file|change': 'uploadManager.uploadFromFile',
			 '#task_list h2|click': 'menu.updateTaskList'
		},

		initialize() {
			for(let event in this.event_map){
				let a = event.split('|'),
				target = a[0],
				action = a[1],
				elem = document.querySelector(target),
				b = this.event_map[event].split('.'),
				command = e => { Liquid[b[0]][b[1]](e); };

				elem.removeEventListener(action, command);
				elem.addEventListener(action, command);
			}
		}
	},

	menu: {
		task_list: ['these', 'are', 'placeholders'],

		updateTaskList(do_render) {
			Liquid.httpRequest({
				json_data: {
					task_name: Liquid.curr_task, // will vary with tasks
					cmd_name: 'get_tasks_for_user'
				}
			})
			.then(text => {
				let json = JSON.parse(text);
				console.log('updateTaskList',json);
				this.task_list = json.user_task_list;
				if(do_render) this.render();
			});
		},

		render() {
			ReactDOM.render(<Menu/>, document.querySelector('nav'));	
			//this.updateTaskList();
		}
	}
};