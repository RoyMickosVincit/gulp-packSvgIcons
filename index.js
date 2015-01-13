/**
 *  Some wise stuff here...
 */
var gutil = require('gulp-util');
var PluginError = gutil.PluginError;
var through = require('through2');
var xmldom = require('xmldom');
var DOMParser= xmldom.DOMParser;
var XMLSerializer = xmldom.XMLSerializer;
var slugify = require('slugify');
var File = require('vinyl');
var path = require('path');

var PluginName = 'gulp-packSvgIcons';
var parser, serializer, anonymous_counter;

var wrapperDocText = '<svg version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"\nstyle="display: none;">\n<defs>\n</defs>\n</svg>';
var packedIcons, defsElement;
var result;

var slugifyFileName = function(filepath) {
	var base;
	if (filepath) {
		console.log(filepath);
		base = path.basename(filepath, '.svg');
	}
	if (filepath && base) {
		// tähän jäätiin -- pilko tästä tiedostonimi ja tee uusi slug
		return 'icon_' + slugify(base);
	} else {
		console.log('bumping anonymous_counter');
		return 'icon_svg' + (++anonymous_counter);
	}
};

var packIcon = function(slug, svg) {
	var children = svg.childNodes;
	var child;
	var newElement = packedIcons.createElement('g');
	// add id attribute as slug of file name
	newElement.setAttribute('id', slug);
	for(var i=0; i<children.length; i++) {
		child = children[i];
		newElement.appendChild(packedIcons.importNode(child, true));
	}
	defsElement.appendChild(newElement);
};

var peel = function(file){
	var svgText = file.contents.toString('utf8');
	console.log('peeling: ', svgText);
	var dom = parser.parseFromString(svgText, 'image/svg+xml');
	var svgList = dom.getElementsByTagName('svg');
	var retval, slug;
	if(svgList.length === 1) {
		slug = slugifyFileName(file.path);
		packIcon(slug, svgList[0]);
	}
};

var packIcons = function(filename) {
	if (!filename || typeof filename !== 'string') {
		throw new PluginError(PluginName, 'Missing filename option (must be of type string)');
	}
	parser = new DOMParser();
	serializer = new XMLSerializer();
	packedIcons = parser.parseFromString(wrapperDocText, 'image/svg+xml');
	defsElement = packedIcons.getElementsByTagName('defs')[0];
	anonymous_counter = 0;
	result = new File({path: filename});
	var stream = through.obj(function(file, encoding, callback) {   // transform function
		if (file.isBuffer()) {
			peel(file);
			//file.outcome = new Buffer('');
		}
		if (file.isStream()) {
			this.emit('error', new PluginError(PluginName, 'Streams not supported'));
		}
		// this.push(file);
		callback();
	}, function(callback) {   // flush function
		var pString = serializer.serializeToString(packedIcons);
		result.contents = new Buffer(pString);
		console.log(pString);
		this.push(result);
		callback();		
	});

	return stream;
};

module.exports = packIcons;