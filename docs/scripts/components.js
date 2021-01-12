"use strict";

function _typeof(obj) { "@babel/helpers - typeof"; if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function"); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, writable: true, configurable: true } }); if (superClass) _setPrototypeOf(subClass, superClass); }

function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }

function _createSuper(Derived) { var hasNativeReflectConstruct = _isNativeReflectConstruct(); return function _createSuperInternal() { var Super = _getPrototypeOf(Derived), result; if (hasNativeReflectConstruct) { var NewTarget = _getPrototypeOf(this).constructor; result = Reflect.construct(Super, arguments, NewTarget); } else { result = Super.apply(this, arguments); } return _possibleConstructorReturn(this, result); }; }

function _possibleConstructorReturn(self, call) { if (call && (_typeof(call) === "object" || typeof call === "function")) { return call; } return _assertThisInitialized(self); }

function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }

function _isNativeReflectConstruct() { if (typeof Reflect === "undefined" || !Reflect.construct) return false; if (Reflect.construct.sham) return false; if (typeof Proxy === "function") return true; try { Date.prototype.toString.call(Reflect.construct(Date, [], function () {})); return true; } catch (e) { return false; } }

function _getPrototypeOf(o) { _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf : function _getPrototypeOf(o) { return o.__proto__ || Object.getPrototypeOf(o); }; return _getPrototypeOf(o); }

var TopMenuItemComponent = /*#__PURE__*/function (_React$Component) {
  _inherits(TopMenuItemComponent, _React$Component);

  var _super = _createSuper(TopMenuItemComponent);

  function TopMenuItemComponent(props) {
    _classCallCheck(this, TopMenuItemComponent);

    return _super.call(this, props);
  }

  _createClass(TopMenuItemComponent, [{
    key: "render",
    value: function render() {
      var _this = this;

      return /*#__PURE__*/React.createElement("a", {
        onClick: function onClick() {
          return UI.HeaderMenu.sendMenuClick(_this.props.id);
        }
      }, this.props.name);
    }
  }]);

  return TopMenuItemComponent;
}(React.Component);

var TopMenuBarComponent = /*#__PURE__*/function (_React$Component2) {
  _inherits(TopMenuBarComponent, _React$Component2);

  var _super2 = _createSuper(TopMenuBarComponent);

  function TopMenuBarComponent(props) {
    _classCallCheck(this, TopMenuBarComponent);

    return _super2.call(this, props);
  }

  _createClass(TopMenuBarComponent, [{
    key: "render",
    value: function render() {
      var menuHTML = [];
      var menus = this.props.menus;

      var _loop = function _loop(i) {
        var itemHTML = [];
        var items = menus[i].menu_items;

        for (var j in items) {
          var item = items[j];
          itemHTML.push( /*#__PURE__*/React.createElement(TopMenuItemComponent, {
            key: j,
            id: item.menu_item_id,
            name: item.menu_item_text
          }));
        }

        menuHTML.push( /*#__PURE__*/React.createElement("div", {
          key: i,
          i: i,
          className: "menu"
        }, /*#__PURE__*/React.createElement("span", {
          onMouseOver: function onMouseOver() {
            return UI.HeaderMenu.hover(i);
          },
          onClick: function onClick() {
            return UI.HeaderMenu.toggle(i);
          }
        }, menus[i].title), /*#__PURE__*/React.createElement("div", {
          className: "items"
        }, itemHTML)));
      };

      for (var i in menus) {
        _loop(i);
      }

      return /*#__PURE__*/React.createElement("div", {
        className: "menus"
      }, menuHTML);
    }
  }]);

  return TopMenuBarComponent;
}(React.Component);

