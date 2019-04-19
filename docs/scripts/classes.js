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
  function Tab(name, extension, rawdata) {
    _classCallCheck(this, Tab);

    this.name = name;
    this.rawdata = rawdata;
    this.file_type = null;
    this.title = this.name.split('/').pop();
    this.id = Liquid.tabManager.tabs.length + 1;
    this.tab_type = null;
  }

  _createClass(Tab, [{
    key: "getName",
    value: function getName() {
      return this.name;
    }
  }, {
    key: "getRawData",
    value: function getRawData() {
      return this.rawdata;
    }
  }, {
    key: "getExtension",
    value: function getExtension() {
      return this.extension;
    }
  }, {
    key: "getID",
    value: function getID() {
      return this.id;
    }
  }, {
    key: "getType",
    value: function getType() {
      return this.type;
    }
  }, {
    key: "getComponent",
    value: function getComponent() {
      return React.createElement(TabComponent, {
        key: this.id,
        n: this.id,
        title: this.title,
        rawdata: this.rawdata,
        type: this.type
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

var TextTab =
/*#__PURE__*/
function (_Tab) {
  _inherits(TextTab, _Tab);

  function TextTab(name, extension, rawdata) {
    var _this;

    _classCallCheck(this, TextTab);

    _this = _possibleConstructorReturn(this, _getPrototypeOf(TextTab).call(this, name, extension, rawdata));
    _this.type = 'text';
    return _this;
  }

  return TextTab;
}(Tab);

var TableTab =
/*#__PURE__*/
function (_Tab2) {
  _inherits(TableTab, _Tab2);

  function TableTab(name, extension, rawdata) {
    var _this2;

    _classCallCheck(this, TableTab);

    _this2 = _possibleConstructorReturn(this, _getPrototypeOf(TableTab).call(this, name, extension, rawdata));
    _this2.type = 'table';
    _this2.object = null;
    _this2.rawdata = {
      cols: [],
      rows: rawdata.rows
    };

    if (typeof rawdata.cols[0] === "string") {
      // Temporary check to see if cols are string or object
      rawdata.cols.forEach(function (col) {
        return _this2.rawdata.cols.push({
          title: col,
          field: col,
          editor: true
        });
      });
    } else {
      _this2.rawdata.cols = rawdata.cols;
    }

    return _this2;
  }

  _createClass(TableTab, [{
    key: "getTableObject",
    value: function getTableObject() {
      return this.object;
    }
  }, {
    key: "setTableObject",
    value: function setTableObject(object) {
      this.object = object;
    }
  }]);

  return TableTab;
}(Tab);

var JSONTab =
/*#__PURE__*/
function (_Tab3) {
  _inherits(JSONTab, _Tab3);

  function JSONTab(name, extension, rawdata) {
    var _this3;

    _classCallCheck(this, JSONTab);

    _this3 = _possibleConstructorReturn(this, _getPrototypeOf(JSONTab).call(this, name, extension, rawdata));
    _this3.type = 'json';
    _this3.object = null;
    return _this3;
  }

  return JSONTab;
}(Tab);

var JSONSelectTab =
/*#__PURE__*/
function (_JSONTab) {
  _inherits(JSONSelectTab, _JSONTab);

  function JSONSelectTab(name, extension, rawdata) {
    var _this4;

    _classCallCheck(this, JSONSelectTab);

    _this4 = _possibleConstructorReturn(this, _getPrototypeOf(JSONSelectTab).call(this, name, extension, rawdata));
    _this4.type = 'json_select';
    _this4.object = null;
    return _this4;
  }

  return JSONSelectTab;
}(JSONTab);