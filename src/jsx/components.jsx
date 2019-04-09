/************************************************************\
*                         JSX CLASSES                        *
\************************************************************/
//////////// Dialogue question/answer stuff ////////////
class Option extends React.Component {
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

class Dialogue extends React.Component {
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

//////////// Throwin/tab layout stuff ////////////
class Throwin extends React.Component {
	constructor(props) {
		super(props);
	}

	render() {
		let innerHTML = [];
		switch(this.props.format){
			case 'json_select':
				let k = 1;
				for(let name in this.props.content){
					let val = this.props.content[name].toString();
					if(val.length > 70) val = val.slice(0,70) + ' . . .';
					
					innerHTML.push(
						<label key={k++} htmlFor={'json_select_'+name}>
							<input type='checkbox' keyname={name.toString()} keyval={val} id={'json_select_'+name} />
							<span>{name}<span>{'=>'+val}</span></span>
						</label>
					);
					innerHTML.push(<br key={k++}/>);
				}
				innerHTML.push(<input key={k++} type='button' id={'json_submit_'+this.props.i} onClick={() => Liquid.tabManager.submitJSONvars('#t'+this.props.i)} />);
				innerHTML.push(<label key={k++} htmlFor={'json_submit_'+this.props.i}>Submit</label>);
				break;

			case 'text':
				innerHTML.push(<span key='1' dangerouslySetInnerHTML={{__html: this.props.content}}></span>);
				break;
			// case 'table':
			default:
		}

		return <div className={this.props.format} id={'t' + this.props.i}>{innerHTML}</div>;
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
				<input type='radio' id={id} name='tabs' defaultChecked={this.props.i === Liquid.tabManager.active_tab ? true : false}/>
				<label onClick={() => Liquid.tabManager.setActiveTab(this.props.i)} htmlFor={id}>{this.props.tabName}</label>
				<div className='throwin'>
					<Throwin format={this.props.format} i={this.props.i} content={this.props.content}/>
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

//////////// Menu stuff ////////////
class TaskList extends React.Component {
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

class Menu extends React.Component {
	constructor(props) {
		super(props);
	}

	render() {
		return (
			<div id="menu_container">
				<h1>Liquid</h1>
				<TaskList/>
				<h2>Testing Buttons</h2>
				<button onClick={() => Liquid.menu.toggleCheckboxes(Liquid.tabManager.active_tab)}>Toggle Checkboxes</button>
				<button onClick={() => sendTableData()}>Send Table Data</button>
			</div>
		);
	}
}