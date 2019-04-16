"use strict";

function _typeof(obj) { if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

function _possibleConstructorReturn(self, call) { if (call && (_typeof(call) === "object" || typeof call === "function")) { return call; } return _assertThisInitialized(self); }

function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }

function _getPrototypeOf(o) { _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf : function _getPrototypeOf(o) { return o.__proto__ || Object.getPrototypeOf(o); }; return _getPrototypeOf(o); }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function"); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, writable: true, configurable: true } }); if (superClass) _setPrototypeOf(subClass, superClass); }

function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }

/************************************************************\
*                         JSX CLASSES                        *
\************************************************************/
//////////// Dialogue question/answer stuff ////////////
var OptionComponent =
/*#__PURE__*/
function (_React$Component) {
  _inherits(OptionComponent, _React$Component);

  function OptionComponent(props) {
    _classCallCheck(this, OptionComponent);

    return _possibleConstructorReturn(this, _getPrototypeOf(OptionComponent).call(this, props));
  }

  _createClass(OptionComponent, [{
    key: "render",
    value: function render() {
      var _this = this;

      return React.createElement("div", {
        className: "option"
      }, React.createElement("input", {
        type: "radio",
        id: 'opt' + this.props.i,
        name: "options",
        value: this.props.optId
      }), React.createElement("label", {
        htmlFor: 'opt' + this.props.i,
        onClick: function onClick() {
          return Liquid.dialogueManager.handleAnswer(_this.props.optId);
        }
      }, this.props.optText));
    }
  }]);

  return OptionComponent;
}(React.Component);

var DialogueComponent =
/*#__PURE__*/
function (_React$Component2) {
  _inherits(DialogueComponent, _React$Component2);

  function DialogueComponent(props) {
    _classCallCheck(this, DialogueComponent);

    return _possibleConstructorReturn(this, _getPrototypeOf(DialogueComponent).call(this, props));
  }

  _createClass(DialogueComponent, [{
    key: "render",
    value: function render() {
      var opts = Liquid.dialogueManager.history[0].options,
          opts_jsx = [];
      if (opts !== null) opts.forEach(function (opt) {
        opts_jsx.push(opt.jsxElement);
      });
      return React.createElement("div", {
        className: "dialogue"
      }, React.createElement("p", {
        className: "prompt"
      }, this.props.prompt), opts_jsx);
    }
  }]);

  return DialogueComponent;
}(React.Component); //////////// Tab layout stuff ////////////


var TabComponent =
/*#__PURE__*/
function (_React$Component3) {
  _inherits(TabComponent, _React$Component3);

  function TabComponent(props) {
    _classCallCheck(this, TabComponent);

    return _possibleConstructorReturn(this, _getPrototypeOf(TabComponent).call(this, props));
  }

  _createClass(TabComponent, [{
    key: "render",
    value: function render() {
      var _this2 = this;

      var id = 'tab' + this.props.n;
      var innerHTML = [];

      switch (this.props.format) {
        case 'json_select':
          var k = 1;

          for (var name in this.props.data) {
            var val = this.props.data[name].toString();
            if (val.length > 70) val = val.slice(0, 70) + ' . . .';
            innerHTML.push(React.createElement("label", {
              key: k++,
              htmlFor: 'json_select_' + name
            }, React.createElement("input", {
              type: "checkbox",
              keyname: name.toString(),
              keyval: val,
              id: 'json_select_' + name
            }), React.createElement("span", null, name, React.createElement("span", null, '=>' + val))));
            innerHTML.push(React.createElement("br", {
              key: k++
            }));
          }

          innerHTML.push(React.createElement("input", {
            key: k++,
            type: "button",
            id: 'json_submit_' + this.props.n,
            onClick: function onClick() {
              return Liquid.tabManager.submitJSONvars('#t' + _this2.props.n);
            }
          }));
          innerHTML.push(React.createElement("label", {
            key: k++,
            htmlFor: 'json_submit_' + this.props.n
          }, "Submit"));
          break;

        case 'text':
          innerHTML.push(React.createElement("span", {
            key: "1",
            dangerouslySetInnerHTML: {
              __html: this.props.data
            }
          }));
          break;
        // case 'table':

        default:
      }

      return React.createElement("div", {
        className: "tab"
      }, React.createElement("input", {
        type: "radio",
        id: id,
        name: "tabs",
        defaultChecked: this.props.n === Liquid.tabManager.active_tab ? true : false
      }), React.createElement("label", {
        onClick: function onClick() {
          return Liquid.tabManager.setActiveTab(_this2.props.n);
        },
        htmlFor: id
      }, this.props.title), React.createElement("div", {
        className: "throwin"
      }, React.createElement("div", {
        className: this.props.format,
        id: 't' + this.props.n
      }, innerHTML)));
    }
  }]);

  return TabComponent;
}(React.Component);

var TabViewComponent =
/*#__PURE__*/
function (_React$Component4) {
  _inherits(TabViewComponent, _React$Component4);

  function TabViewComponent(props) {
    _classCallCheck(this, TabViewComponent);

    return _possibleConstructorReturn(this, _getPrototypeOf(TabViewComponent).call(this, props));
  }

  _createClass(TabViewComponent, [{
    key: "render",
    value: function render() {
      var tabs = [];
      Liquid.tabManager.tabs.forEach(function (tab) {
        tabs.push(tab.jsxElement);
      });
      return React.createElement("div", {
        className: "tabs"
      }, tabs);
    }
  }]);

  return TabViewComponent;
}(React.Component); //////////// Menu stuff ////////////


var TaskListComponent =
/*#__PURE__*/
function (_React$Component5) {
  _inherits(TaskListComponent, _React$Component5);

  function TaskListComponent(props) {
    _classCallCheck(this, TaskListComponent);

    return _possibleConstructorReturn(this, _getPrototypeOf(TaskListComponent).call(this, props));
  }

  _createClass(TaskListComponent, [{
    key: "render",
    value: function render() {
      var tasks = [];
      Liquid.menu.task_list.forEach(function (task) {
        var i = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 0;
        tasks.push(React.createElement("li", {
          key: i++
        }, task));
      });
      return React.createElement("div", {
        id: "task_list"
      }, React.createElement("h2", null, "Tasks"), React.createElement("ul", null, tasks));
    }
  }]);

  return TaskListComponent;
}(React.Component);

var NavComponent =
/*#__PURE__*/
function (_React$Component6) {
  _inherits(NavComponent, _React$Component6);

  function NavComponent(props) {
    _classCallCheck(this, NavComponent);

    return _possibleConstructorReturn(this, _getPrototypeOf(NavComponent).call(this, props));
  }

  _createClass(NavComponent, [{
    key: "render",
    value: function render() {
      return React.createElement("div", {
        id: "menu_container"
      }, React.createElement("h1", null, "Liquid"), React.createElement(TaskListComponent, null), React.createElement("h2", null, "Testing Buttons"), React.createElement("button", {
        onClick: function onClick() {
          return Liquid.menu.toggleCheckboxes(Liquid.tabManager.active_tab);
        }
      }, "Toggle Select Column"), React.createElement("button", {
        onClick: function onClick() {
          return sendTableData();
        }
      }, "Send Table Data"), React.createElement("button", {
        onClick: function onClick() {
          return addCheckColumn();
        }
      }, "Add New Checkbox Column"));
    }
  }]);

  return NavComponent;
}(React.Component);