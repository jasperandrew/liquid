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
				<label htmlFor={id}>{this.props.tabName}</label>
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
	addTab: function(name, contentType, contentSource, content) {
		console.log(content);
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
					let data = { cols: [], rows: [] };
					fetch(t.content)
					.then(response => {
						console.log(response);
						return response.json();
					})
					.then(json => json.forEach(row => {
						data.rows.push(row);
					}))
					.then(() => {
						for(let item in data.rows[0]){
							data.cols.push({ title:item, field:item });
						}
					})
					.then(() => {
						t.object.setColumns(data.cols);
						t.object.setData(data.rows);
					});
				}else{
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

let eventHandler = {
	'eventMap': {
		 'click .upload': 'tableManager.uploadEventHandler',
	},
	'init': function() {
		this.eventManager(tableManager, this.eventMap);
	},
	'eventManager': function(namespace, eventMap) {
		$.each(eventsMap, function(eventTypeSelector, handler) {
			var a = eventTypeSelector.split(' ');
			var eventType = a[0];
			var selector = a[1];
			$(selector).off(eventType);
			if(handler.indexOf('.') > -1){
				var submodule = handler.split('.')[0];
				var submoduleHandler = handler.split('.')[1];
				$(selector).on(eventType, function(event) {
						namespace[submodule][submoduleHandler](event);
				});
			} else {
					$(selector).on(eventType, function(event) {
							namespace[handler](event);
					});
			}
		});
	}
};

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
			let body = encodeURI('json_data=' + JSON.stringify(json_data) + '&file_contents=' + filestr);
			console.log((body));
			fetch(API_URL + 'cmd', {
				method: 'POST',
				headers: {
				  'Content-Type': 'application/x-www-form-urlencoded'
				},
				body: body
			})
			.then(response => {
                console.log(response);
                return response.text();
            })
			.catch(err => console.log('[Upload error] ' + err))
			.then(json => console.log(json));
			// .then(json => tableManager.setTable(table, json['col_list'], json['table_data']));
		}

		if(source === 'file'){
			let reader = new FileReader(),
				file = document.querySelector('#file').files[0];
			reader.onload = e => {
                console.log(e.target.result);
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
	},
	'setTable': function(table, columns, data) {
        let cols = [];
        for(i in columns) cols.push({ title:columns[i].toUpperCase(), field:columns[i] });
        console.log(cols, data);
		tables[table].setColumns(cols);
		tables[table].setData(data);
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
    //loadTableData('https://jsonplaceholder.typicode.com/users', 0);
    tableManager.getTableFromRaw('file', 0);
    // loadTableData('https://jsonplaceholder.typicode.com/posts', 1);
    // loadTableData('https://jsonplaceholder.typicode.com/comments', 2);
});