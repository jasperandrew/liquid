/************************************************************\
*                           GLOBALS                          *
\************************************************************/
const API_URL = 'https://spurcell.pythonanywhere.com/cmd';
const INIT_DIALOGUE = {
	prompt: 'Initial (placeholder)',
	id: null,
	data: null,
	options: [
		{
			jsxElement: <Option key={1} i={1} isDefault={0} optText='Upload a file from your computer' optId=''/>,
			isDefault: 0,
			optText: 'Upload a file from your computer',
			optId: '',
		},
		{
			jsxElement: <Option key={2} i={2} isDefault={0} optText='Call a web API or database' optId=''/>,
			isDefault: 0,
			optText: 'Call a web API or database',
			optId: '',
		}
	]
};

/************************************************************\
*                         LIQUID APP                         *
\************************************************************/
let Liquid = {
	curr_task: 'liquid_gui',

	initialize() {
		this.dialogueManager.history.push(INIT_DIALOGUE);
		this.eventHandler.initialize();
		this.render();
		console.info('Liquid initialized!');
	},

	render() {
		this.dialogueManager.render();
		this.tabManager.render();
	},

	getAllTasks() {
		this.httpRequest({
			json_data: {
				task_name: Liquid.curr_task, // will vary with tasks
				cmd_name: 'get_tasks_for_user'
			}
		})
		.then(text => {
			console.log(text);
		});
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

		// console.log(options.body);

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
			console.log(response_txt,e);
		}
		
		json['reply_contents'].forEach(data => {
			switch(data){
				case 'table_data':
					this.tabManager.handleTableData(json.table_data); break;
				case 'text_file':
					this.tabManager.handleTextFile(json.text_file); break;
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
				console.log(res_text);
			});
			// this.command_map[ans_id]();
		},

		handleUserQuestion(json) {
			this.newQuestion(json.qst_text, json.qst_id, json.qst_opaque_data, json.answ_cands);
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
			this.data.push({
				jsxElement: <Tab key={n} i={n} isChecked={n === this.active_tab ? true : false} tabName={name} format={this.getFormat(ext)}/>,
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
			this.render();
		},

		handleTextFile(json) {
			this.addTab(json.node_name, json.file_extension, 'local', json.file_contents);
			this.render();
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
						// console.log(t.content);
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
				file = document.querySelector('#file').files[0];
			
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
			 'change|#file': 'uploadManager.uploadFromFile'
		},

		initialize() {
			for(let event in this.event_map){
				let a = event.split('|'),
				action = a[0],
				target = a[1],
				elem = document.querySelector(target),
				b = this.event_map[event].split('.'),
				command = e => { Liquid[b[0]][b[1]](e); };

				elem.removeEventListener(action, command);
				elem.addEventListener(action, command);
			}
		}
	}
};

// console.log({
// 	reply_contents: ['user_question', 'table_data'], // An array containing the other sections contained in the response
// 	user_question: { // All of the data pertaining to a new user question
// 		qst_prompt: 'Question prompt',
// 		qst_id: 'qst1',
// 		ans_cands: [
// 			{
// 				ands_text: 'Option 1',
// 				ans_id: 'opt1'
// 			},{
// 				ans_text: 'Option 2',
// 				ans_id: 'opt2'
// 			}
// 		]
// 	},
// 	table_data: { // All of the data pertaining to a table
// 		new_tbl: true, // Whether or not this table is a new table or an updated table
// 		node_name: 'table1.tsv', // The name of the table
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

