// gulp + plugin
const { src, dest, parallel, series, watch } = require('gulp');
const connect = require('gulp-connect')
const imagemin = require('gulp-imagemin')
const extender = require('gulp-html-extend')
const inlineCss = require('gulp-inline-css')
const livereload = require('gulp-livereload')
const shell = require('gulp-exec')
const vinyl = require('vinyl')

// config
const rule = require('./_config/rule.js')
const path = require('./_config/path.js')

//prefix
let make = {}
let copy = {}

// 기능
// 서버 실행
const devserver = function () {
	return connect.server({
		root: path.devserver,
		port : 2219,
		livereload: true,
        directory:true,
        fallback : 'index.html',
		host:'0.0.0.0'
	});
}


// 이미지 복사
copy.image = function () {
    return src([path.source.root + '/**/*.png'].concat(path.ignore))
    .pipe(dest(path.devserver))
}

// html build
make.html = function makehtml () {
    return src([path.source.template.root + '/**/*.html'].concat(path.ignore))
    .pipe(extender(rule.htmlExtend)) // default options
    .pipe(inlineCss(rule.inlineCss))
    .pipe(dest(path.devserver))
    .pipe(livereload({start:true}))
}

// title image file 생성
make.title = function maketitle () {
    return src([path.source.template.root + '/**/*.html'].concat(path.ignore))
};


watchfile = function watchfile () {
    watch(path.source.template.root + '/**/*.html',series(make.html));
}



// image title file make
exports.maketitle = make.title;



// 이 타입이 gulp.task이고.


// 이게 기본 gulp.task('default')랑 같은건가보군.
// 순차로 돌리려면 series를 쓰고, 병렬로 돌리려면 parallel를 사용한다.
// exports.default = parallel(imageCopy);

// watch 옵션을 주면 병렬로 실행시켜야 된다. (끝나지 않는 프로세스)

exports.local = parallel(devserver, make.html, watchfile);

let gm = require('gm').subClass({imageMagick: true});

let im = require('imagemagick')


function test () {
    // return gm(200, 400, "#ddff99f3").drawText(10, 50, "from scratch").write("/Users/mycoolade/workspace/cp-html-email-template/test.png", function (err) {
        // if (!err) console.log('done');
        // // ...
    // });

    gm(329,98,'white')
        // .background('white')
        .fill('black')
        .gravity('West')
        .font(`/Users/mycoolade/workspace/cp-html-email-template/source/font/FedraSerifPro B Normal.otf`,16)
        .density(144)
        .antialias(true)
        .drawText(0,0,'Chain Partners\nMonthly Newsletter')
        // .out('label:Chain Partners\nMonthly Newsletter')
        .in('-interword-spacing 200')
        .write("/Users/mycoolade/workspace/cp-html-email-template/test.png", function (err) {
            if (!err) console.log('done');
            // ...
        });

    // 한줄 사용평
    // 줄간격 조정이 잘 안되거든...
    // 한줄짜리 엘리먼트에만 사용해라. 그러면 된다.
}

test()
// convert -background white -fill black -size 329x98 -geometry +1000+0 -gravity West  -font "./source/font/FedraSerifPro B Normal.otf"\
        // -pointsize 32 -density 72 -interline-spacing 5 label:"Chain Partners\nMonthly Newsletter"\
        // ~/desktop/Label.png | open ~/desktop/Label.png

