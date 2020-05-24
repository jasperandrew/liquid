"use strict";

function _typeof(obj) { "@babel/helpers - typeof"; if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

function _possibleConstructorReturn(self, call) { if (call && (_typeof(call) === "object" || typeof call === "function")) { return call; } return _assertThisInitialized(self); }

function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }

function _getPrototypeOf(o) { _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf : function _getPrototypeOf(o) { return o.__proto__ || Object.getPrototypeOf(o); }; return _getPrototypeOf(o); }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function"); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, writable: true, configurable: true } }); if (superClass) _setPrototypeOf(subClass, superClass); }

function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

var Throwin = /*#__PURE__*/function () {
  function Throwin(name, extension, rawdata) {
    _classCallCheck(this, Throwin);

    this.name = name;
    this.rawdata = rawdata;
    this.extension = extension;
    this.title = this.name.split('/').pop();
    this.id = DATA.Throwin.data.length + 1;
    this.type = null;
  }

  _createClass(Throwin, [{
    key: "getName",
    value: function getName() {
      return this.name;
    }
  }, {
    key: "getExtension",
    value: function getExtension() {
      return this.extension;
    }
  }, {
    key: "getFullName",
    value: function getFullName() {
      return this.name + '.' + this.extension;
    }
  }, {
    key: "getRawData",
    value: function getRawData() {
      return this.rawdata;
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
    key: "getThrowinComponent",
    value: function getThrowinComponent() {
      return React.createElement(ThrowinComponent, {
        key: this.id,
        n: this.id,
        title: this.title,
        rawdata: this.rawdata,
        type: this.type
      });
    }
  }, {
    key: "download",
    value: function download() {
      var name = prompt('Give the file a name', this.getFullName());
      if (name === null) return;
      if (name === '') name = this.getFullName();
      downloadData(this.rawdata, name);
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

  return Throwin;
}();

var TextThrowin = /*#__PURE__*/function (_Throwin) {
  _inherits(TextThrowin, _Throwin);

  function TextThrowin(name, extension, rawdata) {
    var _this;

    _classCallCheck(this, TextThrowin);

    _this = _possibleConstructorReturn(this, _getPrototypeOf(TextThrowin).call(this, name, extension, rawdata));
    _this.type = 'text';
    return _this;
  }

  return TextThrowin;
}(Throwin);

var TableThrowin = /*#__PURE__*/function (_Throwin2) {
  _inherits(TableThrowin, _Throwin2);

  function TableThrowin(name, extension, rawdata) {
    var _this2;

    _classCallCheck(this, TableThrowin);

    _this2 = _possibleConstructorReturn(this, _getPrototypeOf(TableThrowin).call(this, name, extension, rawdata));
    _this2.type = 'table';
    _this2.object = null;
    _this2.rawdata = {
      cols: [],
      rows: rawdata.rows
    };

    function formatHTML(cell, formatterParams, onRendered) {
      var val = cell.getValue();

      if (isHyperlink(val)) {
        return "<a href=\"".concat(val, "\">").concat(val, "</a>");
      } else {
        return val;
      }
    }

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

    _this2.rawdata.cols.forEach(function (col) {
      return col.formatter = formatHTML;
    });

    return _this2;
  }

  _createClass(TableThrowin, [{
    key: "getTableObject",
    value: function getTableObject() {
      return this.object;
    }
  }, {
    key: "setTableObject",
    value: function setTableObject(object) {
      this.object = object;
    } // Overload

  }, {
    key: "download",
    value: function download() {
      var type = 'csv';

      switch (this.extension) {
        case 'tsv':
          type = 'tsv';
          break;

        default:
      }

      var name = prompt('Give the file a name', this.getFullName());
      if (name === null) return;
      if (name === '') name = this.getFullName();
      this.object.download(type, name);
    }
  }]);

  return TableThrowin;
}(Throwin);

var JSONThrowin = /*#__PURE__*/function (_Throwin3) {
  _inherits(JSONThrowin, _Throwin3);

  function JSONThrowin(name, extension, rawdata) {
    var _this3;

    _classCallCheck(this, JSONThrowin);

    _this3 = _possibleConstructorReturn(this, _getPrototypeOf(JSONThrowin).call(this, name, extension, rawdata));
    _this3.type = 'json';
    _this3.object = null;
    return _this3;
  }

  return JSONThrowin;
}(Throwin);

var JSONSelectThrowin = /*#__PURE__*/function (_JSONThrowin) {
  _inherits(JSONSelectThrowin, _JSONThrowin);

  function JSONSelectThrowin(name, extension, rawdata) {
    var _this4;

    _classCallCheck(this, JSONSelectThrowin);

    _this4 = _possibleConstructorReturn(this, _getPrototypeOf(JSONSelectThrowin).call(this, name, extension, rawdata));
    _this4.type = 'json_select';
    _this4.object = null;
    return _this4;
  } // Overload


  _createClass(JSONSelectThrowin, [{
    key: "download",
    value: function download() {
      // Download disabled
      return;
    }
  }]);

  return JSONSelectThrowin;
}(JSONThrowin);

var WebPageThrowin = /*#__PURE__*/function (_Throwin4) {
  _inherits(WebPageThrowin, _Throwin4);

  function WebPageThrowin(name, extension, rawdata) {
    var _this5;

    _classCallCheck(this, WebPageThrowin);

    _this5 = _possibleConstructorReturn(this, _getPrototypeOf(WebPageThrowin).call(this, name, extension, rawdata));
    _this5.type = 'webpage';
    return _this5;
  } // Overload


  _createClass(WebPageThrowin, [{
    key: "download",
    value: function download() {
      // Download disabled
      return;
    }
  }]);

  return WebPageThrowin;
}(Throwin);