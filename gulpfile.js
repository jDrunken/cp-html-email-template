var gulp         = require('gulp'),
    livereload   = require('gulp-livereload'),
    connect      = require('gulp-connect'),
    inlineCss    = require('gulp-inline-css'),
    imagemin     = require('gulp-imagemin'),
    extender     = require('gulp-html-extend'),
    shell        = require('gulp-shell'),
    runSequence  = require('run-sequence'),
    fs           = require('fs'),
    replace      = require('gulp-replace'),
    stripComment = require('gulp-strip-comments'),
    gutil        = require('gulp-util'),
    plumber      = require('gulp-plumber'),
    zip          = require('gulp-zip'),
    args         = require('yargs').argv,
    rename       = require('gulp-rename'),
    clean        = require('gulp-clean'),
    color        = require('gulp-color'),
    makeIndex    = require('gulp-index')
;

var path = require('./_config/path.js');

// --------------------------------------------------------------------------------
// 로컬 개발용 설정
// --------------------------------------------------------------------------------



// 로컬 서버 :: live reload
gulp.task('connect', function() {
	connect.server({
		root: path.devserver,
		port : 2219,
		livereload: true,
        directory:true,
        fallback : 'index.html',
		host:'0.0.0.0'
	});
});

// index 파일 자동 생성
var buildIndexHtmlOption = require('./_config/build-index-option.js');      // 설정파일 로딩
gulp.task('make:index.html', function () {
    return gulp.src([
        path.source.root + '/**/*.html',    // 전체를 포함
        '!**/_common/**',     // 공통파일은 포함하지 않음.
        '!**/@snippet/**',    // 조각파일도 포함하지 않음.
        '!**/_resource/**',    // 로컬 리소스 폴더도 포함하지 않음.
        '!**/index.html'      // index 파일도 포함하지 않음.
    ])
    .pipe(makeIndex(buildIndexHtmlOption))
    .pipe(gulp.dest(path.devserver));
});


// html build
gulp.task('html', function (){
    return gulp.src(path.source.root + '/**/*.html')
    .pipe(extender({
        annotations:false
        , 	verbose:false
    })) // default options
    .pipe(gulp.dest(path.devserver))
    .pipe(livereload());
});


// ------------------------------------------------------------
// 이미지의 경우 gh-pages에 push한 뒤 그 주소를 일괄로 변경해주어야 하는 단점이 있구나.
// ------------------------------------------------------------

gulp.task('image:copy', function () {
    return gulp.src([
        path.source.root + '/**/*.png',
        '!**/_common/**',     // 공통파일은 포함하지 않음.
        '!**/@snippet/**',    // 조각파일도 포함하지 않음.
        '!**/_resource/**',    // 로컬 리소스 폴더도 포함하지 않음.
        '!**/index.html'      // index 파일도 포함하지 않음.
    ])
		.pipe(gulp.dest(path.devserver))
		.pipe(livereload());
});

gulp.task('image:min', function () {
	gulp.src([
        path.source.root + '/**/*.png',
        '!**/_common/**',     // 공통파일은 포함하지 않음.
        '!**/@snippet/**',    // 조각파일도 포함하지 않음.
        '!**/_resource/**',    // 로컬 리소스 폴더도 포함하지 않음.
        '!**/index.html'      // index 파일도 포함하지 않음.
    ])
		.pipe(imagemin())
		.pipe(gulp.dest(path.devserver))
		.pipe(livereload());
});

gulp.task('css', function (){
    gulp.src(path.source.root + '/**/*.css')
		.pipe(gulp.dest(path.devserver))
		.pipe(livereload());
});

// 파일 변경 감지 :: 로컬 개발 전용
gulp.task('watch', function(callback) {
	livereload.listen();
    gulp.watch([path.source.root+'/**/*.html', '!**/index.html'], ['html'], callback);
    gulp.watch([path.source.root+'/**/*.css', '!**/index.html'], ['css'], callback);
});


// 최초 빌드시 삭제 후 시작
gulp.task('clean:local',function () {
	gulp.src(
        path.devserver + '/**',
        {read: false}
    )
	.pipe(clean());
});

// 로컬 개발환경 launching
gulp.task('local', function () {
	runSequence('clean:local',['make:index.html','html','css','image:copy','watch','connect']);
});














