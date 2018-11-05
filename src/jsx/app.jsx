/************************************************************\
*                           GLOBALS                          *
\************************************************************/
const API_URL = 'https://spurcell.pythonanywhere.com/cmd';


/************************************************************\
*                         LIQUID APP                         *
\************************************************************/
let Liquid = {
	initialize() {
		this.dialogueManager.history.push({
			prompt: 'Initial',
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
		});
		this.eventHandler.initialize();
		this.renderAll();
		console.log('Liquid initialized!');
	},

	renderAll() {
		this.dialogueManager.render();
		this.tabManager.render();
	},

	httpRequest(url, data) {
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
				options.body += field + '=' + data[field];
			}
		}

		console.log(url,options.body);

		return fetch(url, options)
		.then(response => response.text())
		.catch(err => {
			console.log('[RequestError] ' + err);
			return { error: err };
		});
	},

	handleResponse: function(responseJSON) {
		if(responseJSON['reply_type'] === 'user_question'){
			this.dialogueManager.newQuestion(responseJSON);
		}
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
				task_name: 'liquid_gui', // will vary with tasks
				cmd_name: 'user_answer',
				answ_id: ans_id
			};

			Liquid.httpRequest(API_URL, {
				'json_data': JSON.stringify(json_data)
			})
			.then(json => {
				console.log(json);
			});
			// this.command_map[ans_id]();
		},

		newQuestion(responseJSON) {
			let options = [];
			for(let i in responseJSON['answ_cands']){
				let opt = responseJSON['answ_cands'][i];
				options.push({
					jsxElement: <Option key={i+1} i={i+1} isDefault={0} optText={opt['answ_text']} optId={opt['answ_id']}/>,
					isDefault: 0,
					optText: opt['answ_text'],
					optId: opt['answ_id'],
				});
			}

			this.history.unshift({
				prompt: responseJSON['qst_text'],
				id: responseJSON['qst_id'],
				data: responseJSON['qst_data'],
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
		activeTab: 1, // Currently active tab
		
		addTab(name, contentType, contentSource, content) {
			let n = this.data.length + 1;
			this.data.push({
				jsxElement: <Tab key={n} i={n} isChecked={n === this.activeTab ? true : false} tabName={name} type={contentType}/>,
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
	
		render() {
			ReactDOM.render(<TabContainer/>, document.querySelector('#tab_container'));
			this.data.forEach(tab => {
				let t = tab.throwin;
				if(t.type === 'table'){
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
				}else if(t.type === 'text'){
					document.querySelector(t.id).innerHTML = t.content;
				}
			});
		},

		setActiveTab(i) {
			this.activeTab = i;
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

			let file_type = file.name.split('.').pop();
			if(file_type !== 'tsv'){
				alert('Don\'t currently support .' + file_type + ' files, just .tsv');
				return;
			}

			reader.onload = e => {
				let json_data = {
					task_name: 'liquid_gui', // will vary with tasks
					cmd_name: 'throwin_file',
					file_name: file.name
				};
	
				Liquid.httpRequest(API_URL, {
					'json_data': JSON.stringify(json_data),
					'file_contents': e.target.result
				})
				.then(json => {
					json = JSON.parse(json);
					console.log(json);
					let content = {
						cols: [],
						rows: json.table_data
					};
					json.col_list.forEach(col => content.cols.push({ title:col, field:col }));
	
					Liquid.tabManager.addTab(file.name, 'table', 'local', content);
					Liquid.tabManager.render();

					Liquid.dialogueManager.newQuestion(json);
					Liquid.dialogueManager.render();
				});	
			}
			reader.readAsText(file);
		}
	},

	eventHandler: {
		event_map: {
			 'click|#load': 'uploadManager.uploadFromFile'
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

document.querySelector('#load').addEventListener('click', function(){
    ;
});

// console.log({
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