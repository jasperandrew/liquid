"use strict";

var UI = {
  toggleClass: function toggleClass(sel, name) {
    var el = document.querySelector(sel);
    if (el) el.classList.toggle(name);
  },
  addClass: function addClass(sel, name) {
    var el = document.querySelector(sel);
    if (el) el.classList.add(name);
  },
  removeClass: function removeClass(sel, name) {
    var el = document.querySelector(sel);
    if (el) el.classList.remove(name);
  },
  init: function init() {
    this.render();
  },
  render: function render() {
    this.DialogView.render();
    this.TabView.render();
    this.HeaderMenu.render();
  },
  DialogView: {
    render: function render() {
      ReactDOM.render(React.createElement(DialogueComponent, {
        prompt: DATA.Dialog.get(0).prompt
      }), document.querySelector('#dialog'));
    }
  },
  TabView: {
    active_tab: 1,
    // Currently active tab
    getActive: function getActive() {
      return this.active_tab;
    },
    setActive: function setActive(i) {
      this.active_tab = i;
      this.render();
    },
    render: function render(focus_tab) {
      if (focus_tab) this.active_tab = focus_tab;
      ReactDOM.render(React.createElement(TabViewComponent, {
        active_tab: this.active_tab
      }), document.querySelector('#tabview'));
      DATA.Throwin.getAll().forEach(function (t) {
        if (t.getType() === 'table') {
          if (!t.getTableObject()) {
            var data = t.getRawData();
            var obj = new Tabulator('#t' + t.getID(), {
              layout: 'fitData',
              placeholder: 'Loading...',
              movableColumns: true,
              rowFormatter: data.formatter
            });
            obj.setColumns(data.cols);
            obj.setData(data.rows);
            t.setTableObject(obj); // TODO // Make this stuff go away

            window.setTimeout(function () {
              return obj.addColumn({
                title: 'select',
                field: 'selection',
                visible: false,
                formatter: triTickFormatter,
                cellClick: triTickCellClick
              }, true);
            }, 10);
          }
        }
      });
    },
    // TODO // Move this to JSONSelectThrowin class
    submitJSONvars: function submitJSONvars(tab_selector) {
      var selected = {};
      document.querySelectorAll('.throwin ' + tab_selector + ' input:checked').forEach(function (input) {
        selected[input.attributes['keyname'].value] = input.attributes['keyval'].value;
      });
      var json_data = {
        task_name: DATA.curr_task,
        cmd_name: 'user_input',
        input_type: 'json_vars_selection',
        json_vars_selection: selected,
        qst_opaque_data: DATA.Dialog.get(0).data
      };
      DATA.httpRequest({
        json_data: json_data
      }).then(function (response) {
        DATA.handleResponse(response);
      });
    }
  },
  HeaderMenu: {
    menus: [{
      title: 'Test',
      menu_items: [{
        menu_item_text: 'Exec Menu Item Test',
        menu_item_id: 'exec_mun_item_test'
      }, {
        menu_item_text: 'Download Current Tab',
        menu_item_id: 'download_current_tab'
      }]
    }],
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
    toggle: function toggle(i) {
      if (!this.hover_open) {
        this.hover_open = true;
        UI.addClass('.menus', 'on');
        UI.addClass("#header .menus [i=\"".concat(i, "\"]"), 'open');
      } else {
        this.close();
      }
    },
    clickAway: function clickAway(e) {
      if (!e.target.closest('.menus')) this.close();
    },
    close: function close() {
      UI.removeClass('#header .menus .menu.open', 'open');
      UI.removeClass('.menus', 'on');
      this.hover_open = false;
    },
    hover: function hover(i) {
      if (!this.hover_open) return;
      UI.removeClass('#header .menus .menu.open', 'open');
      UI.addClass("#header .menus [i=\"".concat(i, "\"]"), 'open');
    },
    initMenus: function initMenus(menu_json) {
      menu_json[menu_json.length] = this.menus[0]; // manually add test menu item

      this.menus = menu_json;
      this.render();
    },
    runMenuFunc: function runMenuFunc(id) {
      this.menu_funcs[id]();
    },
    sendMenuClick: function sendMenuClick(id) {
      this.close(true);
      DATA.httpRequest({
        json_data: {
          cmd_name: 'exec_menu_item',
          menu_item_id: id,
          task_name: DATA.curr_task
        }
      }).then(function (res_text) {
        DATA.handleResponse(res_text);
      });
    },
    render: function render() {
      ReactDOM.render(React.createElement(HeaderComponent, {
        menus: this.menus
      }), document.querySelector('#header'));
    }
  },
  ThrowinMenu: {}
};