"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _symbol = require("babel-runtime/core-js/symbol");

var _symbol2 = _interopRequireDefault(_symbol);

var _keys = require("babel-runtime/core-js/object/keys");

var _keys2 = _interopRequireDefault(_keys);

var _toConsumableArray2 = require("babel-runtime/helpers/toConsumableArray");

var _toConsumableArray3 = _interopRequireDefault(_toConsumableArray2);

var _set = require("babel-runtime/core-js/set");

var _set2 = _interopRequireDefault(_set);

exports.default = function (_ref) {
  var template = _ref.template;
  var traverse = _ref.traverse;
  var t = _ref.types;

  var annotationRegex = /^@with(?:\s+exclude\s*:\s*(.+)|$)/;

  var buildParamDef = template("\n    STRING in REF ?\n      REF.NAME :\n      typeof NAME !== \"undefined\" ?\n        NAME :\n        undefined\n  ");

  var buildRetCheck = template("\n    if (typeof RETURN === \"object\") return RETURN.v;\n  ");

  var loopLabelVisitor = {
    LabeledStatement: function LabeledStatement(_ref2, state) {
      var node = _ref2.node;

      state.innerLabels.add(node.label.name);
    }
  };

  var globalsVisitor = {
    AssignmentExpression: function AssignmentExpression(path, _ref3) {
      var globals = _ref3.globals;
      var rootPath = _ref3.rootPath;

      for (var name in path.getBindingIdentifiers()) {
        if (!(0, _bindingUnderPath2.default)(path, rootPath, name)) {
          globals[name] = true;
        }
      }
    },
    ReferencedIdentifier: function ReferencedIdentifier(path, _ref4) {
      var globals = _ref4.globals;
      var rootPath = _ref4.rootPath;

      if (!path.parentPath.isBreakStatement() && !path.parentPath.isContinueStatement()) {
        if (!(0, _bindingUnderPath2.default)(path, rootPath, path.node.name)) {
          globals[path.node.name] = true;
        }
      }
    }
  };

  function loopNodeTo(node) {
    if (t.isBreakStatement(node)) {
      return "break";
    } else if (t.isContinueStatement(node)) {
      return "continue";
    }
  }

  var continuationVisitor = {
    Loop: function Loop(path, state) {
      var oldIgnoreLabeless = state.ignoreLabeless;
      state.ignoreLabeless = true;
      path.traverse(continuationVisitor, state);
      state.ignoreLabeless = oldIgnoreLabeless;
      path.skip();
    },
    Function: function Function(path, state) {
      path.skip();
    },
    SwitchCase: function SwitchCase(path, state) {
      var oldInSwitchCase = state.inSwitchCase;
      state.inSwitchCase = true;
      path.traverse(continuationVisitor, state);
      state.inSwitchCase = oldInSwitchCase;
      path.skip();
    },
    'BreakStatement|ContinueStatement|ReturnStatement': function BreakStatementContinueStatementReturnStatement(path, state) {
      var node = path.node;
      var scope = path.scope;

      if (node[this.LOOP_IGNORE]) return;

      var replace = void 0;
      var loopText = loopNodeTo(node);

      if (loopText) {
        if (node.label) {
          // we shouldn't be transforming this because it exists somewhere inside
          if (state.innerLabels.has(node.label.name)) {
            return;
          }

          loopText = loopText + "|" + node.label.name;
        } else {
          // we shouldn't be transforming these statements because
          // they don't refer to the actual loop we're scopifying
          if (state.ignoreLabeless) return;
          if (state.inSwitchCase) return;

          if (t.isBreakStatement(node)) {
            var parent = path.findParent(function (path) {
              return path.isLoop() || path.isSwitchStatement();
            });

            // Prevent possible ambiguity later with switch statements.
            // Find parent's label (or add one if there isn't one), and make
            //   the break go to that label.
            var label = void 0;
            if (parent.parentPath.isLabeledStatement()) {
              label = parent.parent.label;
            } else {
              label = parent.scope.generateUidIdentifier('outer');
              parent.replaceWith(t.labeledStatement(label, parent.node));
            }
            node.label = label;
            loopText = loopText + "|" + node.label.name;
          }
        }

        state.hasBreakContinue = true;
        state.map[loopText] = node;
        replace = t.stringLiteral(loopText);
      }

      if (path.isReturnStatement()) {
        state.hasReturn = true;
        replace = t.objectExpression([t.objectProperty(t.identifier("v"), node.argument || scope.buildUndefinedNode())]);
      }

      if (replace) {
        replace = t.returnStatement(replace);
        replace[this.LOOP_IGNORE] = true;
        path.skip();
        path.replaceWith(t.inherits(replace, node));
      }
    }
  };

  return {
    visitor: {
      BlockStatement: function BlockStatement(path, _ref5) {
        var _ref5$opts = _ref5.opts;
        _ref5$opts = _ref5$opts === undefined ? {} : _ref5$opts;
        var _ref5$opts$alternativ = _ref5$opts.alternative;
        var alternative = _ref5$opts$alternativ === undefined ? true : _ref5$opts$alternativ;

        if (!alternative) return;

        var node = path.node;

        if (checkComment()) {
          var obj = getExpression();
          path.replaceWith(t.withStatement(obj, node));
        }

        function checkComment() {
          if (node.leadingComments && node.leadingComments.length) {
            var comment = node.leadingComments.slice(-1)[0];
            return annotationRegex.test(comment.value.trim());
          }
          return false;
        }

        function getExpression() {
          var objPath = path.get('body.0');
          if (!objPath || !objPath.isExpressionStatement()) {
            throw (objPath || path).buildCodeFrameError('A @with block must have an expression as its first statement.');
          }
          var node = objPath.node;

          objPath.remove();
          return node.expression;
        }
      },


      WithStatement: {
        exit: function exit(path, _ref6) {
          var _ref6$opts = _ref6.opts;
          _ref6$opts = _ref6$opts === undefined ? {} : _ref6$opts;
          var _ref6$opts$exclude = _ref6$opts.exclude;
          var exclude = _ref6$opts$exclude === undefined ? [] : _ref6$opts$exclude;

          path.ensureBlock();

          var node = path.node;
          var scope = path.scope;

          var obj = path.get('object');
          var srcBody = path.get('body');

          exclude = exclude.concat(checkComment());

          // No body
          if (!srcBody || !srcBody.node.body.length) {
            if (obj.isPure()) {
              path.remove();
            } else {
              path.replaceWith(obj.node);
            }
            return;
          }

          // Get globals
          var globalsState = {
            globals: {},
            rootPath: srcBody
          };

          srcBody.traverse(globalsVisitor, globalsState);

          // Handle excludes
          exclude = new _set2.default([].concat((0, _toConsumableArray3.default)(exclude), (0, _toConsumableArray3.default)(traverse.Scope.contextVariables)));
          var vars = (0, _keys2.default)(globalsState.globals).filter(function (v) {
            return !exclude.has(v);
          });

          // No globals -> no processing needed
          if (!vars.length) {
            var _body = [srcBody.node];
            // If the object has
            if (!obj.isPure()) {
              _body.unshift(t.expressionStatement(obj.node));
            }
            path.replaceWithMultiple(_body);
            return;
          }

          // Look for continuation
          var contState = {
            hasBreakContinue: false,
            ignoreLabeless: false,
            inSwitchCase: false,
            innerLabels: new _set2.default(),
            hasReturn: false,
            // Map of breaks and continues. Key is the returned value, value is
            // the node corresponding to the break/continue.
            map: {},
            LOOP_IGNORE: (0, _symbol2.default)()
          };

          srcBody.traverse(loopLabelVisitor, contState);
          srcBody.traverse(continuationVisitor, contState);

          // Code generation
          var body = [];

          // Determine if the ref variable can be used directly, or if
          // a temporary variable has to be used
          var ref = obj.node;
          if (!t.isIdentifier(ref)) {
            ref = scope.generateUidIdentifier('ref');
            body.push(t.variableDeclaration('var', [t.variableDeclarator(ref, obj.node)]));
          }

          // Build the main function
          var fn = t.functionExpression(null, vars.map(function (v) {
            return t.identifier(v);
          }), srcBody.node);
          // Inherits the `this` from the parent scope
          fn.shadow = true;

          // Build the main function call
          var call = t.callExpression(fn, vars.map(function (v) {
            return buildParamDef({
              STRING: t.stringLiteral(v),
              NAME: t.identifier(v),
              REF: ref
            }).expression;
          }));

          if (traverse.hasType(fn.body, scope, 'YieldExpression', t.FUNCTION_TYPES)) {
            fn.generator = true;
            call = t.yieldExpression(call, true);
          }

          if (traverse.hasType(fn.body, scope, 'AwaitExpression', t.FUNCTION_TYPES)) {
            fn.async = true;
            call = t.awaitExpression(call);
          }

          if (contState.hasReturn || contState.hasBreakContinue) {
            // If necessary, make sure returns, breaks, and continues are
            // handled.
            buildContinuation();
          } else {
            // No returns, breaks, or continues. Just push the call itself.
            body.push(t.expressionStatement(call));
          }

          path.replaceWithMultiple(body);

          function checkComment() {
            if (node.leadingComments && node.leadingComments.length) {
              var comment = node.leadingComments.pop();
              var matches = annotationRegex.exec(comment.value.trim());

              if (!matches) {
                node.leadingComments.push(comment);
                return [];
              }

              // Get rid of the comment completely by removing the trailing
              // comment of the previous node, if it exists.
              var prev = path.getSibling(path.key - 1);
              if (prev.node && prev.node.trailingComments && prev.node.trailingComments[0] === comment) {
                prev.node.trailingComments.pop();
              }

              if (!matches[1]) {
                return [];
              }

              return matches[1].split(',').map(function (v) {
                return v.trim();
              }).filter(function (v) {
                return v;
              });
            }
          }

          function buildContinuation() {
            // Store returned value in a _ret variable.
            var ret = scope.generateUidIdentifier('ret');
            body.push(t.variableDeclaration('var', [t.variableDeclarator(ret, call)]));

            // If there are returns in the body, an object of form {v: value}
            //   will be returned.
            // If `break` and `continue` present in the body with a specified
            //   label, `${keyword}|${label}` will be returned. If not, the
            //   keyword is returned directly.
            // Use a switch-case construct to differentiate between different
            //   return modes. `cases` stores all the individual SwitchCases.
            //   Breaks and continues will be regular cases, while returns are
            //   in `default` and further checked.
            var cases = [];

            var retCheck = buildRetCheck({
              RETURN: ret
            });

            if (contState.hasBreakContinue) {
              for (var key in contState.map) {
                cases.push(t.switchCase(t.stringLiteral(key), [contState.map[key]]));
              }

              if (contState.hasReturn) {
                cases.push(t.switchCase(null, [retCheck]));
              }

              // Optimize the "case" where there is only one case.
              if (cases.length === 1) {
                var single = cases[0];
                body.push(t.ifStatement(t.binaryExpression('===', ret, single.test), single.consequent[0]));
              } else {
                body.push(t.switchStatement(ret, cases));
              }
            } else {
              if (contState.hasReturn) {
                body.push(retCheck);
              }
            }
          }
        }
      }
    }
  };
};

var _bindingUnderPath = require("./binding-under-path.js");

var _bindingUnderPath2 = _interopRequireDefault(_bindingUnderPath);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

module.exports = exports["default"];