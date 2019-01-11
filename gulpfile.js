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
const datetime = require('node-datetime')
const replace = require('gulp-replace-string')

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

// html build상에 테스트할게 있다.

const inky = require('inky')






// 여기서 한번 테스트를 해봐야겠네.

// var Inky = require('inky').Inky;
// var cheerio = require('cheerio');

// var options = {};
// var input = '<cell></cell>';

// // The same plugin settings are passed in the constructor
// var i = new Inky(options);
// var html = cheerio.load(input)

// // Now unleash the fury
// var convertedHtml = i.releaseTheKraken(html);

// // The return value is a Cheerio object. Get the string value with .html()
// console.log(convertedHtml);
// 변환되는건 확인했는데 접근만 가능하지 추가로 문법을 넣을수는 없어보인다.









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

copy.localcss = function copylocalcss () {
    return src([directory.source.template.root + '/**/*.css'].concat(directory.ignore))
        .pipe(dest(directory.devserver))
        .pipe(livereload({start:true}))
}


const watchfile = function watchfile () {
    livereload.listen()
    watch([
        directory.source.template.root + '/**/*.html',
        directory.source.template.root + '/**/*.css'
    ],series(make.html))
    watch(directory.source.template.root + '/**/*.png',series(copy.image))
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

exports.local = parallel(devserver, series(make.date, copy.image,copy.localcss, make.html), watchfile);

exports.image = make.date;
