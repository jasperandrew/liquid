class HeaderMenuComponent extends React.Component {
	constructor(props) {
		super(props);
	}

	render() {
		return (
            <div id='header_menu'>
                <div className='logo'></div>
                <div className='title_menu'>
                    <div className='title'>Liquid Data</div>
                    <div className='menus'>
                        <div className='menu' /*menu-title='File'*/ >File
							{/* <p>Test 1</p>
							<p>Test 2</p>
							<p>Test 3</p> */}
						</div>
                        <div className='menu'>Edit</div>
                        <div className='menu'>Insert</div>
                        <div className='menu'>Data</div>
                        <div className='menu'>Help</div>
                    </div>
                </div>
                <div className='throwin_button'>
                    <input id="throwin_file" type="file" />
                    {/* <input id="throwin_text" type="button" /> */}

                    <label htmlFor="throwin_file"><div></div>Throw-in</label>
                    {/* <div className='throwin_opts'>
                        <label for="throwin_text">Throw-in Text</label>
                    </div> */}
                </div>
            </div>
		);
	}
}

class ThrowinComponent extends React.Component {
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
				innerHTML.push(<input key={k++} type='button' id={'json_submit_'+this.props.n} onClick={() => UI.TabView.submitJSONvars('#t'+this.props.n)} />);
				innerHTML.push(<label key={k++} htmlFor={'json_submit_'+this.props.n}>Submit</label>);
				break;

			case 'text':
				innerHTML.push(<span key='1' dangerouslySetInnerHTML={{__html: this.props.rawdata}}></span>);
				break;
			case 'webpage':
				innerHTML.push(<iframe key='1' src={this.props.rawdata}></iframe>)
			default:
		}

		return <div className={this.props.type} id={'t' + this.props.n}>{innerHTML}</div>;
	}
}

class TabButtonComponent extends React.Component {
	constructor(props) {
		super(props);
	}

	render() {
		let active = this.props.is_active ? ' active' : '';
		return <div className={`tab_button${active}`} onClick={() => UI.TabView.setActive(this.props.n)}>{this.props.title}</div>;
	}
}

class TabViewComponent extends React.Component {
	constructor(props) {
		super(props);
	}

	render() {
		let throwin_set = [], button_set = [];
		DATA.Throwin.getAll().forEach((t,i) => {
			let is_active = this.props.active_tab === i+1;
			let active = is_active ? ' active' : '';
			throwin_set.push(<div key={i} className={`throwin${active}`}>{t.getThrowinComponent()}</div>);
			button_set.push(<TabButtonComponent key={i} n={t.id} title={t.title} is_active={is_active}/>);
		});

		return (
			<div id='tabs'>
				<div id='throwin_set'>
					{throwin_set}
				</div>
				<div id='button_set'>
					{button_set}
				</div>
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
				<label htmlFor={'opt' + this.props.i} onClick={() => DATA.Dialog.handleAnswer(this.props.optId)}>{this.props.optText}</label>
			</div>
		);
	}
}

class DialogueComponent extends React.Component {
	constructor(props) {
		super(props);
	}

	render() {
		let opts = DATA.Dialog.get(0).options,
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