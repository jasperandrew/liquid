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

//////////// Throwin/tab layout stuff ////////////
class Throwin extends React.Component {
	constructor(props) {
		super(props);
	}

	render() {
		return (
			<div className={this.props.format} id={'t' + this.props.i}></div>
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
				<input type='radio' id={id} name='tabs' defaultChecked={this.props.i === Liquid.tabManager.active_tab ? true : false}/>
				<label onClick={() => Liquid.tabManager.setActiveTab(this.props.i)} htmlFor={id}>{this.props.tabName}</label>
				<div className='throwin'>
					<Throwin format={this.props.format} i={this.props.i}/>
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
