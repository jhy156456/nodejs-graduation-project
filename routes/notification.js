var LOADING_SIZE = 20;

var listNotification = function (req, res) {
    console.log('notification 모듈 안에 있는 listNotification 호출됨.');


    var current_page = req.query.current_page || 0;
    var start_page = current_page * LOADING_SIZE;
    var userId = req.body.user_id || req.query.user_id;
    var database = req.app.get('database');

    // 데이터베이스 객체가 초기화된 경우
    if (database.db) {
        // 1. 글 리스트
        var options = {
            start_page: start_page,
            LOADING_SIZE: LOADING_SIZE
        }

        database.NotificationModel.list(options, function (err, results) {
            if (err) {
                console.error('게시판 글 목록 조회 중 에러 발생 : ' + err.stack);

                res.writeHead('200', {
                    'Content-Type': 'text/html;charset=utf8'
                });
                res.write('<h2>게시판 글 목록 조회 중 에러 발생</h2>');
                res.write('<p>' + err.stack + '</p>');
                res.end();

                return;
            }

            if (results) {
                //console.log("문의사항 값:" + JSON.stringify(results))
                res.status(200).json(results);
                res.end();
            } else {
                res.writeHead('200', {
                    'Content-Type': 'text/html;charset=utf8'
                });
                res.write('<h2>글 목록 조회  실패</h2>');
                res.end();
            }
        });
    } else {
        res.writeHead('200', {
            'Content-Type': 'text/html;charset=utf8'
        });
        res.write('<h2>데이터베이스 연결 실패</h2>');
        res.end();
    }

};

module.exports.listNotification = listNotification;