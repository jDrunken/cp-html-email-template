// gulp + plugin
const { src, dest, parallel, series, watch } = require('gulp');
const connect = require('gulp-connect')
const imagemin = require('gulp-imagemin')
const extender = require('gulp-html-extend')
const inlineCss = require('gulp-inline-css')
const livereload = require('gulp-livereload')
const shell = require('gulp-exec')
const path = require('path')
const tap = require('gulp-tap')
const datetime = require('node-datetime');


let gm = require('gm').subClass({imageMagick: true});

// config
const rule = require('./_config/rule.js')
const directory = require('./_config/path.js')

//prefix
let make = {}
let copy = {}

// 기능
// 서버 실행
const devserver = function () {
	return connect.server({
		root: directory.devserver,
		port : 2219,
		livereload: true,
        directory:true,
        fallback : 'index.html',
		host:'0.0.0.0'
	});
}


// 이미지 복사
copy.image = function () {
    return src([directory.source.template.root + '/**/*.png'].concat(directory.ignore))
    .pipe(dest(directory.devserver))
}

// html build
make.html = function makehtml () {
    return src([directory.source.template.root + '/**/*.html'].concat(directory.ignore))
    .pipe(extender(rule.htmlExtend)) // default options
    .pipe(inlineCss(rule.inlineCss))
    .pipe(dest(directory.devserver))
    .pipe(livereload({start:true}))
}

// title image file 생성
make.title = function maketitle () {
    return src([directory.source.template.root + '/**/*.html'].concat(directory.ignore))
};


watchfile = function watchfile () {
    watch(directory.source.template.root + '/**/*.html',series(make.html));
    watch(directory.source.template.root + '/**/*.png',series(copy.image));
}



// image title file make
exports.maketitle = make.title;



// 이 타입이 gulp.task이고.


// 이게 기본 gulp.task('default')랑 같은건가보군.
// 순차로 돌리려면 series를 쓰고, 병렬로 돌리려면 parallel를 사용한다.
// exports.default = parallel(imageCopy);

// watch 옵션을 주면 병렬로 실행시켜야 된다. (끝나지 않는 프로세스)


make.date = async function makedate () {
    // 여기서 해줘야 될건...
    // 파일명을 받아온다.
    // 받아온 파일명을 변환한다. (2019-12-28 => December,28 2018)
    // 이미지로 파일을 만든다.

    let text = '';


    return src([directory.source.template.root + '/**/*.html'].concat(directory.ignore),{stat:true})
        .pipe(
            tap(function (file,t) {
                let dateText = file.path.split('/').reverse()[0].split('.')[0]
                formattedDate = datetime.create(dateText,'f,d Y').format()

                let saveTarget = file.path.split('/')
                saveTarget.reverse().shift()
                saveTarget = saveTarget.reverse().join('/')

                text = saveTarget;
                console.log(text);

                gm(329,98,'white')
                    .background('white')
                    .fill('black')
                    .gravity('West')
                    .font(`${directory.source.font}/FedraSerifPro B Normal.otf`,16)
                    .density(144)
                    .antialias(true)
                    .drawText(0,0,formattedDate)
                // .out('label:Chain Partners\nMonthly Newsletter')
                // .in('-interword-spacing 200')
                    .write(`${saveTarget}/date.png`, function (err) {
                        // !err ? console.log('done') : console.log('error')
                        // ...
                    });
            })
        )
}

exports.local = parallel(devserver, series(make.date, copy.image, make.html), watchfile);

exports.image = make.date;
// convert -background white -fill black -size 329x98 -geometry +1000+0 -gravity West  -font "./source/font/FedraSerifPro B Normal.otf"\
        // -pointsize 32 -density 72 -interline-spacing 5 label:"Chain Partners\nMonthly Newsletter"\
        // ~/desktop/Label.png | open ~/desktop/Label.png

