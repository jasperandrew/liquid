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

const debug = {
	on: true,
	log(msg)  { if(this.on) console.log(msg) },
	error(msg){ if(this.on) console.error(msg) },
	warn(msg) { if(this.on) console.warn(msg) },
	info(msg) { if(this.on) console.info(msg) },
}

/************************************************************\
*                         LIQUID APP                         *
\************************************************************/
const Liquid = {
	curr_task: 'liquid_gui',

	initialize() {
		if(debug.on) debug.warn('Debug logs are on!');
		this.httpRequest({
			json_data: {
				task_name: Liquid.curr_task, // will vary with tasks
				cmd_name: 'new_task',
				overwrite: true
			}
		})
		.then(text => {
			debug.log('[new_task] ' + text);
		});

		this.dialogueManager.history.push(INIT_DIALOGUE);
		this.render();
		this.eventHandler.initialize();
		debug.info('Liquid initialized!');
	},

	render() {
		this.dialogueManager.render();
		this.tabManager.render();
		this.menu.render();
		//this.menu.updateTaskList(1);
		debug.info('Liquid rendered!');
	},

	httpRequest(data) {
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
				options.body += field + '=' + (typeof(data[field]) === 'object' ? JSON.stringify(data[field]) : data[field]);
			}
		}

		// debug.log(options.body);

		return fetch(API_URL, options)
		.then(response => response.text())
		.catch(err => {
			console.error('[Liquid.httpRequest] ' + err);
			return { error: '[Liquid.httpRequest] ' + err };
		});
	},

	handleResponse: function(response_txt) {
		if(response_txt === 'OK') return;
		let json;
		try {
			json = JSON.parse(response_txt);
		} catch(e) {
			console.error(response_txt,e);
		}
		debug.log('JSON');
		debug.log(json);

		this.dialogueManager.handleUserQuestion(json.user_question);

		json['reply_contents'].forEach(data => {
			switch(data){
				case 'table_data':
					this.tabManager.handleTableData(json.table_data); break;
				case 'text_file':
					this.tabManager.handleTextFile(json.text_file); break;
				case 'user_question':
				/* 	this.dialogueManager.handleUserQuestion(json.user_question); */break;
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

			Liquid.httpRequest({
				json_data: json_data
			})
			.then(res_text => {
				// debug.log('['+ans_id+'] ' + res_text);

				if(res_text === 'OK'){
					this.history.unshift(WAIT_DIALOGUE);
					this.render();
				}
				Liquid.handleResponse(res_text);
			});

			// this.command_map[ans_id]();
		},

		handleUserQuestion(json) {
			debug.log('QUESTION');
			debug.log(json);
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
				jsxElement: <Tab key={n} i={n} tabName={short_name} format={this.getFormat(ext)}/>,
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
				case 'tsv':
					return 'table';
				case 'txt':
				case 'sql':
					return 'text';
				default:
					return 'text';
			}
		},

		handleTableData(json) {
			let content = {
				cols: [],
				rows: json.tbl_rows
			};
			json.tbl_cols.forEach(col => content.cols.push({ title:col, field:col }));
			this.addTab(json.node_name, 'tsv', 'local', content);
		},

		handleTextFile(json) {
			this.addTab(json.node_name, json.file_extension, 'local', json.file_contents);
		},
	
		render() {
			ReactDOM.render(<TabContainer/>, document.querySelector('#tab_container'));
			this.data.forEach(tab => {
				let t = tab.throwin;
				if(t.format === 'table'){
					if(!t.object){
						t.object = new Tabulator(t.id, {
							layout:'fitData',
							placeholder:'Loading...'
						});
					}
					if(t.src === 'fetch'){
						fetch(t.content)
						.then(res => res.json())
						.then(json => {
							// debug.log(json);
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
						// debug.log(t.content);
						t.object.setColumns(t.content.cols);
						t.object.setData(t.content.rows);
					}
				}else if(t.format === 'text'){
					document.querySelector(t.id).innerHTML = t.content;
				}
			});
		},

		setActiveTab(i) {
			this.active_tab = i;
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

				Liquid.httpRequest({
					'json_data': JSON.stringify(json_data),
					'file_contents': e.target.result
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

		updateTaskList(render) {
			Liquid.httpRequest({
				json_data: {
					task_name: Liquid.curr_task, // will vary with tasks
					cmd_name: 'get_tasks_for_user'
				}
			})
			.then(text => {
				let json = JSON.parse(text);
				debug.log(json);
				this.task_list = json.user_task_list;
				if(render) this.render();
			});
		},

		render() {
			ReactDOM.render(<Menu/>, document.querySelector('nav'));	
			//this.updateTaskList();
		}
	}
};