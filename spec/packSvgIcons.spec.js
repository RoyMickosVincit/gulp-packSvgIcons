var packSvgIcons = require('../index');
var File = require('vinyl');
var xmldom = require('xmldom');
var gulp = require('gulp');
var DOMParser= xmldom.DOMParser;
var assert = require('stream-assert');
var path = require('path');

var fixtures = function (glob) { return path.join(__dirname, 'fixtures', glob); };

describe('gulp-packSvgIcons', function() {
	describe('in buffer mode', function () {
		var parser;
		var svgFixture = function() {
			return new File({
				contents: new Buffer('<?xml version="1.0"?><svg viewBox="0 0 24 24"><path /></svg>')
			});
		};
		
		beforeEach(function() {
			parser = new DOMParser();
		});

		var testBaseSVGProperties = function(outcome, tag1) {
			expect(outcome.documentElement.tagName).toEqual('svg');
			expect(outcome.documentElement.getAttribute('style')).toEqual('display: none;');
			expect(outcome.getElementsByTagName('defs').length).toEqual(1);
			var defs = outcome.getElementsByTagName('defs')[0];
			expect(defs.getElementsByTagName('g').length).toEqual(1);
			var g1 = defs.getElementsByTagName('g')[0];
			expect(g1.getAttribute('id')).toEqual(tag1);
			expect(g1.getElementsByTagName('path').length).toEqual(1);			
		};

		it('repacks svg documents', function(done) {
			var packer = packSvgIcons('test.svg');
			var source = svgFixture();
			packer.write(source);

			packer.once('data', function(file) {
				expect(file.isBuffer()).toBeTruthy();
				console.log('file contents: ', file.contents.toString('utf8'));
				var outcome = parser.parseFromString(file.contents.toString('utf8'));
				testBaseSVGProperties(outcome, 'icon_svg1');
				done();
			});

			packer.end();
		});

		it('aggregates multiple svg documents', function(done) {
			var packer = packSvgIcons('test.svg');
			packer.write(svgFixture());
			packer.write(svgFixture());

			packer.once('data', function(file) {
				var outcome = parser.parseFromString(file.contents.toString('utf8'));
				var groups = outcome.getElementsByTagName('g');
				expect(groups.length).toEqual(2);
				expect(groups[0].getAttribute('id')).toEqual('icon_svg1');
				expect(groups[1].getAttribute('id')).toEqual('icon_svg2');
				done();
			});

			packer.end();
		});

		it('integrates with gulp', function(done) {
			// simulate the actual usage scenario with gulp
			gulp.src(fixtures('*'))
				.pipe(packSvgIcons('test.svg'))
				.pipe(assert.first(function(dest) {
					var outcome = parser.parseFromString(dest.contents.toString('utf8'));
					testBaseSVGProperties(outcome, 'icon_icon1');
				}))
				.pipe(assert.end(done));
				// in real scenario, you'd do .pipe(gulp.dest(...))
		});

		it('emits error on streamed file', function(done) {
			gulp.src(fixtures('*'), {buffer: false})
				.pipe(packSvgIcons('test.svg'))
				.on('error', function(error) {
					expect(error.message).toEqual('Streams not supported');
					done();
				});
		});

		it('throws error when no file name is given', function() {
			expect(function() { packSvgIcons(); }).toThrow();
		});
	});
});
