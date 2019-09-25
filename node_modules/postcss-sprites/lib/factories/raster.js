'use strict';

exports.__esModule = true;
exports.default = run;

var _spritesmith = require('spritesmith');

var _spritesmith2 = _interopRequireDefault(_spritesmith);

var _bluebird = require('bluebird');

var _bluebird2 = _interopRequireDefault(_bluebird);

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Generate the spritesheet.
 * @param  {Object} opts
 * @param  {Array}  images
 * @return {Promise}
 */
function run(opts, images) {
	var config = _lodash2.default.defaultsDeep({}, {
		src: _lodash2.default.map(images, 'path')
	}, opts.spritesmith);

	// Increase padding to handle retina ratio
	if (areRetinaImages(images)) {
		var ratio = _lodash2.default.chain(images).flatten('ratio').uniq().head().value().ratio;

		if (ratio) {
			config.padding = config.padding * ratio;
		}
	}

	return _bluebird2.default.promisify(_spritesmith2.default.run, { context: _spritesmith2.default })(config).then(function (spritesheet) {
		spritesheet.extension = 'png';

		return spritesheet;
	});
}

/**
 * Checkes whether all images are retina.
 * @param  {Array} images
 * @return {Boolean}
 */
function areRetinaImages(images) {
	return _lodash2.default.every(images, function (image) {
		return image.retina;
	});
}
module.exports = exports['default'];