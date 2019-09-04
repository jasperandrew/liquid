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
			jsxElement: <OptionComponent key={1} i={1} isDefault={0} optText='Start the interview wizard' optId='wizard'/>,
			isDefault: 0,
			optText: 'Start the interview wizard',
			optId: 'wizard',
		},
		{
			jsxElement: <OptionComponent key={2} i={2} isDefault={0} optText='Upload ("Throw in") a file from your computer' optId='upload'/>,
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
// TODO // Move these somewhere
function triTickFormatter(cell,formatterParams,onRendered) {
	switch(cell.getValue()){
		case undefined: cell.setValue(null); return '☐';
		case null: return '☐';
		case false: return '☒';
		case true: return '☑';
	}
}

function triTickCellClick(e,cell) {
	console.log(cell.getValue());
	switch(cell.getValue()){
		case undefined: cell.setValue(true); break;
		case null: cell.setValue(true); break;
		case false: cell.setValue(null); break;
		case true: cell.setValue(false); break;
	}
}

function jsepToString(tree, side = null) {
	let err_str = '{ERR}';
	switch(tree.type){
		// case 'Compound':
		case 'Identifier':{
			let q = (side === 'r' ? '\'' : ''),
				d1 = (side === 'l' ? 'data[\'' : ''),
				d2 = (side === 'l' ? '\']' : '');
			return q+d1+tree.name+d2+q;
		}
		// case 'MemberExpression':
		case 'Literal':{
			let q = (side === 'r' ? '\'' : ''),
				d1 = (side === 'l' ? 'data[\'' : ''),
				d2 = (side === 'l' ? '\']' : '');
			return q+d1+tree.value+d2+q;
		}
		// case 'ThisExpression':
		// case 'CallExpression':
		case 'UnaryExpression':{
			let op;
			switch(tree.operator){
				case 'not': op = '!'; break;
				default: op = tree.operator;
			}
			return `${tree.operator}(${jsepToString(tree.argument, 'r')})`;
		}
		case 'BinaryExpression':{
			if(tree.left.type === 'Literal'){
				// TODO // validate column identifiers
			}else if(tree.left.type !== 'Identifier'){
				console.error(`jsepToString: Left argument of a binary expression must be a column identifier`);
				return err_str;
			}
			let op;
			switch(tree.operator){
				case '=':
				case 'is': op = '=='; break;

				case 'is not':
				case 'isn\'t': op = '!='; break;

				case 'in':{
					if(tree.right.type !== 'ArrayExpression'){
						console.error(`jsepToString: Invalid usage of 'in' operator`);
						return err_str;
					}
					let arr = '[';
					for(let i in tree.right.elements){
						if(!['Literal', 'Identifier'].includes(tree.right.elements[i].type)){
							console.error(`jsepToString: Invalid usage of 'in' operator`);
							return err_str;
						}
						arr += jsepToString(tree.right.elements[i], 'r') + ',';
					}
					arr += ']';
					return `${arr}.includes(${jsepToString(tree.left, 'l')})`;
				}
				case 'contains':{
					if(!['Literal', 'Identifier'].includes(tree.right.type)){
						console.error(`jsepToString: Invalid usage of 'contains' operator`);
						return err_str;
					}
					return `${jsepToString(tree.left, 'l')}.includes(${jsepToString(tree.right, 'r')})`;
				}
				case 'regex':{
					if(!['Literal', 'Identifier'].includes(tree.right.type)){
						console.error(`jsepToString: Invalid usage of 'regex' operator`);
						return err_str;
					}
					let regex = new RegExp(jsepToString(tree.right, null)).toString();
					return `${regex}.test(${jsepToString(tree.left, 'l')})`;
				}
				default: op = tree.operator;
			}
			return `(${jsepToString(tree.left, 'l')} ${op} ${jsepToString(tree.right, 'r')})`;
		}
		case 'LogicalExpression':
			return `(${jsepToString(tree.left, 'l')} ${tree.operator} ${jsepToString(tree.right, 'r')})`;
		// case 'ConditionalExpression':
		// case 'ArrayExpression':
		default:
			console.error(`jsepToString: Unsupported expression type '${tree.type}'`);
			return err_str;
	}
}

function arbitraryFilter(data, filterParams) { // one > 2 & two < 5
	let replace = {'&':'&&', '|':'||'}; // TODO // implement NOT operator
	let filter = filterParams.split('').join('');
	for(let r in replace){
		let regex = new RegExp(`([^${r}])\\${r}([^${r}])`);
		filter = filter.replace(regex, `$1${replace[r]}$2`);
	}
	console.log(filter);
	// try {
	// 	let parsed_tree = jsep(filter);
	// 	console.log(parsed_tree);
	// 	if(parsed_tree.type !== 'BinaryExpression'){
	// 		console.log('Invalid expression type');
	// 		return true;
	// 	}
	// } catch(e) {
	// 	console.log(`JSEP: ${e.message}`);
	// 	return true;
	// }



	// console.log(parse('( one > 2 && two < 5 || blah == 9 ) || (three == 1)'));

	let func_str = 'return ' + jsepToString(jsep(filter));
	console.log(func_str);

	try{
		let result = new Function('data', func_str);
		return result(data);
	}catch(e){
		console.error(`Filter: ${e}`);
		return false;
	}
}

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
					this.tabManager.addTab('table', sec_data.node_name, extension, rawdata);
					break;
				case 'text_file':
				case 'text_file2':
					this.tabManager.addTab('text', sec_data.node_name, sec_data.file_extension, sec_data.file_contents);
					break;
				case 'api_json':
					this.tabManager.addTab('text', sec_data.node_name, 'json', JSON.stringify(sec_data.json, null, 2)); // TODO // change to json tab type when that is implemented
					this.tabManager.addTab('json_select', sec_data.node_name+'_select', null, sec_data.json_vars);
					break;
				case 'user_question':
					this.dialogueManager.handleUserQuestion(sec_data); break;
				default:
					console.error('[Liquid.handleResponse] unrecognized reply type: ' + section);
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
				case 'default_throwin_question_only':
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
					jsxElement: <OptionComponent key={i+1} i={i+1} isDefault={0} optText={opt.answ_text} optId={opt.answ_id}/>,
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
			ReactDOM.render(<DialogueComponent prompt={this.history[0].prompt}/>, document.querySelector('#dialogue_container'));
		}
	},

	//// Manages throwin/tab layout ////
	tabManager: {
		tabs: [], // All tabs
		active_tab: 1, // Currently active tab
		
		addTab(type, name, extension, rawdata) {
			let new_tab;
			switch(type){
				case 'text': new_tab = new TextTab(name, extension, rawdata); break;
				case 'table': new_tab = new TableTab(name, extension, rawdata); break;
				case 'json': new_tab = new JSONTab(name, extension, rawdata); break;
				case 'json_select': new_tab = new JSONSelectTab(name, extension, rawdata); break;
			}
			this.tabs.push(new_tab);
			this.active_tab = this.tabs.length;
			this.render();
		},

		getTab(n) {
			if(this.tabs[n-1]) return this.tabs[n-1];
			return false;
		},

		getAllTabs() { return this.tabs; },

		getActiveTab() { return this.getTab(this.active_tab); },
	
		render() {
			ReactDOM.render(<TabViewComponent/>, document.querySelector('#tab_container'));
			this.tabs.forEach(tab => {
				if(tab.getType() === 'table'){
					if(!tab.getTableObject()){
						let data = tab.getRawData();
						let obj = new Tabulator('#t' + tab.getID(), {
							layout:'fitData',
							placeholder:'Loading...',
							movableColumns: true,
							rowFormatter: data.formatter
						});

						obj.setColumns(data.cols);
						obj.setData(data.rows);

						tab.setTableObject(obj);

						// TODO // Make this stuff go away
						window.setTimeout(() => obj.addColumn({title:'select',field:'selection',visible:false, formatter:triTickFormatter, cellClick:triTickCellClick },true), 10);
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
		},

		uploadFromText() {
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
				task_name: Liquid.curr_task,
				cmd_name:'throwin_text',
				file_contents: text,
				node_name: name
			}

			Liquid.httpRequest({
				'json_data': JSON.stringify(json_data)
			})
			.then(response => { Liquid.handleResponse(response) });
		}
	},

	eventHandler: {
		event_map: {
			 '#throwin_file|change': 'uploadManager.uploadFromFile',
			 '#throwin_text|click': 'uploadManager.uploadFromText',
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

		toggleCheckboxes(n) {
			let tab = Liquid.tabManager.getTab(n);
			if(tab !== false){
				if(tab.getType() !== 'table'){
					console.error(`tab ${n} isn\'t a table tab`);
					return false;
				}
				let tab_object = tab.getTableObject();
				tab_object.toggleColumn('selection');
			}else{
				console.log(`invalid  tab: ${n}`);
			}
		},

		render() {
			ReactDOM.render(<NavComponent/>, document.querySelector('nav'));
			//this.updateTaskList();
		}
	}
};

function nestedTableTest() {
	
}

function sendTableData() {
	let name = window.prompt('Give a name for the selection column:','select');
	let tab = Liquid.tabManager.getActiveTab();
	if(tab.getType() !== 'table'){
		console.error(`tab ${n} isn\'t a table tab`);
		return false;
	}

	let object = tab.getTableObject();

	let table = {
		cols: object.getColumnDefinitions(),
		rows: object.getData()
	}

	let json_data = {
		cmd_name: 'user_input',
		input_type: 'checkbox_values',
		tag_col_name: name,
		tabulator_table: table,
		task_name: 'dentists'
	}

	Liquid.httpRequest({
		'json_data': JSON.stringify(json_data)
	})
	.then(response => { Liquid.handleResponse(response) });

	
}

function addCheckColumn() {
	let col_name = window.prompt('Give a name for the new checkbox column:','checked');
	Liquid.tabManager.getActiveTab().getTableObject().addColumn({title:col_name,field:col_name,formatter:triTickFormatter, cellClick:triTickCellClick },true);
}

function addTextColumn() {
	let col_name = window.prompt('Give a name for the new text column:','notes');
	Liquid.tabManager.getActiveTab().getTableObject().addColumn({title:col_name,field:col_name,editor:true},true);
}

function filterColumn() {
	let col = window.prompt('Which column do you want to filter?');
	let fnc = window.prompt('What function do you want to filter with? (=,!=,like,<,<=,>,>=,in,regex)');
	let val = window.prompt('What value do you want to filter by?');
	Liquid.tabManager.getActiveTab().getTableObject().setFilter(col, fnc, val);
}

function filterCustom() {
	let str = window.prompt('Type the filter string here');
	Liquid.tabManager.getActiveTab().getTableObject().setFilter(arbitraryFilter, str);
}

function clearFilters() {
	Liquid.tabManager.getActiveTab().getTableObject().clearFilter();
}

function lockDialogue() {
	UI.toggleClass('.dialogue','locked');
}