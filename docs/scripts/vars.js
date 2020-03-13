"use strict";

var API_URL = 'https://spurcell.pythonanywhere.com/cmd';
var INIT_DIALOGUE = {
  prompt: 'Let\'s begin.  Choose the \'wizard\' interview or just start throwing in input and output files with the blue button.',
  id: null,
  data: null,
  type: 'button',
  reply_opts: [{
    jsxElement: React.createElement(ReplyButtonComponent, {
      key: 1,
      i: 1,
      isDefault: 0,
      optText: "Start the interview wizard",
      optId: "wizard"
    }),
    isDefault: 0,
    optText: 'Start the interview wizard',
    optId: 'wizard'
  }, {
    jsxElement: React.createElement(ReplyButtonComponent, {
      key: 2,
      i: 2,
      isDefault: 0,
      optText: "Upload (\"Throw in\") a file from your computer",
      optId: "upload"
    }),
    isDefault: 0,
    optText: 'Upload ("Throw in") a file from your computer',
    optId: 'upload'
  }]
};
var WAIT_DIALOGUE = {
  prompt: 'Throw in the next file using the Throw-In button.',
  id: null,
  data: null,
  options: null
};

function triTickFormatter(cell, formatterParams, onRendered) {
  switch (cell.getValue()) {
    case undefined:
      cell.setValue(null);
      return '☐';

    case null:
      return '☐';

    case false:
      return '☒';

    case true:
      return '☑';
  }
}

function triTickCellClick(e, cell) {
  console.log(cell.getValue());

  switch (cell.getValue()) {
    case undefined:
      cell.setValue(true);
      break;

    case null:
      cell.setValue(true);
      break;

    case false:
      cell.setValue(null);
      break;

    case true:
      cell.setValue(false);
      break;
  }
}

function jsepToString(tree) {
  var side = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : null;
  var err_str = '{ERR}';

  switch (tree.type) {
    // case 'Compound':
    case 'Identifier':
      {
        var q = side === 'r' ? '\'' : '',
            d1 = side === 'l' ? 'data[\'' : '',
            d2 = side === 'l' ? '\']' : '';
        return q + d1 + tree.name + d2 + q;
      }
    // case 'MemberExpression':

    case 'Literal':
      {
        var _q = side === 'r' ? '\'' : '',
            _d = side === 'l' ? 'data[\'' : '',
            _d2 = side === 'l' ? '\']' : '';

        return _q + _d + tree.value + _d2 + _q;
      }
    // case 'ThisExpression':
    // case 'CallExpression':

    case 'UnaryExpression':
      {
        var op;

        switch (tree.operator) {
          case 'not':
            op = '!';
            break;

          default:
            op = tree.operator;
        }

        return "".concat(tree.operator, "(").concat(jsepToString(tree.argument, 'r'), ")");
      }

    case 'BinaryExpression':
      {
        if (tree.left.type === 'Literal') {// TODO // validate column identifiers
        } else if (tree.left.type !== 'Identifier') {
          console.error("jsepToString: Left argument of a binary expression must be a column identifier");
          return err_str;
        }

        var _op;

        switch (tree.operator) {
          case '=':
          case 'is':
            _op = '==';
            break;

          case 'is not':
          case 'isn\'t':
            _op = '!=';
            break;

          case 'in':
            {
              if (tree.right.type !== 'ArrayExpression') {
                console.error("jsepToString: Invalid usage of 'in' operator");
                return err_str;
              }

              var arr = '[';

              for (var i in tree.right.elements) {
                if (!['Literal', 'Identifier'].includes(tree.right.elements[i].type)) {
                  console.error("jsepToString: Invalid usage of 'in' operator");
                  return err_str;
                }

                arr += jsepToString(tree.right.elements[i], 'r') + ',';
              }

              arr += ']';
              return "".concat(arr, ".includes(").concat(jsepToString(tree.left, 'l'), ")");
            }

          case 'contains':
            {
              if (!['Literal', 'Identifier'].includes(tree.right.type)) {
                console.error("jsepToString: Invalid usage of 'contains' operator");
                return err_str;
              }

              return "".concat(jsepToString(tree.left, 'l'), ".includes(").concat(jsepToString(tree.right, 'r'), ")");
            }

          case 'regex':
            {
              if (!['Literal', 'Identifier'].includes(tree.right.type)) {
                console.error("jsepToString: Invalid usage of 'regex' operator");
                return err_str;
              }

              var regex = new RegExp(jsepToString(tree.right, null)).toString();
              return "".concat(regex, ".test(").concat(jsepToString(tree.left, 'l'), ")");
            }

          default:
            _op = tree.operator;
        }

        return "(".concat(jsepToString(tree.left, 'l'), " ").concat(_op, " ").concat(jsepToString(tree.right, 'r'), ")");
      }

    case 'LogicalExpression':
      return "(".concat(jsepToString(tree.left, 'l'), " ").concat(tree.operator, " ").concat(jsepToString(tree.right, 'r'), ")");
    // case 'ConditionalExpression':
    // case 'ArrayExpression':

    default:
      console.error("jsepToString: Unsupported expression type '".concat(tree.type, "'"));
      return err_str;
  }
}

