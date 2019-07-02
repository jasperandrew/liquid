"use strict";

var API_URL = 'https://spurcell.pythonanywhere.com/cmd';
var INIT_DIALOGUE = {
  prompt: 'Let\'s begin.  Choose the \'wizard\' interview or just start throwing in input and output files with the blue button.',
  id: null,
  data: null,
  options: [{
    jsxElement: React.createElement(OptionComponent, {
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
    jsxElement: React.createElement(OptionComponent, {
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