// 각 경로 설정
module.exports = {
    root : './',

    // 이메일 전송 테스트 이미지를 전송해서 모바일에서도 확인
    source : {
        // 공통 마스터 탬플릿
        root : './source',
        common : './source/_common',
        html : './source/html'
    },

    // 로컬 서버 루트 경로 설정
    devserver : './dev-server/',

    // 빌드 폳더 설정 (여기서 메일 발송을 하게 함)
    emailtest : './.email-test',

    // 배포용 릴리즈 폴더 설정
    release : './release',

    // 무시 목록
    ignore : [
        '!**/_common/**',     // 공통파일은 포함하지 않음.
        '!**/@snippet/**',    // 조각파일도 포함하지 않음.
        '!**/resource/**',    // 로컬 리소스 폴더도 포함하지 않음.
        '!**/index.html'      // index 파일도 포함하지 않음.
    ]
};

// source의 폴더구조는 꼭 지켜주세요.
// source폴더 기준 1단계를 대상으로 indexfile이 만들어집니다.
