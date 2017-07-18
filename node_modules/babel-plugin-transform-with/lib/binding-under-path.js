'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _getIterator2 = require('babel-runtime/core-js/get-iterator');

var _getIterator3 = _interopRequireDefault(_getIterator2);

exports.default = hasBindingUnderPath;

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function hasBindingUnderPath(path, rootPath, name) {
  if (!name) return false;
  var binding = path.scope.getBinding(name);

  function ok(path) {
    var candidates = arguments.length <= 1 || arguments[1] === undefined ? [] : arguments[1];
    var constantViolation = arguments.length <= 2 || arguments[2] === undefined ? false : arguments[2];

    if (constantViolation && !path.isVariableDeclarator()) {
      return false;
    }

    if (path.findParent(function (p) {
      return p === rootPath;
    })) {
      // If the variable is declared but not initialized within the
      // with, the with takes over. Thus, keep searching.
      if (!path.isVariableDeclarator() || path.parent.kind !== 'var' || path.node.init) {
        return true;
      }
    }

    var _iteratorNormalCompletion = true;
    var _didIteratorError = false;
    var _iteratorError = undefined;

    try {
      for (var _iterator = (0, _getIterator3.default)(candidates), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
        var _path = _step.value;

        if (ok(_path, [], true)) return true;
      }
    } catch (err) {
      _didIteratorError = true;
      _iteratorError = err;
    } finally {
      try {
        if (!_iteratorNormalCompletion && _iterator.return) {
          _iterator.return();
        }
      } finally {
        if (_didIteratorError) {
          throw _iteratorError;
        }
      }
    }

    return false;
  }

  if (binding) {
    if (ok(binding.path, binding.constantViolations)) return true;
  }

  do {
    if (path.scope.uids[name]) return true;
  } while (path = path.parentPath);

  return false;
}
module.exports = exports['default'];