function arbitraryFilter(data, filterParams) {
  // one > 2 & two < 5
  var replace = {
    '&': '&&',
    '|': '||'
  }; // TODO // implement NOT operator

  var filter = filterParams.split('').join('');

  for (var r in replace) {
    var regex = new RegExp("([^".concat(r, "])\\").concat(r, "([^").concat(r, "])"));
    filter = filter.replace(regex, "$1".concat(replace[r], "$2"));
  }

  console.log(filter); // try {
  // 	let parsed_tree = jsep(filter);
  // 	console.log(parsed_tree);
  // 	if(parsed_tree.type !== 'BinaryExpression'){
  // 		console.log('Invalid expression type');
  // 		return true;
  // 	}
  // } catch(e) {
  // 	console.log(`JSEP: ${e.message}`);
  // 	return true;
  // }
  // console.log(parse('( one > 2 && two < 5 || blah == 9 ) || (three == 1)'));

  var func_str = 'return ' + jsepToString(jsep(filter));
  console.log(func_str);

  try {
    var result = new Function('data', func_str);
    return result(data);
  } catch (e) {
    console.error("Filter: ".concat(e));
    return false;
  }
}
/** Test functions */


function nestedTableTest() {}

function sendTableData() {
  var name = window.prompt('Give a name for the selection column:', 'select');
  var tab = Liquid.tabManager.getActiveTab();

  if (tab.getType() !== 'table') {
    console.error("tab ".concat(n, " isn't a table tab"));
    return false;
  }

  var object = tab.getTableObject();
  var table = {
    cols: object.getColumnDefinitions(),
    rows: object.getData()
  };
  var json_data = {
    cmd_name: 'user_input',
    input_type: 'checkbox_values',
    tag_col_name: name,
    tabulator_table: table,
    task_name: 'dentists'
  };
  Liquid.httpRequest({
    'json_data': JSON.stringify(json_data)
  }).then(function (response) {
    Liquid.handleResponse(response);
  });
}

function insertCheckboxColumn() {
  var col_name = window.prompt('Give a name for the new checkbox column:', 'checked');
  DATA.Throwin.get(UI.TabView.getActive()).getTableObject().addColumn({
    title: col_name,
    field: col_name,
    formatter: triTickFormatter,
    cellClick: triTickCellClick
  }, true);
}

function insertTextColumn() {
  var col_name = window.prompt('Give a name for the new text column:', 'notes');
  DATA.Throwin.get(UI.TabView.getActive()).getTableObject().addColumn({
    title: col_name,
    field: col_name,
    editor: true
  }, true);
}

function filterColumn() {
  var col = window.prompt('Which column do you want to filter?');
  var fnc = window.prompt('What function do you want to filter with? (=,!=,like,<,<=,>,>=,in,regex)');
  var val = window.prompt('What value do you want to filter by?');
  DATA.Throwin.get(UI.TabView.getActive()).getTableObject().setFilter(col, fnc, val);
}

function filterCustom() {
  var str = window.prompt('Type the filter string here');
  DATA.Throwin.get(UI.TabView.getActive()).getTableObject().setFilter(arbitraryFilter, str);
}

function clearFilters() {
  DATA.Throwin.get(UI.TabView.getActive()).getTableObject().clearFilter();
}

function lockDialogue() {
  UI.toggleClass('#dialogue', 'locked');
}

function toggleCheckboxColumn() {
  var tab = DATA.Throwin.get(UI.TabView.getActive());

  if (tab) {
    if (tab.getType() !== 'table') {
      console.error("current tab isn't a table tab");
      return false;
    }

    var tab_object = tab.getTableObject();
    tab_object.toggleColumn('selection');
  } else {
    console.log("invalid  tab");
  }
}

function typenameof(x) {
  return x ? x.constructor.name : x;
}

function execMenuItemTest() {
  DATA.httpRequest({
    json_data: {
      cmd_name: 'exec_menu_item',
      menu_item_id: 'filter_column',
      task_name: 'dentists'
    }
  }).then(function (res_text) {
    alert(res_text);
  });
}

function downloadCurrentTab() {
  DATA.Throwin.get(UI.TabView.active_tab).download();
}

Tabulator.prototype.extendModule("download", "downloaders", {
  tsv: function tsv(columns, data, options, setFileContents) {
    var tsv_data = '',
        tab = '';

    for (var i in columns) {
      tsv_data += tab + columns[i].title;
      tab = '\t';
    }

    tsv_data += '\n';
    tab = '';

    for (var _i in data) {
      for (var j in columns) {
        tsv_data += tab + data[_i][columns[j].field];
        tab = '\t';
      }

      tsv_data += '\n';
      tab = '';
    }

    setFileContents(tsv_data, 'text/tsv');
  }
});

function downloadData(data, filename) {
  var mime = "text/plain",
      // TODO // Calculate mime type
  blob = new Blob([data], {
    type: mime
  }),
      name = filename || "liquid_download.txt",
      element = document.createElement('a');
  element.setAttribute('href', window.URL.createObjectURL(blob));
  element.setAttribute('download', name);
  element.style.display = 'none';
  document.body.appendChild(element);
  element.click();
  document.body.removeChild(element);
}