var HeaderComponent = /*#__PURE__*/function (_React$Component3) {
  _inherits(HeaderComponent, _React$Component3);

  var _super3 = _createSuper(HeaderComponent);

  function HeaderComponent(props) {
    _classCallCheck(this, HeaderComponent);

    return _super3.call(this, props);
  }

  _createClass(HeaderComponent, [{
    key: "handleTextInput",
    value: function handleTextInput(e) {
      if (e.key === 'Enter') DATA.Upload.text();
    }
  }, {
    key: "render",
    value: function render() {
      var _this2 = this;

      return /*#__PURE__*/React.createElement("div", {
        id: "header_menu"
      }, /*#__PURE__*/React.createElement("div", {
        className: "logo"
      }), /*#__PURE__*/React.createElement("div", {
        className: "title_menu"
      }, /*#__PURE__*/React.createElement(TopMenuBarComponent, {
        menus: this.props.menus
      })), /*#__PURE__*/React.createElement("div", {
        className: "throwin_input"
      }, /*#__PURE__*/React.createElement("input", {
        id: "throwin_file",
        type: "file",
        onChange: function onChange() {
          return DATA.Upload.file();
        }
      }), /*#__PURE__*/React.createElement("label", {
        htmlFor: "throwin_file"
      }, /*#__PURE__*/React.createElement("div", null), "Throw-in"), /*#__PURE__*/React.createElement("input", {
        id: "throwin_text",
        type: "text",
        onKeyDown: function onKeyDown(e) {
          return _this2.handleTextInput(e);
        }
      })));
    }
  }]);

  return HeaderComponent;
}(React.Component);

var ThrowinComponent = /*#__PURE__*/function (_React$Component4) {
  _inherits(ThrowinComponent, _React$Component4);

  var _super4 = _createSuper(ThrowinComponent);

  function ThrowinComponent(props) {
    _classCallCheck(this, ThrowinComponent);

    return _super4.call(this, props);
  }

  _createClass(ThrowinComponent, [{
    key: "render",
    value: function render() {
      var _this3 = this;

      var innerHTML = [];

      switch (this.props.type) {
        case 'json_select':
          var k = 1;

          for (var name in this.props.rawdata) {
            var val = this.props.rawdata[name];
            val = val === null ? "null" : val.toString();
            if (val.length > 70) val = val.slice(0, 70) + ' . . .';
            var id = "json_select_t".concat(this.props.n, "_").concat(name);
            innerHTML.push( /*#__PURE__*/React.createElement("label", {
              key: k++,
              htmlFor: id
            }, /*#__PURE__*/React.createElement("input", {
              type: "checkbox",
              keyname: name.toString(),
              keyval: val,
              id: id
            }), /*#__PURE__*/React.createElement("span", null, name, /*#__PURE__*/React.createElement("span", null, '→' + val))));
            innerHTML.push( /*#__PURE__*/React.createElement("br", {
              key: k++
            }));
          }

          innerHTML.push( /*#__PURE__*/React.createElement("input", {
            key: k++,
            type: "button",
            id: 'json_submit_' + this.props.n,
            onClick: function onClick() {
              return UI.TabView.submitJSONvars('#t' + _this3.props.n);
            }
          }));
          innerHTML.push( /*#__PURE__*/React.createElement("label", {
            key: k++,
            htmlFor: 'json_submit_' + this.props.n
          }, "Submit"));
          break;

        case 'text':
          innerHTML.push( /*#__PURE__*/React.createElement("span", {
            key: "1",
            dangerouslySetInnerHTML: {
              __html: this.props.rawdata
            }
          }));
          break;

        case 'webpage':
          innerHTML.push( /*#__PURE__*/React.createElement("iframe", {
            key: "1",
            src: this.props.rawdata
          }));

        default:
      }

      return /*#__PURE__*/React.createElement("div", {
        className: this.props.type,
        id: 't' + this.props.n
      }, innerHTML);
    }
  }]);

  return ThrowinComponent;
}(React.Component);

var TabButtonComponent = /*#__PURE__*/function (_React$Component5) {
  _inherits(TabButtonComponent, _React$Component5);

  var _super5 = _createSuper(TabButtonComponent);

  function TabButtonComponent(props) {
    _classCallCheck(this, TabButtonComponent);

    return _super5.call(this, props);
  }

  _createClass(TabButtonComponent, [{
    key: "render",
    value: function render() {
      var _this4 = this;

      var active = this.props.is_active ? ' active' : '';
      return /*#__PURE__*/React.createElement("div", {
        className: "tab_button".concat(active),
        onClick: function onClick() {
          return UI.TabView.setActive(_this4.props.n);
        }
      }, this.props.title);
    }
  }]);

  return TabButtonComponent;
}(React.Component);

