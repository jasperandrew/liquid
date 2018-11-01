/**************************************************************************
 * JSX stuff
 */
class Dialogue extends React.Component {
	constructor(props) {
		super(props);
	}

	render() {
		return (
			<div className='dialogue'>
				<p className='prompt'>{this.props.prompt}</p>
				<div className='option'>
					<input type='radio' id='ans1' name='answers' value='0'/>
					<label htmlFor='ans1'>Upload a file from your computer</label>
				</div>
				<div className='option'>
					<input type='radio' id='ans2' name='answers' value='1'/>
					<label htmlFor='ans2'>Query a database or call an API</label>
				</div>
			</div>
		);
	}
}

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
				<label onClick={() => tabManager.setActiveTab(this.props.i)} htmlFor={id}>{this.props.tabName}</label>
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
		tabManager.data.forEach(tab => { tabs.push(tab.tabElement); });
		return (
			<div className='tabs'>
				{tabs}
			</div>
		);
	}
}

/**************************************************************************
 * 
 */

let tabManager = {
	data: [],
	activeTab: 1,

	setActiveTab: function(i) {
		this.activeTab = i;
		console.log(this.activeTab);
	},

	addTab: function(name, contentType, contentSource, content) {
		let n = this.data.length + 1;
		this.data.push({
			tabElement: <Tab key={n} i={n} isChecked={n === this.activeTab ? true : false} tabName={name} type={contentType}/>,
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
					console.log(t.content);
					t.object.setColumns(t.content.cols);
					t.object.setData(t.content.rows);
				}
			}else if(t.type === 'text'){
				document.querySelector(t.id).innerHTML = t.content;
			}
		});
	}
};

let testTable = {
	cols: [
		{title: 'A', field: 'a'},
		{title: 'B', field: 'b'}
	],
	rows: [
		{ a:1, b:2 },
		{ a:3, b:4 }
	]
}

tabManager.addTab('Hard-coded Table', 'table', 'local', testTable);
tabManager.addTab('Web API Call', 'table', 'fetch', 'https://jsonplaceholder.typicode.com/posts');
tabManager.addTab('Hard-coded Text', 'text', 'local', 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.');
tabManager.render();

ReactDOM.render(<Dialogue prompt="Let's begin! For your initial table/list, would you like to:"/>, document.querySelector('#dialogue_container'));

const API_URL = 'https://spurcell.pythonanywhere.com/';

// let eventHandler = {
// 	'eventMap': {
// 		 'click .upload': 'tableManager.uploadEventHandler',
// 	},
// 	'init': function() {
// 		this.eventManager(tableManager, this.eventMap);
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

let tableManager = {
	'uploadEventHandler': function(upload) {
		$(upload).on('change', function (input) {
				this.getTableFromRaw(input);
		});
	},
	'getTableFromRaw': function(source, table) {
		function push(filestr, name) {
			let json_data = {
				task_name: 'liquid_gui', // will vary with tasks
				cmd_name: 'throwin_file',
				file_name: name
			};

			fetch(API_URL + 'cmd', {
				method: 'POST',
				headers: {
				  'Content-Type': 'application/x-www-form-urlencoded'
				},
				body: encodeURI('json_data=' + JSON.stringify(json_data) + '&file_contents=' + filestr)
			})
			.then(response => {
				//console.log(response.text());
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

				tabManager.addTab(name, 'table', 'local', content);
				tabManager.render();
			});
			// .then(json => tableManager.setTable(table, json['col_list'], json['table_data']));
		}

		if(source === 'file'){
			let reader = new FileReader(),
				file = document.querySelector('#file').files[0];
			if(!file){
				alert('Select a file from your computer');
				return;
			}

			reader.onload = e => {
                // console.log(e.target.result);
                push(e.target.result, file.name);
            }
			reader.readAsText(file);
		}
	},
	'getUpdatedTable': function(data, table) {
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
};

// var questionHandler = {
// 	'questionMap': {
// 		'question1': {
// 			'questionText': 'lorem ipsum',
// 			'answerOptions': [
// 				{'yes': handler},
// 				{'no': handler}
// 			]
// 		}
// 	}
// };

document.querySelector('#load').addEventListener('click', function(){
    tableManager.getTableFromRaw('file');
});