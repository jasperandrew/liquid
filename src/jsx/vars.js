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


/** Test functions */
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

function insertCheckboxColumn() {
	let col_name = window.prompt('Give a name for the new checkbox column:','checked');
	DATA.Throwin.get(UI.TabView.getActive()).getTableObject().addColumn({title:col_name,field:col_name,formatter:triTickFormatter, cellClick:triTickCellClick },true);
}

function insertTextColumn() {
	let col_name = window.prompt('Give a name for the new text column:','notes');
	DATA.Throwin.get(UI.TabView.getActive()).getTableObject().addColumn({title:col_name,field:col_name,editor:true},true);
}

function filterColumn() {
	let col = window.prompt('Which column do you want to filter?');
	let fnc = window.prompt('What function do you want to filter with? (=,!=,like,<,<=,>,>=,in,regex)');
	let val = window.prompt('What value do you want to filter by?');
	DATA.Throwin.get(UI.TabView.getActive()).getTableObject().setFilter(col, fnc, val);
}

function filterCustom() {
	let str = window.prompt('Type the filter string here');
	DATA.Throwin.get(UI.TabView.getActive()).getTableObject().setFilter(arbitraryFilter, str);
}

function clearFilters() {
	DATA.Throwin.get(UI.TabView.getActive()).getTableObject().clearFilter();
}

function lockDialogue() {
	UI.toggleClass('#dialogue','locked');
}

function toggleCheckboxColumn() {
	let tab = DATA.Throwin.get(UI.TabView.getActive());
	if(tab){
		if(tab.getType() !== 'table'){
			console.error(`current tab isn\'t a table tab`);
			return false;
		}
		let tab_object = tab.getTableObject();
		tab_object.toggleColumn('selection');
	}else{
		console.log(`invalid  tab`);
	}
}