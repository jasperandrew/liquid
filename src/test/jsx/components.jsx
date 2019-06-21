class HeaderMenuComponent extends React.Component {
	constructor(props) {
		super(props);
	}

	render() {
		return (
            <div id='header_menu'>
                <div className='logo'></div>
                <div className='title_menu'>
                    <h1 className='title'>Current Task Name</h1>
                    <div className='menu'>
                        <div className='menu_item'>File</div>
                        <div className='menu_item'>Edit</div>
                        <div className='menu_item'>These</div>
                        <div className='menu_item'>Are</div>
                        <div className='menu_item'>Placeholders</div>
                    </div>
                </div>
                <div className='throwin_button'>
                    <input id="throwin_file" type="file" />
                    <input id="throwin_text" type="button" />

                    <label htmlFor="throwin_file"><div></div>Throw-in</label>
                    {/* <div className='throwin_opts'>
                        <label for="throwin_text">Throw-in Text</label>
                    </div> */}
                </div>
            </div>
		);
	}
}

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
			// case 'table'
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

class OptionComponent extends React.Component {
	constructor(props) {
		super(props);
	}

	render() {
		return (
			<div className={'option' + (this.props.isDefault ? ' default' : '')}>
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
			<div id='dialogue'>
				<p className='prompt'>{this.props.prompt}</p>
				{opts_jsx}
			</div>
		);
	}
}

ReactDOM.render(<HeaderMenuComponent/>, document.querySelector('#head'));