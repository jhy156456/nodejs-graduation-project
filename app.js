var express = require('express'),
    http = require('http'),
    path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var bodyParser = require('body-parser'),
    cookieParser = require('cookie-parser'),
    static = require('serve-static'),
    errorHandler = require('errorhandler');
// 에러 핸들러 모듈 사용
var expressErrorHandler = require('express-error-handler');
var config = require('./config');
const flash = require('connect-flash');
const session = require('express-session');
require('dotenv').config();
const webSocket = require('./socket');
const ColorHash = require('color-hash');
// cors 사용 - 클라이언트에서 ajax로 요청 시 CORS(다중 서버 접속) 지원
var app = express();
var route_loader = require('./routes/route_loader');
var database = require('./database/database');



//===== 뷰 엔진 설정 =====//
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

//===== 서버 변수 설정 및 static으로 public 폴더 설정  =====//
console.log('config.server_port : %d', config.server_port);
app.set('port', process.env.PORT || 8005);

// body-parser를 이용해 application/x-www-form-urlencoded 파싱
app.use(bodyParser.urlencoded({
    extended: false
}))
// body-parser를 이용해 application/json 파싱
app.use(bodyParser.json())
// public 폴더를 static으로 오픈
//app.use('/public', static(path.join(__dirname, 'public')));
//위에꺼로 public폴더오픈하면 구매리스트에서 사진이 로딩되지않는당..!
app.use(express.static(path.join(__dirname, 'public')));
app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
//<== 채팅구현위해 추가함 ==>
const sessionMiddleware = session({
    resave: false,
    saveUninitialized: false,
    secret: process.env.COOKIE_SECRET,
    cookie: {
        httpOnly: true,
        secure: false,
    },
});
app.use(logger('dev'));
app.use(sessionMiddleware);
//
app.use(cookieParser())
app.use(cookieParser(process.env.COOKIE_SECRET));
app.use(flash());
app.use((req, res, next) => {
    if (!req.session.color) {
        const colorHash = new ColorHash();
        req.session.color = colorHash.hex(req.sessionID);
    }
    next();
});
//<==채팅구현위해 추가함 끝==>

//라우팅 정보를 읽어들여 라우팅 설정
route_loader.init(app, express.Router());




// catch 404 and forward to error handler
app.use(function (req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

/*//===== 404 에러 페이지 처리 =====//
var errorHandler = expressErrorHandler({
 static: {
   '404': './public/404.html'
 }
});

app.use( expressErrorHandler.httpError(404) );
app.use( errorHandler );*/


/*// error handler 오류나면 이거전부 주석하셈
app.use(function (err, req, res, next) {
    // set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};
    // render the error page
    res.status(err.status || 500);
    res.render('error');
});*/


//확인되지 않은 예외 처리 - 서버 프로세스 종료하지 않고 유지함
process.on('uncaughtException', function (err) {
	console.log('uncaughtException 발생함 : ' + err);
	console.log('서버 프로세스 종료하지 않고 유지함.');
	
	console.log(err.stack);
});

// 프로세스 종료 시에 데이터베이스 연결 해제
process.on('SIGTERM', function () {
    console.log("프로세스가 종료됩니다.");
    app.close();
});

app.on('close', function () {
	console.log("Express 서버 객체가 종료됩니다.");
	if (database.db) {
		database.db.close();
	}
});


var server = http.createServer(app).listen(app.get('port'), function () {
    console.log('서버가 시작되었습니다. 포트 : ' + app.get('port'));
    // 데이터베이스 초기화
    database.init(app, config);
});
webSocket(server, app, sessionMiddleware);

module.exports = app;
