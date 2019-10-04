/************************************************************\
*                         JSX CLASSES                        *
\************************************************************/

//////////// Dialogue question/answer stuff ////////////

class OptionComponent extends React.Component {
	constructor(props) {
		super(props);
	}

	render() {
		return (
			<div className='option'>
				<input type='radio' id={'opt' + this.props.i} name='options' value={this.props.optId}/>
				<label htmlFor={'opt' + this.props.i} onClick={() => Liquid.dialogueManager.handleAnswer(this.props.optId)}>{this.props.optText}</label>
			</div>
		);
	}
}

class DialogueComponent extends React.Component {
	constructor(props) {
		super(props);
	}

	render() {
		let opts = Liquid.dialogueManager.history[0].options,
			opts_jsx = [];

		if(opts !== null)
			opts.forEach(opt => { opts_jsx.push(opt.jsxElement); });

		return (
			<div className='dialogue'>
				<p className='prompt'>{this.props.prompt}</p>
				{opts_jsx}
			</div>
		);
	}
}

//////////// Tab layout stuff ////////////

class TabComponent extends React.Component {
	constructor(props) {
		super(props);
	}

	render() {
		let id = 'tab' + this.props.n;
		let innerHTML = [];
		
		switch(this.props.type){
			case 'json_select':
				let k = 1;
				for(let name in this.props.rawdata){
					let val = this.props.rawdata[name].toString();
					if(val.length > 70) val = val.slice(0,70) + ' . . .';
					
					innerHTML.push(
						<label key={k++} htmlFor={'json_select_'+name}>
							<input type='checkbox' keyname={name.toString()} keyval={val} id={'json_select_'+name} />
							<span>{name}<span>{'=>'+val}</span></span>
						</label>
					);
					innerHTML.push(<br key={k++}/>);
				}
				innerHTML.push(<input key={k++} type='button' id={'json_submit_'+this.props.n} onClick={() => Liquid.tabManager.submitJSONvars('#t'+this.props.n)} />);
				innerHTML.push(<label key={k++} htmlFor={'json_submit_'+this.props.n}>Submit</label>);
				break;

			case 'text':
				innerHTML.push(<span key='1' dangerouslySetInnerHTML={{__html: this.props.rawdata}}></span>);
				break;
			// case 'table':
			default:
		}

		return (
			<div className='tab'>
				<input type='radio' id={id} name='tabs' defaultChecked={this.props.n === Liquid.tabManager.active_tab ? true : false}/>
				<label onClick={() => Liquid.tabManager.setActiveTab(this.props.n)} htmlFor={id}>{this.props.title}</label>
				<div className='throwin'>
					<div className={this.props.type} id={'t' + this.props.n}>{innerHTML}</div>
				</div>
			</div>
		);
	}
}

class TabViewComponent extends React.Component {
	constructor(props){
		super(props);
	}

	render() {
		let tabs = [];
		Liquid.tabManager.tabs.forEach(t => { tabs.push(t.getComponent()); });

		return (
			<div className='tabs'>
				{tabs}
			</div>
		);
	}
}

//////////// Menu stuff ////////////

class TaskListComponent extends React.Component {
	constructor(props) {
		super(props);
	}

	render() {
		let tasks = [];
		Liquid.menu.task_list.forEach((task,i=0) => { tasks.push(<li key={i++}>{task}</li>); });
		return (
			<div id="task_list">
				<h2>Tasks</h2>
				<ul>
					{tasks}
				</ul>
			</div>
		);
	}

}

class NavComponent extends React.Component {
	constructor(props) {
		super(props);
	}

	render() {
		return (
			<div id="menu_container">
				<h1>Liquid</h1>
				<TaskListComponent/>
				<h2>Testing Buttons</h2>
				<button onClick={() => Liquid.menu.toggleCheckboxes(Liquid.tabManager.active_tab)}>Toggle Select Column</button>
				<button onClick={() => sendTableData()}>Send Table Data</button>
				<button onClick={() => addCheckColumn()}>Add New Checkbox Column</button>
				<button onClick={() => addTextColumn()}>Add New Text Column</button>
				<button onClick={() => filterColumn()}>Filter Column</button>
				<button onClick={() => filterCustom()}>Custom Filter</button>
				<button onClick={() => clearFilters()}>Clear Filters</button>
			</div>
		);
	}
}