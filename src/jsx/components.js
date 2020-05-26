class TopMenuItemComponent extends React.Component {
    constructor(props) {
        super(props);
    }

    render() {
        return (
            <a onClick={() => {UI.HeaderMenu.close(true); UI.HeaderMenu.sendMenuClick(this.props.id);}}>{this.props.name}</a>
        );
    }
}

class TopMenuBarComponent extends React.Component {
    constructor(props) {
        super(props);
    }

    render() {
        let menuHTML = [];
        let menus = this.props.menus;
        for(let i in menus){
            let itemHTML = [];
            let items = menus[i].menu_items;
            for(let j in items){
                let item = items[j];
                itemHTML.push(<TopMenuItemComponent key={j} id={item.menu_item_id} name={item.menu_item_text} />);
            }
            menuHTML.push(
                <div key={i} i={i} className='menu'>
                    <span onMouseOver={() => UI.HeaderMenu.control(i, true) } onClick={() => UI.HeaderMenu.control(i) }>{menus[i].title}</span>
                    <div className='items'>{itemHTML}</div>
                </div>
            );
        }

        return (
            <div className='menus'>
                {menuHTML}
            </div>
        );
    }
}

class HeaderComponent extends React.Component {
    constructor(props) {
        super(props);
    }

    render() {  // TODO // Make item and menu into components
        return (
            <div id='header_menu'>
                <div className='logo'></div>
                <div className='title_menu'>
                    {/* <div className='title'>Liquid Data</div> */}
                    <TopMenuBarComponent menus={this.props.menus} />
                </div>
                <div className='throwin_input'>
                    <input id="throwin_file" type="file" />
                    <label htmlFor="throwin_file"><div></div>Throw-in</label>
                    <input id="throwin_text" type="text"></input>
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
        let innerHTML = [];
        
        switch(this.props.type){
            case 'json_select':
                let k = 1;
                for(let name in this.props.rawdata){
                    let val = this.props.rawdata[name].toString();
                    if(val.length > 70) val = val.slice(0,70) + ' . . .';

                    let id = `json_select_t${this.props.n}_${name}`;
                    
                    innerHTML.push(
                        <label key={k++} htmlFor={id}>
                            <input type='checkbox' keyname={name.toString()} keyval={val} id={id} />
                            <span>{name}<span>{'→'+val}</span></span>
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

class ReplyButtonComponent extends React.Component {
    constructor(props) {
        super(props);
    }

    render() {
        return (
            <div className={'option' + (this.props.isDefault ? ' default' : '')}>
                <input type='radio' id={'opt' + this.props.i} name='options' value={this.props.optId}/>
                <label htmlFor={'opt' + this.props.i} onClick={() => DATA.Dialog.handleAnswer(this.props.optId, 'button')}>{this.props.optText}</label>
            </div>
        );
    }
}

class ReplyTextComponent extends React.Component {
    constructor(props) {
        super(props);
    }

    render() {
        let keydown_handler = (e) => {
            if(e.key === 'Enter') DATA.Dialog.handleAnswer(this.props.optId, 'text');
        }

        return (
            <div className={'option' + (this.props.isDefault ? ' default' : '')}>
                <input type='text' id={'opt' + this.props.i} placeholder={this.props.optText} onKeyDown={keydown_handler}/>
            </div>
        );
    }
}

class DialogueComponent extends React.Component {
    constructor(props) {
        super(props);
    }

    render() {
        let reply_opts = DATA.Dialog.get(0).reply_opts,
            reply_opts_jsx = [];

        if(reply_opts !== null)
            reply_opts.forEach(opt => { reply_opts_jsx.push(opt.jsxElement); });

        return (
            <div id='dialogue'>
                <p className='prompt'>{this.props.prompt}</p>
                {reply_opts_jsx}
            </div>
        );
    }
}