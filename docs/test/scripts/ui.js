"use strict";

var UI = {
  toggleClass: function toggleClass(el, name) {
    document.querySelector(el).classList.toggle(name);
  },
  addClass: function addClass(el, name) {
    document.querySelector(el).classList.add(name);
  },
  removeClass: function removeClass(el, name) {
    document.querySelector(el).classList.remove(name);
  },
  init: function init() {
    this.render();
    this.EventHandler.init();
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
      }), document.querySelector('nav'));
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
    render: function render() {
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
    }
  },
  HeaderMenu: {
    menus: [{
      title: 'File',
      items: []
    }, {
      title: 'Edit',
      items: []
    }, {
      title: 'Test',
      items: [{
        name: 'Add Check Column',
        func: addCheckColumn
      }, {
        name: 'Add Text Column',
        func: addCheckColumn
      }, {
        name: 'Basic Column Filter',
        func: addCheckColumn
      }, {
        name: 'Custom Column Filter',
        func: addCheckColumn
      }, {
        name: 'Clear Filters',
        func: addCheckColumn
      }]
    }],
    render: function render() {
      ReactDOM.render(React.createElement(HeaderMenuComponent, {
        menus: this.menus
      }), document.querySelector('#head'));
    }
  },
  EventHandler: {
    event_map: {
      '#throwin_file|change': DATA.Upload.file,
      '#throwin_text|click': DATA.Upload.text
    },
    init: function init() {
      var _this = this;

      var _loop = function _loop(event) {
        var a = event.split('|'),
            target = a[0],
            action = a[1],
            elem = document.querySelector(target),
            command = function command() {
          _this.event_map[event]();
        };

        console.log(elem);

        if (elem) {
          elem.removeEventListener(action, command);
          elem.addEventListener(action, command);
        }
      };

      for (var event in this.event_map) {
        _loop(event);
      }
    }
  }
};