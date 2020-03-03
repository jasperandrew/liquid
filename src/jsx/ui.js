const UI = {
    toggleClass(sel, name) { let el = document.querySelector(sel); if(el) el.classList.toggle(name); },
    addClass(sel, name) { let el = document.querySelector(sel); if(el) el.classList.add(name); },
    removeClass(sel, name) { let el = document.querySelector(sel); if(el) el.classList.remove(name); },

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
                title: 'Test',
                menu_items: [
                    { menu_item_text: 'Exec Menu Item Test', menu_item_id: 'exec_mun_item_test' },
                    { menu_item_text: 'Download Current Tab', menu_item_id: 'download_current_tab' }
                ]
            }
        ],

        menu_funcs: {
            send_table_data: sendTableData,
            toggle_checkbox_column: toggleCheckboxColumn,
            insert_checkbox_column: insertCheckboxColumn,
            insert_text_column: insertTextColumn,
            filter_column: filterColumn,
            multi_column_filter: filterCustom,
            clear_filters: clearFilters,
            download_current_tab: downloadCurrentTab,
            exec_mun_item_test: execMenuItemTest
        },

        hover_open: false,

        control(i, hover) {
            if(hover && !this.hover_open) return;

            if(!hover){
                this.hover_open = !this.hover_open;
                UI.toggleClass('.menus', 'on');

                if(!this.hover_open){
                    this.close();
                    return;
                }
            }
            
            this.close();
            UI.addClass(`#header .menus [i="${i}"]`, 'open');
        },

        close(all) {
            if(all){
                console.log(all);
                UI.removeClass('.menus', 'on');
            }
            UI.removeClass('#header .menus .menu.open', 'open');
        },

        initMenus(menu_json) {
            menu_json[menu_json.length] = this.menus[0]; // manually add test menu item
            this.menus = menu_json;
            this.render();
        },

        runMenuFunc(id) {
            this.menu_funcs[id]();
        },

        sendMenuClick(id) {
            DATA.httpRequest({
                json_data: {
                    cmd_name: 'exec_menu_item',
                    menu_item_id: id,
                    task_name: DATA.curr_task
                }
            })
            .then(res_text => {
                DATA.handleResponse(res_text);
            });        
        },
        
        render() {
            ReactDOM.render(<HeaderComponent menus={this.menus}/>, document.querySelector('#header'));
        }
    },

    ThrowinMenu: {
        
    },

    EventHandler: {
        event_map: {
            '#throwin_file|change': DATA.Upload.file,
            '#throwin_text|change': () => {
                let input = document.querySelector('#throwin_text');
                DATA.Upload.text(input.value);
                input.value = "";
            },
        },

        init() {
            for(let event in this.event_map){
                let a = event.split('|'),
                target = a[0],
                action = a[1],
                elem = document.querySelector(target),
                command = () => { this.event_map[event]() };

                if(elem){
                    elem.removeEventListener(action, command);
                    elem.addEventListener(action, command);	
                }
            }
        }
    }
}