var TabViewComponent = /*#__PURE__*/function (_React$Component6) {
  _inherits(TabViewComponent, _React$Component6);

  var _super6 = _createSuper(TabViewComponent);

  function TabViewComponent(props) {
    _classCallCheck(this, TabViewComponent);

    return _super6.call(this, props);
  }

  _createClass(TabViewComponent, [{
    key: "render",
    value: function render() {
      var _this5 = this;

      var throwin_set = [],
          button_set = [];
      DATA.Throwin.getAll().forEach(function (t, i) {
        var is_active = _this5.props.active_tab === i + 1;
        var active = is_active ? ' active' : '';
        throwin_set.push( /*#__PURE__*/React.createElement("div", {
          key: i,
          className: "throwin".concat(active)
        }, t.getThrowinComponent()));
        button_set.push( /*#__PURE__*/React.createElement(TabButtonComponent, {
          key: i,
          n: t.id,
          title: t.title,
          is_active: is_active
        }));
      });
      return /*#__PURE__*/React.createElement("div", {
        id: "tabs"
      }, /*#__PURE__*/React.createElement("div", {
        id: "throwin_set"
      }, throwin_set), /*#__PURE__*/React.createElement("div", {
        id: "button_set"
      }, button_set));
    }
  }]);

  return TabViewComponent;
}(React.Component);

var ReplyButtonComponent = /*#__PURE__*/function (_React$Component7) {
  _inherits(ReplyButtonComponent, _React$Component7);

  var _super7 = _createSuper(ReplyButtonComponent);

  function ReplyButtonComponent(props) {
    _classCallCheck(this, ReplyButtonComponent);

    return _super7.call(this, props);
  }

  _createClass(ReplyButtonComponent, [{
    key: "render",
    value: function render() {
      var _this6 = this;

      return /*#__PURE__*/React.createElement("div", {
        className: 'option' + (this.props.isDefault ? ' default' : '')
      }, /*#__PURE__*/React.createElement("input", {
        type: "radio",
        id: 'opt' + this.props.i,
        name: "options",
        value: this.props.optId
      }), /*#__PURE__*/React.createElement("label", {
        htmlFor: 'opt' + this.props.i,
        onClick: function onClick() {
          return DATA.Dialog.handleAnswer(_this6.props.optId, 'button');
        }
      }, this.props.optText));
    }
  }]);

  return ReplyButtonComponent;
}(React.Component);

var ReplyTextComponent = /*#__PURE__*/function (_React$Component8) {
  _inherits(ReplyTextComponent, _React$Component8);

  var _super8 = _createSuper(ReplyTextComponent);

  function ReplyTextComponent(props) {
    _classCallCheck(this, ReplyTextComponent);

    return _super8.call(this, props);
  }

  _createClass(ReplyTextComponent, [{
    key: "render",
    value: function render() {
      var _this7 = this;

      var keydown_handler = function keydown_handler(e) {
        if (e.key === 'Enter') DATA.Dialog.handleAnswer(_this7.props.optId, 'text');
      };

      return /*#__PURE__*/React.createElement("div", {
        className: 'option' + (this.props.isDefault ? ' default' : '')
      }, /*#__PURE__*/React.createElement("input", {
        type: "text",
        id: 'opt' + this.props.i,
        placeholder: this.props.optText,
        onKeyDown: keydown_handler
      }));
    }
  }]);

  return ReplyTextComponent;
}(React.Component);

var DialogueComponent = /*#__PURE__*/function (_React$Component9) {
  _inherits(DialogueComponent, _React$Component9);

  var _super9 = _createSuper(DialogueComponent);

  function DialogueComponent(props) {
    _classCallCheck(this, DialogueComponent);

    return _super9.call(this, props);
  }

  _createClass(DialogueComponent, [{
    key: "render",
    value: function render() {
      var reply_opts = DATA.Dialog.get(0).reply_opts,
          reply_opts_jsx = [];
      if (reply_opts !== null) reply_opts.forEach(function (opt) {
        reply_opts_jsx.push(opt.jsxElement);
      });
      return /*#__PURE__*/React.createElement("div", {
        id: "dialogue"
      }, /*#__PURE__*/React.createElement("p", {
        className: "prompt"
      }, this.props.prompt), reply_opts_jsx);
    }
  }]);

  return DialogueComponent;
}(React.Component);