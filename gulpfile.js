const { src, dest, parallel, series, watch } = require('gulp');
const connect = require('gulp-connect')
const imagemin = require('gulp-imagemin')
const extender = require('gulp-html-extend')
const inlineCss = require('gulp-inline-css')

const rule = require('./_config/rule.js')
const path = require('./_config/path.js')



// 기능
function imageCopy () {
    return src([path.source.root + '/**/*.png'].concat(path.ignore))
    .pipe(dest(path.devserver))
}

function devserver () {
	connect.server({
		root: path.devserver,
		port : 2219,
		livereload: true,
        directory:true,
        fallback : 'index.html',
		host:'0.0.0.0'
	});
}

function html_make () {
    return src([path.source.template.root + '/**/*.html'].concat(path.ignore))
    .pipe(extender(rule.htmlExtend)) // default options
    .pipe(inlineCss(rule.inlineCss))
    .pipe(dest(path.devserver))
}






// 이 타입이 gulp.task이고.
exports.html_make = html_make;
exports.imageCopy = imageCopy;
exports.devserver = devserver;

// 이게 기본 gulp.task('default')랑 같은건가보군.
// 순차로 돌리려면 series를 쓰고, 병렬로 돌리려면 parallel를 사용한다.
// exports.default = parallel(imageCopy);
