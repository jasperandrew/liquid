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

var HeaderMenuComponent =
/*#__PURE__*/
function (_React$Component) {
  _inherits(HeaderMenuComponent, _React$Component);

  function HeaderMenuComponent(props) {
    _classCallCheck(this, HeaderMenuComponent);

    return _possibleConstructorReturn(this, _getPrototypeOf(HeaderMenuComponent).call(this, props));
  }

  _createClass(HeaderMenuComponent, [{
    key: "render",
    value: function render() {
      // TODO // Make item and menu into components
      var menuHTML = [];
      var menus = this.props.menus;

      var _loop = function _loop(i) {
        var itemHTML = [];
        var items = menus[i].items;

        var _loop2 = function _loop2(j) {
          var item = items[j];
          itemHTML.push(React.createElement("a", {
            key: j,
            onClick: function onClick() {
              UI.HeaderMenu.close(true);
              item.func();
            }
          }, item.name));
        };

        for (var j in items) {
          _loop2(j);
        }

        menuHTML.push(React.createElement("div", {
          key: i,
          i: i,
          className: "menu"
        }, React.createElement("span", {
          onMouseOver: function onMouseOver() {
            return UI.HeaderMenu.control(i, true);
          },
          onClick: function onClick() {
            return UI.HeaderMenu.control(i);
          }
        }, menus[i].title), React.createElement("div", {
          className: "items"
        }, itemHTML)));
      };

      for (var i in menus) {
        _loop(i);
      }

      return React.createElement("div", {
        id: "header_menu"
      }, React.createElement("div", {
        className: "logo"
      }), React.createElement("div", {
        className: "title_menu"
      }, React.createElement("div", {
        className: "menus"
      }, menuHTML)), React.createElement("div", {
        className: "throwin_input"
      }, React.createElement("input", {
        id: "throwin_file",
        type: "file"
      }), React.createElement("label", {
        htmlFor: "throwin_file"
      }, React.createElement("div", null), "Throw-in"), React.createElement("input", {
        id: "throwin_text",
        type: "text"
      })));
    }
  }]);

  return HeaderMenuComponent;
}(React.Component);

var ThrowinComponent =
/*#__PURE__*/
function (_React$Component2) {
  _inherits(ThrowinComponent, _React$Component2);

  function ThrowinComponent(props) {
    _classCallCheck(this, ThrowinComponent);

    return _possibleConstructorReturn(this, _getPrototypeOf(ThrowinComponent).call(this, props));
  }

  _createClass(ThrowinComponent, [{
    key: "render",
    value: function render() {
      var _this = this;

      var innerHTML = [];

      switch (this.props.type) {
        case 'json_select':
          var k = 1;

          for (var name in this.props.rawdata) {
            var val = this.props.rawdata[name].toString();
            if (val.length > 70) val = val.slice(0, 70) + ' . . .';
            var id = "json_select_t".concat(this.props.n, "_").concat(name);
            innerHTML.push(React.createElement("label", {
              key: k++,
              htmlFor: id
            }, React.createElement("input", {
              type: "checkbox",
              keyname: name.toString(),
              keyval: val,
              id: id
            }), React.createElement("span", null, name, React.createElement("span", null, '→' + val))));
            innerHTML.push(React.createElement("br", {
              key: k++
            }));
          }

          innerHTML.push(React.createElement("input", {
            key: k++,
            type: "button",
            id: 'json_submit_' + this.props.n,
            onClick: function onClick() {
              return UI.TabView.submitJSONvars('#t' + _this.props.n);
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
              __html: this.props.rawdata
            }
          }));
          break;

        case 'webpage':
          innerHTML.push(React.createElement("iframe", {
            key: "1",
            src: this.props.rawdata
          }));

        default:
      }

      return React.createElement("div", {
        className: this.props.type,
        id: 't' + this.props.n
      }, innerHTML);
    }
  }]);

  return ThrowinComponent;
}(React.Component);

