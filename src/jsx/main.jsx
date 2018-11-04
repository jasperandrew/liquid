/************************************************************\
*                           GLOBALS                          *
\************************************************************/
const API_URL = 'https://spurcell.pythonanywhere.com/';


/************************************************************\
*                         JSX CLASSES                        *
\************************************************************/
//// Dialogue question/answer stuff ////
class Option extends React.Component {
	constructor(props) {
		super(props);
	}

	render() {
		return (
			<div className='option'>
				<input type='radio' id={'opt' + this.props.i} name='options' value={this.props.optId}/>
				<label htmlFor={'opt' + this.props.i}>{this.props.optText}</label>
			</div>
		);
	}
}

class Dialogue extends React.Component {
	constructor(props) {
		super(props);
	}

	render() {
		let options = [];
		Liquid.dialogueManager.history[0].options.forEach(opt => { options.push(opt.jsxElement); });

		return (
			<div className='dialogue'>
				<p className='prompt'>{this.props.prompt}</p>
				{options}
			</div>
		);
	}
}

//// Throwin/tab layout stuff ////
class Throwin extends React.Component {
	constructor(props) {
		super(props);
	}

	render() {
		return (
			<div className={this.props.type} id={'t' + this.props.i}></div>
		);
	}
}

class Tab extends React.Component {
	constructor(props) {
		super(props);
	}

	render() {
		let id = 'tab' + this.props.i;

		return (
			<div className='tab'>
				<input type='radio' id={id} name='tabs' defaultChecked={this.props.isChecked}/>
				<label onClick={() => Liquid.tabManager.setActiveTab(this.props.i)} htmlFor={id}>{this.props.tabName}</label>
				<div className='throwin'>
					<Throwin type={this.props.type} i={this.props.i}/>
				</div>
			</div>
		);
	}
}

class TabContainer extends React.Component {
	constructor(props){
		super(props);
	}

	render() {
		let tabs = [];
		Liquid.tabManager.data.forEach(tab => { tabs.push(tab.jsxElement); });

		return (
			<div className='tabs'>
				{tabs}
			</div>
		);
	}
}


