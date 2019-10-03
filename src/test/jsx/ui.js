const UI = {
    toggleClass(el, name) { document.querySelector(el).classList.toggle(name); },
    addClass(el, name) { document.querySelector(el).classList.add(name); },
    removeClass(el, name) { document.querySelector(el).classList.remove(name); },

    init() {
        this.render();
        this.EventHandler.init();
    },

    render() {
        this.DialogView.render();
        this.TabView.render();
        this.HeaderMenu.render();
    },

    DialogView: {
        render() {
			ReactDOM.render(<DialogueComponent prompt={DATA.Dialog.get(0).prompt}/>, document.querySelector('#dialog'));
		}
    },

    TabView: {
        active_tab: 1, // Currently active tab

        getActive() {
            return this.active_tab;
        },

        setActive(i) {
            this.active_tab = i;
            this.render();
        },

        render(focus_tab) {
            if(focus_tab) this.active_tab = focus_tab;
			ReactDOM.render(<TabViewComponent active_tab={this.active_tab}/>, document.querySelector('#tabview'));
			DATA.Throwin.getAll().forEach(t => {
				if(t.getType() === 'table'){
					if(!t.getTableObject()){
						let data = t.getRawData();
						let obj = new Tabulator('#t' + t.getID(), {
							layout:'fitData',
							placeholder:'Loading...',
							movableColumns: true,
							rowFormatter: data.formatter
						});

						obj.setColumns(data.cols);
						obj.setData(data.rows);

						t.setTableObject(obj);

						// TODO // Make this stuff go away
						window.setTimeout(() => obj.addColumn({title:'select',field:'selection',visible:false, formatter:triTickFormatter, cellClick:triTickCellClick },true), 10);
					}

				}
			});
        },
        
        // TODO // Move this to JSONSelectThrowin class
        submitJSONvars(tab_selector) {
			let selected = {};
			document.querySelectorAll('.throwin ' + tab_selector + ' input:checked').forEach(input => {
				selected[input.attributes['keyname'].value] = input.attributes['keyval'].value;
			});

			let json_data = {
				task_name: DATA.curr_task,
				cmd_name: 'user_input',
				input_type: 'json_vars_selection',
				json_vars_selection: selected,
				qst_opaque_data: DATA.Dialog.get(0).data
			}

			DATA.httpRequest({
				json_data: json_data
			})
			.then(response => { DATA.handleResponse(response) });
		}


    },

    HeaderMenu: {
        menus: [
            {
                title: 'File',
                items: []
            },
            {
                title: 'Edit',
                items: []
            },
            {
                title: 'Test',
                items: [
                    { name: 'Add Check Column', func: addCheckColumn },
                    { name: 'Add Text Column', func: addCheckColumn },
                    { name: 'Basic Column Filter', func: addCheckColumn },
                    { name: 'Custom Column Filter', func: addCheckColumn },
                    { name: 'Clear Filters', func: addCheckColumn },
                ]
            }
        ],

        toggle() {
            UI.toggleClass('#header .menus', 'open');
        },

        render() {
            ReactDOM.render(<HeaderMenuComponent menus={this.menus}/>, document.querySelector('#header'));
        }
    },

    EventHandler: {
        event_map: {
            '#throwin_file|change': DATA.Upload.file,
            '#throwin_text|click': DATA.Upload.text,
        },

        init() {
            for(let event in this.event_map){
                let a = event.split('|'),
                target = a[0],
                action = a[1],
                elem = document.querySelector(target),
                command = () => { this.event_map[event]() };
                console.log(elem);

                if(elem){
                    elem.removeEventListener(action, command);
                    elem.addEventListener(action, command);	
                }
            }
        }
    }
}