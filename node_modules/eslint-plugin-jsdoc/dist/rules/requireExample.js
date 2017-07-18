'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

var _iterateJsdoc = require('../iterateJsdoc');

var _iterateJsdoc2 = _interopRequireDefault(_iterateJsdoc);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

exports.default = (0, _iterateJsdoc2.default)(function (_ref) {
  var jsdoc = _ref.jsdoc,
      report = _ref.report,
      utils = _ref.utils;

  var targetTagName = utils.getPreferredTagName('example');

  var functionExamples = _lodash2.default.filter(jsdoc.tags, {
    tag: targetTagName
  });

  if (_lodash2.default.isEmpty(functionExamples)) {
    return report('Missing JSDoc @' + targetTagName + ' declaration.');
  }

  return _lodash2.default.forEach(functionExamples, function (example) {
    var exampleContent = _lodash2.default.compact((example.name + ' ' + example.description).trim().split('\n'));

    if (_lodash2.default.isEmpty(exampleContent)) {
      report('Missing JSDoc @' + targetTagName + ' description.');
    }
  });
});
module.exports = exports['default'];
//# sourceMappingURL=requireExample.js.map