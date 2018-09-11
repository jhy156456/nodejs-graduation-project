var express = require('express'),
    http = require('http'),
    path = require('path');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser'),
    cookieParser = require('cookie-parser'),
    static = require('serve-static'),
    errorHandler = require('errorhandler');
var config = require('./config');
var app = express();
var route_loader = require('./routes/route_loader');
var database = require('./database/database');

app.set('port', process.env.PORT || 3000);

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

//db.connect(function(err) {
//  if (err) {
//    console.log('Unable to connect to MySQL.')
//    process.exit(1)
//  }
//});

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: false
}));

// public 폴더를 static으로 오픈
app.use('/public', static(path.join(__dirname, 'public')));

app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
//app.use('/api/v1', express.Router()); // 로그인

route_loader.init(app, express.Router());




// catch 404 and forward to error handler
app.use(function (req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

// error handler
//app.use(function(err, req, res, next) {
//   set locals, only providing error in development
//  res.locals.message = err.message;
//  res.locals.error = req.app.get('env') === 'development' ? err : {};
//
//   //render the error page
//  res.status(err.status || 500);
//  res.render('error');
//});
http.createServer(app).listen(app.get('port'), function () {
    console.log('서버가 시작되었습니다. 포트 : ' + app.get('port'));

    // 데이터베이스 초기화
    database.init(app, config);

});
module.exports = app;