/************************************************************\
*                         LIQUID APP                         *
\************************************************************/
let Liquid = {
	initialize: function() {
		this.dialogueManager.history.push({
			prompt: 'Initial',
			id: null,
			data: null,
			options: [
				{
					jsxElement: <Option key={1} i={1} isDefault={0} optText='Upload a file from your computer' optId='upload'/>,
					isDefault: 0,
					optText: 'Upload a file from your computer',
					optId: 'upload',
				},
				{
					jsxElement: <Option key={2} i={2} isDefault={0} optText='Call a web API or database' optId='call'/>,
					isDefault: 0,
					optText: 'Call a web API or database',
					optId: 'call',
				}
			]
		});
	},

	renderAll: function() {
		this.dialogueManager.render();
		this.tabManager.render();
	},

	handleResponse: function(responseJSON) {
		if(responseJSON['reply_type'] === 'user_question'){
			this.dialogueManager.newQuestion(responseJSON);
		}
	},

	//// Manages question/answer dialogue ////
	dialogueManager: {
		history: [], // History of all questions
		currPos: 0, // Current history position (0 is the latest one, increasing numbers are older)

		newQuestion: function(responseJSON) {
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
			// console.log(this.history);
		},

		render: function() {
			ReactDOM.render(<Dialogue prompt={this.history[0].prompt}/>, document.querySelector('#dialogue_container'));
		}
	},

	//// Manages throwin/tab layout ////
	tabManager: {
		data: [], // All tabs
		activeTab: 1, // Currently active tab
		
		addTab: function(name, contentType, contentSource, content) {
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
	
		render: function() {
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
						.then(response => {
							return response.json();
						})
						.then(json => {
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

		setActiveTab: function(i) {
			this.activeTab = i;
		}
	},

	//// Manages user-created file uploads ////
	uploadManager: {
		// uploadEventHandler: function(upload) {
		// 	$(upload).on('change', function (input) {
		// 			this.newTableFromFile(input);
		// 	});
		// },
		newTableFromFile: function() {
			let reader = new FileReader(),
				file = document.querySelector('#file').files[0];
			if(!file){
				alert('Select a file from your computer');
				return;
			}

			reader.onload = e => {
				let json_data = {
					task_name: 'liquid_gui', // will vary with tasks
					cmd_name: 'throwin_file',
					file_name: file.name
				};
	
				fetch(API_URL + 'cmd', {
					method: 'POST',
					headers: {
					  'Content-Type': 'application/x-www-form-urlencoded'
					},
					body: encodeURI('json_data=' + JSON.stringify(json_data) + '&file_contents=' + e.target.result)
				})
				.then(response => {
					//console.log(response);
					return response.json()
				})
				.catch(err => console.log('[UploadError] ' + err))
				.then(json => {
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
		},
		getUpdatedTable: function(data, table) {
			return $.ajax({
					type: 'post',
					data: data,
					dataType: 'json',
					url: liquidShawnUrl
				}).done(function(response) {
					this.updateTable(table, response);
				}).fail(function(error) {
					console.error('Error retrieving table: ', error);
				});
		}
	}
};

// let eventHandler = {
// 	'eventMap': {
// 		 'click .upload': 'uploadManager.uploadEventHandler',
// 	},
// 	'init': function() {
// 		this.eventManager(uploadManager, this.eventMap);
// 	},
// 	'eventManager': function(namespace, eventMap) {
// 		$.each(eventsMap, function(eventTypeSelector, handler) {
// 			var a = eventTypeSelector.split(' ');
// 			var eventType = a[0];
// 			var selector = a[1];
// 			$(selector).off(eventType);
// 			if(handler.indexOf('.') > -1){
// 				var submodule = handler.split('.')[0];
// 				var submoduleHandler = handler.split('.')[1];
// 				$(selector).on(eventType, function(event) {
// 						namespace[submodule][submoduleHandler](event);
// 				});
// 			} else {
// 					$(selector).on(eventType, function(event) {
// 							namespace[handler](event);
// 					});
// 			}
// 		});
// 	}
// };

document.querySelector('#load').addEventListener('click', function(){
    Liquid.uploadManager.newTableFromFile('file');
});

// Liquid.tabManager.addTab('Hard-coded Table', 'table', 'local', {
// 	cols: [
// 		{title: 'Ay', field: 'a'},
// 		{title: 'Be', field: 'b'}
// 	],
// 	rows: [
// 		{ a:1, b:2 },
// 		{ a:3, b:4 }
// 	]
// });
// Liquid.tabManager.addTab('Web API Call', 'table', 'fetch', 'https://jsonplaceholder.typicode.com/posts');
// Liquid.tabManager.addTab('Hard-coded Text', 'text', 'local', 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.');

Liquid.initialize();
Liquid.renderAll();

console.log({
	reply_contents: ['user_question', 'table_data'], // An array containing the other sections contained in the response
	user_question: { // All of the data pertaining to a new user question
		qst_prompt: 'Question prompt',
		qst_id: 'qst1',
		qst_opts: [
			{
				opt_text: 'Option 1',
				opt_id: 'opt1'
			},{
				opt_text: 'Option 2',
				opt_id: 'opt2'
			}
		]
	},
	table_data: { // All of the data pertaining to a table
		new_tbl: true, // Whether or not this table is a new table or an updated table
		tbl_name: 'table1.tsv', // The name of the table
		tbl_cols: [ // Column data, in order
			{
				title: 'Column 1', // The "pretty" name for the column. Can just be the same as the field.
				field: 'col1' // The actual name of the field in the row data
			},{
				title: 'Column 2',
				field: 'col2'
			}
		],
		tbl_rows: [ // Row data, exactly the same as 'table_data' in the current spec
			{
				col1: 'row1 col1',
				col2: 'row1 col2'
			},{
				col1: 'row2 col1',
				col2: 'row2 col2'
			}
		]
	}
});