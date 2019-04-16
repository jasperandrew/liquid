"use strict";

function _typeof(obj) { if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

function _possibleConstructorReturn(self, call) { if (call && (_typeof(call) === "object" || typeof call === "function")) { return call; } return _assertThisInitialized(self); }

function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }

function _getPrototypeOf(o) { _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf : function _getPrototypeOf(o) { return o.__proto__ || Object.getPrototypeOf(o); }; return _getPrototypeOf(o); }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function"); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, writable: true, configurable: true } }); if (superClass) _setPrototypeOf(subClass, superClass); }

function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

var Tab =
/*#__PURE__*/
function () {
  function Tab(name, data) {
    _classCallCheck(this, Tab);

    this.name = name;
    this.data = data;
    this.extension = this.name.split('.').pop();
    this.title = this.name.split('/').pop();
    this.n = Liquid.tabManager.tabs.length + 1; // this.throwin = new Throwin(name, extension, n, data);
  }

  _createClass(Tab, [{
    key: "getJSX",
    value: function getJSX() {
      return React.createElement(TabComponent, {
        key: this.n,
        n: this.n,
        title: this.title,
        data: this.data
      });
    }
  }], [{
    key: "getFormat",
    value: function getFormat(extension) {
      switch (extension) {
        case 'json_select':
          return 'json_select';

        case 'tsv':
          return 'table';
        // case 'txt':
        // case 'sql':

        default:
          return 'text';
      }
    }
  }]);

  return Tab;
}();

var TableTab =
/*#__PURE__*/
function (_Tab) {
  _inherits(TableTab, _Tab);

  function TableTab() {
    _classCallCheck(this, TableTab);

    return _possibleConstructorReturn(this, _getPrototypeOf(TableTab).call(this));
  }

  return TableTab;
}(Tab);

var JSONTab =
/*#__PURE__*/
function (_Tab2) {
  _inherits(JSONTab, _Tab2);

  function JSONTab() {
    _classCallCheck(this, JSONTab);

    return _possibleConstructorReturn(this, _getPrototypeOf(JSONTab).call(this));
  }

  return JSONTab;
}(Tab);