var TabButtonComponent =
/*#__PURE__*/
function (_React$Component3) {
  _inherits(TabButtonComponent, _React$Component3);

  function TabButtonComponent(props) {
    _classCallCheck(this, TabButtonComponent);

    return _possibleConstructorReturn(this, _getPrototypeOf(TabButtonComponent).call(this, props));
  }

  _createClass(TabButtonComponent, [{
    key: "render",
    value: function render() {
      var _this2 = this;

      var active = this.props.is_active ? ' active' : '';
      return React.createElement("div", {
        className: "tab_button".concat(active),
        onClick: function onClick() {
          return UI.TabView.setActive(_this2.props.n);
        }
      }, this.props.title);
    }
  }]);

  return TabButtonComponent;
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
      var _this3 = this;

      var throwin_set = [],
          button_set = [];
      DATA.Throwin.getAll().forEach(function (t, i) {
        var is_active = _this3.props.active_tab === i + 1;
        var active = is_active ? ' active' : '';
        throwin_set.push(React.createElement("div", {
          key: i,
          className: "throwin".concat(active)
        }, t.getThrowinComponent()));
        button_set.push(React.createElement(TabButtonComponent, {
          key: i,
          n: t.id,
          title: t.title,
          is_active: is_active
        }));
      });
      return React.createElement("div", {
        id: "tabs"
      }, React.createElement("div", {
        id: "throwin_set"
      }, throwin_set), React.createElement("div", {
        id: "button_set"
      }, button_set));
    }
  }]);

  return TabViewComponent;
}(React.Component);

var ReplyButtonComponent =
/*#__PURE__*/
function (_React$Component5) {
  _inherits(ReplyButtonComponent, _React$Component5);

  function ReplyButtonComponent(props) {
    _classCallCheck(this, ReplyButtonComponent);

    return _possibleConstructorReturn(this, _getPrototypeOf(ReplyButtonComponent).call(this, props));
  }

  _createClass(ReplyButtonComponent, [{
    key: "render",
    value: function render() {
      var _this4 = this;

      return React.createElement("div", {
        className: 'option' + (this.props.isDefault ? ' default' : '')
      }, React.createElement("input", {
        type: "radio",
        id: 'opt' + this.props.i,
        name: "options",
        value: this.props.optId
      }), React.createElement("label", {
        htmlFor: 'opt' + this.props.i,
        onClick: function onClick() {
          return DATA.Dialog.handleAnswer(_this4.props.optId, 'button');
        }
      }, this.props.optText));
    }
  }]);

  return ReplyButtonComponent;
}(React.Component);

var ReplyTextComponent =
/*#__PURE__*/
function (_React$Component6) {
  _inherits(ReplyTextComponent, _React$Component6);

  function ReplyTextComponent(props) {
    _classCallCheck(this, ReplyTextComponent);

    return _possibleConstructorReturn(this, _getPrototypeOf(ReplyTextComponent).call(this, props));
  }

  _createClass(ReplyTextComponent, [{
    key: "render",
    value: function render() {
      var _this5 = this;

      var keydown_handler = function keydown_handler(e) {
        if (e.key === 'Enter') DATA.Dialog.handleAnswer(_this5.props.optId, 'text');
      };

      return React.createElement("div", {
        className: 'option' + (this.props.isDefault ? ' default' : '')
      }, React.createElement("input", {
        type: "text",
        id: 'opt' + this.props.i,
        placeholder: this.props.optText,
        onKeyDown: keydown_handler
      }));
    }
  }]);

  return ReplyTextComponent;
}(React.Component);

var DialogueComponent =
/*#__PURE__*/
function (_React$Component7) {
  _inherits(DialogueComponent, _React$Component7);

  function DialogueComponent(props) {
    _classCallCheck(this, DialogueComponent);

    return _possibleConstructorReturn(this, _getPrototypeOf(DialogueComponent).call(this, props));
  }

  _createClass(DialogueComponent, [{
    key: "render",
    value: function render() {
      var reply_opts = DATA.Dialog.get(0).reply_opts,
          reply_opts_jsx = [];
      if (reply_opts !== null) reply_opts.forEach(function (opt) {
        reply_opts_jsx.push(opt.jsxElement);
      });
      return React.createElement("div", {
        id: "dialogue"
      }, React.createElement("p", {
        className: "prompt"
      }, this.props.prompt), reply_opts_jsx);
    }
  }]);

  return DialogueComponent;
}(React.Component);