# gulp-packSvgIcons
A gulp utility that takes a set of small svg icon files and packs them inside one svg document that can be embedded. The document fragment already has style to define it hidden.

The idea is based on an article by Chris Coyier on [CSS Tricks](http://css-tricks.com/cascading-svg-fill-color/). A set of small svg icons are bundled into a svg fragment that
can be then injected to a html document using gulp-inject.

Usage:

```js
var packSvgIcons = require('gulp-packSvgIcons');

// ...

gulp.task('_packIcons', function() {
  gulp.src('./src/assets/icons/app/*.svg')
    .pipe(packSvgIcons('icons.svg'))
    .pipe(gulp.dest('./.tmp/icons/'));
});

// ...
.pipe(plugins.inject(gulp.src(['./.tmp/icons/icons.svg']), {
        starttag: '<!-- inject:body:{{ext}} -->',
        transform: function(filePath, file) {
          return file.contents.toString('utf8');
        }
      }))
// ...
```

The plugin takes one argument, which is the name of the resulting file. All icon files that are piped to the plugin will be aggregated to the svg document created. The resulting svg document has the following format:

```xml
<svg version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" style="display: none;">
<defs>
<g id="icon_icon-arrow-right"> ... </g>
</defs>
</svg>
```
The `g` element contains the svg content of an individual svg file. The id attribute is derived from the file name prepending `icon_` in front of the slugified basename of the icon.

In your html, you can then use these icons as follows:

```html
<div class="icon_sample">
    <svg viewBox="0 0 24 24"><use xlink:href="#icon_icon-arrow-right"></use></svg>
</div>
```

The key benefit of this approach is that you can use css to tune the svg display. By defining suitable attributes in the `icon_sample` css class you can e.g. alter the colour of the included svg, as described in Chris's document.