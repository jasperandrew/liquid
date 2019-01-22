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
var Option =
/*#__PURE__*/
function (_React$Component) {
  _inherits(Option, _React$Component);

  function Option(props) {
    _classCallCheck(this, Option);

    return _possibleConstructorReturn(this, _getPrototypeOf(Option).call(this, props));
  }

  _createClass(Option, [{
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

  return Option;
}(React.Component);

var Dialogue =
/*#__PURE__*/
function (_React$Component2) {
  _inherits(Dialogue, _React$Component2);

  function Dialogue(props) {
    _classCallCheck(this, Dialogue);

    return _possibleConstructorReturn(this, _getPrototypeOf(Dialogue).call(this, props));
  }

  _createClass(Dialogue, [{
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

  return Dialogue;
}(React.Component); //////////// Throwin/tab layout stuff ////////////


var Throwin =
/*#__PURE__*/
function (_React$Component3) {
  _inherits(Throwin, _React$Component3);

  function Throwin(props) {
    _classCallCheck(this, Throwin);

    return _possibleConstructorReturn(this, _getPrototypeOf(Throwin).call(this, props));
  }

  _createClass(Throwin, [{
    key: "render",
    value: function render() {
      switch (this.props.format) {
        // case 'json_select':
        // 	return (
        // 		<div className={this.props.format} id={'t' + this.props.i}></div>
        // 	);
        // case 'text':
        // case 'table':
        default:
          return React.createElement("div", {
            className: this.props.format,
            id: 't' + this.props.i
          });
      }
    }
  }]);

  return Throwin;
}(React.Component);

var Tab =
/*#__PURE__*/
function (_React$Component4) {
  _inherits(Tab, _React$Component4);

  function Tab(props) {
    _classCallCheck(this, Tab);

    return _possibleConstructorReturn(this, _getPrototypeOf(Tab).call(this, props));
  }

  _createClass(Tab, [{
    key: "render",
    value: function render() {
      var _this2 = this;

      var id = 'tab' + this.props.i;
      return React.createElement("div", {
        className: "tab"
      }, React.createElement("input", {
        type: "radio",
        id: id,
        name: "tabs",
        defaultChecked: this.props.i === Liquid.tabManager.active_tab ? true : false
      }), React.createElement("label", {
        onClick: function onClick() {
          return Liquid.tabManager.setActiveTab(_this2.props.i);
        },
        htmlFor: id
      }, this.props.tabName), React.createElement("div", {
        className: "throwin"
      }, React.createElement(Throwin, {
        format: this.props.format,
        i: this.props.i
      })));
    }
  }]);

  return Tab;
}(React.Component);

var TabContainer =
/*#__PURE__*/
function (_React$Component5) {
  _inherits(TabContainer, _React$Component5);

  function TabContainer(props) {
    _classCallCheck(this, TabContainer);

    return _possibleConstructorReturn(this, _getPrototypeOf(TabContainer).call(this, props));
  }

  _createClass(TabContainer, [{
    key: "render",
    value: function render() {
      var tabs = [];
      Liquid.tabManager.data.forEach(function (tab) {
        tabs.push(tab.jsxElement);
      });
      return React.createElement("div", {
        className: "tabs"
      }, tabs);
    }
  }]);

  return TabContainer;
}(React.Component); //////////// Menu stuff ////////////


var TaskList =
/*#__PURE__*/
function (_React$Component6) {
  _inherits(TaskList, _React$Component6);

  function TaskList(props) {
    _classCallCheck(this, TaskList);

    return _possibleConstructorReturn(this, _getPrototypeOf(TaskList).call(this, props));
  }

  _createClass(TaskList, [{
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

  return TaskList;
}(React.Component);

var Menu =
/*#__PURE__*/
function (_React$Component7) {
  _inherits(Menu, _React$Component7);

  function Menu(props) {
    _classCallCheck(this, Menu);

    return _possibleConstructorReturn(this, _getPrototypeOf(Menu).call(this, props));
  }

  _createClass(Menu, [{
    key: "render",
    value: function render() {
      return React.createElement("div", {
        id: "menu_container"
      }, React.createElement("h1", null, "Liquid"), React.createElement(TaskList, null));
    }
  }]);

  return Menu;
}(React.Component);