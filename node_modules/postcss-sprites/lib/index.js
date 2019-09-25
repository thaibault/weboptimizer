'use strict';

exports.__esModule = true;

var _postcss = require('postcss');

var _postcss2 = _interopRequireDefault(_postcss);

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

var _core = require('./core');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Plugin registration.
 */
exports.default = _postcss2.default.plugin('postcss-sprites', function () {
	var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

	return function (css, result) {
		// Extend defaults
		var opts = _lodash2.default.merge({}, _core.defaults, options);

		// Setup the logger
		opts.logger = (0, _core.createLogger)(opts.verbose);

		// Prepare filter & group functions
		(0, _core.prepareFilterBy)(opts, result);
		(0, _core.prepareGroupBy)(opts);

		// Process it
		return (0, _core.extractImages)(css, opts, result).spread(function (opts, images) {
			return (0, _core.applyFilterBy)(opts, images);
		}).spread(function (opts, images) {
			return (0, _core.applyGroupBy)(opts, images);
		}).spread(function (opts, images) {
			return (0, _core.setTokens)(css, opts, images);
		}).spread(function (root, opts, images) {
			return (0, _core.runSpritesmith)(opts, images);
		}).spread(function (opts, images, spritesheets) {
			return (0, _core.saveSpritesheets)(opts, images, spritesheets);
		}).spread(function (opts, images, spritesheets) {
			return (0, _core.mapSpritesheetProps)(opts, images, spritesheets);
		}).spread(function (opts, images, spritesheets) {
			return (0, _core.updateReferences)(css, opts, images, spritesheets);
		}).spread(function (root, opts, images, spritesheets) {
			opts.logger(spritesheets.length + ' ' + (spritesheets.length > 1 ? 'spritesheets' : 'spritesheet') + ' generated.');
		}).catch(function (err) {
			console.error('postcss-sprites: An error occurred while processing files - ' + err.message);
			console.error(err.stack);
			throw err;
		});
	};
});
module.exports = exports['default'];