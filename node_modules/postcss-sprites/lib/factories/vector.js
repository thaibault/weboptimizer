'use strict';

exports.__esModule = true;
exports.default = run;

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

var _svgSprite = require('svg-sprite');

var _svgSprite2 = _interopRequireDefault(_svgSprite);

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
	var config = _lodash2.default.defaultsDeep({}, opts.svgsprite);
	var spriter = new _svgSprite2.default(config);

	images.forEach(function (_ref) {
		var path = _ref.path;

		spriter.add(path, null, _fs2.default.readFileSync(path, { encoding: 'utf-8' }));
	});

	return _bluebird2.default.promisify(spriter.compile, {
		context: spriter,
		multiArgs: true
	})().spread(function (result, data) {
		var spritesheet = {};

		spritesheet.extension = 'svg';
		spritesheet.coordinates = {};
		spritesheet.image = result.css.sprite.contents;
		spritesheet.properties = {
			width: data.css.spriteWidth,
			height: data.css.spriteHeight
		};

		data.css.shapes.forEach(function (shape) {
			spritesheet.coordinates[new Buffer(shape.name, 'base64').toString()] = {
				width: shape.width.outer,
				height: shape.height.outer,
				x: shape.position.absolute.x,
				y: shape.position.absolute.y
			};
		});

		return spritesheet;
	});
}
module.exports = exports['default'];