// --------------------------------------------------------------------------------
// 이메일 테스팅을 위한 발송
// --------------------------------------------------------------------------------


// 이메일용으로 빌드하기 전에 한번 비워주고 시작
gulp.task('clean:email', function () {
	 return gulp.src(path.emailtest + '/*')         // read option 제거. 동기로 안되는경우가 많아서 ...
                .pipe(clean());
});

gulp.task('build:email',function () {

    // ftp 서버에 배포용 이미지 전송
    gulp.src(path.source.root + '/**/*.png')
        .pipe(rename({dirname:''}))     //각기 다른 폴더의 파일을 하나의 목적지 폴더로
 		.pipe(sftp(ftp_status));
    // html 가공

    gulp.src([
            path.source.root + '/**/*.html',
            '!**/_common/**',     // 공통파일은 포함하지 않음.
            '!**/@snippet/**',    // 조각파일도 포함하지 않음.
            '!**/_resource/**',    // 로컬 리소스 폴더도 포함하지 않음.
            '!**/index.html'      // index 파일도 포함하지 않음.
        ])
        .pipe(extender({ // default options
            annotations:false
            , 	verbose:false
        }))
        .pipe(inlineCss({
			applyStyleTags: true,
			applyLinkTags: true,
			removeStyleTags: true,
			removeLinkTags: true,
			preserveMediaQueries :true,
			applyTableAttributes : true,
			removeHtmlSelectors : true
		}))
        // 이미지 경로를 외부에서 확인할 수 있는 주소로 변경
 		.pipe(replace('img src="./image/', 'img src="'+path.ftp.image_server))
		.pipe(stripComment({
			safe : true
		}))
        .pipe(gulp.dest(path.emailtest));

});




// 이메일 전송 정보
var sendEmail = {
    toMe : args.toMe,
	message : args.message ? args.message : 'email test',
	file : args.file
}

gulp.task('send:email', shell.task([
	'mailx -s "$(echo -e "'+sendEmail.message+'\nContent-Type: text/html; charset=UTF-8")" ' + sendEmail.toMe + ' < ' + path.emailtest + sendEmail.file
]));


gulp.task('email', function () {
    if (!args.toMe) {
        var message = [
            '// ******************************************************************************************** //' ,
            ''                                                                                                   ,
            '    받으실 분과 파일경로와 파일명이 입력되지 않았습니다. '                                          ,
            '    필수값입니다.'                                                                                  ,
            ''                                                                                                   ,
            '    아래처럼 입력해주세요.'                                                                         ,
            ''                                                                                                   ,
            '    예) gulp email --toMe=\'jinhun.shin@bespinglobal.com\' --file=\'./alertnow/email-incident.html\'' ,
            ''                                                                                                   ,
            '// ******************************************************************************************** //'
        ].join('\n');

        console.log(color(message,'RED'));
    } else {
        runSequence('clean:email','build:email');
    }
});





// --------------------------------------------------------------------------------
// 전달용 파일 생성
// --------------------------------------------------------------------------------

gulp.task('release', function () {
    gulp.src([
            path.source.root + '/**/*.html',
            '!**/_common/**',     // 공통파일은 포함하지 않음.
            '!**/@snippet/**',    // 조각파일도 포함하지 않음.
            '!**/_resource/**',    // 로컬 리소스 폴더도 포함하지 않음.
            '!**/index.html'      // index 파일도 포함하지 않음.
        ])
        .pipe(extender({ // default options
            annotations:false
            , 	verbose:false
        }))
        .pipe(inlineCss({
			applyStyleTags: true,
			applyLinkTags: true,
			removeStyleTags: true,
			removeLinkTags: true,
			preserveMediaQueries :true,
			applyTableAttributes : true,
			removeHtmlSelectors : true
		}))
        // 이미지 경로를 외부에서 확인할 수 있는 주소로 변경
 		.pipe(replace('img src="./image/', 'img src="'+path.ftp.image_server))
		.pipe(stripComment({
			safe : true
		}))
        .pipe(gulp.dest(path.release));
});


// --------------------------------------------------------------------------------
// 기본 동작 설정 :: 로컬에서 개발하는 모드
// --------------------------------------------------------------------------------
//
gulp.task('default',['local']);

