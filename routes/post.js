/*
 * 게시판을 위한 라우팅 함수 정의
 *
 * @date 2016-11-10
 * @author Mike
 */
var LOADING_SIZE = 20;

var addpost = function (req, res) {
    console.log('post 모듈 안에 있는 addpost 호출됨.');

    var paramTitle = req.body.name || req.query.name;
    var paramContents = req.body.description || req.query.description;
    var paramWriter = req.body.post_nickname || req.query.post_nickname;
    var member_seq = req.body.member_seq;

    console.log('요청 파라미터 : ' + paramTitle + ', ' + paramContents + ', ' +
        paramWriter);

    var database = req.app.get('database');

    // 데이터베이스 객체가 초기화된 경우
    if (database.db) {

        // 1. 아이디를 이용해 사용자 검색
        database.UserModel.findByEmail(paramWriter, function (err, results) {
            if (err) {
                console.error('게시판 글 추가 중 에러 발생 : ' + err.stack);

                res.writeHead('200', {
                    'Content-Type': 'text/html;charset=utf8'
                });
                res.write('<h2>게시판 글 추가 중 에러 발생</h2>');
                res.write('<p>' + err.stack + '</p>');
                res.end();

                return;
            }

            if (results == undefined || results.length < 1) {
                res.writeHead('200', {
                    'Content-Type': 'text/html;charset=utf8'
                });
                res.write('<h2>사용자 [' + paramWriter + ']를 찾을 수 없습니다.</h2>');
                res.end();

                return;
            }
            console.log("불러온 값" + JSON.stringify(results));
            var userObjectId = results[0]._id;
            console.log('사용자 ObjectId : ' + paramWriter + ' -> ' + userObjectId);

            // save()로 저장
            // PostModel 인스턴스 생성
            var post = new database.PostModel({
                title: paramTitle,
                contents: paramContents,
                writer: userObjectId
            });

            post.savePost(function (err, result) {
                if (err) {
                    if (err) {
                        console.error('응답 웹문서 생성 중 에러 발생 : ' + err.stack);

                        res.writeHead('200', {
                            'Content-Type': 'text/html;charset=utf8'
                        });
                        res.write('<h2>응답 웹문서 생성 중 에러 발생</h2>');
                        res.write('<p>' + err.stack + '</p>');
                        res.end();

                        return;
                    }
                }

                console.log("글 데이터 추가함.");
                console.log('글 작성', '포스팅 글을 생성했습니다. : ' + post._id);

                return res.redirect('/process/showpost/' + post._id);
            });

        });

    } else {
        res.writeHead('200', {
            'Content-Type': 'text/html;charset=utf8'
        });
        res.write('<h2>데이터베이스 연결 실패</h2>');
        res.end();
    }

};

var listpost = function (req, res) {
    console.log('post 모듈 안에 있는 listpost 호출됨.');


    var current_page = req.query.current_page || 0;
    var start_page = current_page * LOADING_SIZE;


    var paramPage = req.body.page || req.query.page;
    var paramPerPage = req.body.perPage || req.query.perPage;

    console.log('요청 파라미터 : ' + paramPage + ', ' + paramPerPage);

    var database = req.app.get('database');

    // 데이터베이스 객체가 초기화된 경우
    if (database.db) {
        // 1. 글 리스트
        var options = {
            page: paramPage,
            perPage: paramPerPage
        }

        database.PostModel.list(options, function (err, results) {
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
                //console.dir(results);

                // 전체 문서 객체 수 확인
                /*
                Error [ERR_HTTP_HEADERS_SENT]: Cannot set headers after they are sent to the client
    at ServerResponse.setHeader (_http_outgoing.js:471:11)
    at ServerResponse.setWriteHeadHeaders (C:\Users\JHY\login\node\node\node_modules\on-headers\index.js:82:19)
    at ServerResponse.writeHead (C:\Users\JHY\login\node\node\node_modules\on-headers\index.js:41:36)
    at C:\Users\JHY\login\node\node\routes\post.js:138:25
    at C:\Users\JHY\login\node\node\node_modules\mongoose\lib\query.js:3118:18
    at process._tickCallback (internal/process/next_tick.js:68:7)
Emitted 'error' event at:
    at Immediate.<anonymous> (C:\Users\JHY\login\node\node\node_modules\mongoose\lib\query.js:3128:23)
    at runCallback (timers.js:696:18)
    at tryOnImmediate (timers.js:667:5)
    at processImmediate (timers.js:649:5)
                database.PostModel.count().exec(function (err, count) {

                    res.writeHead('200', {
                        'Content-Type': 'text/html;charset=utf8'
                    });
                });
                */
                console.log("문의사항 값:" + JSON.stringify(results))
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


var showpost = function (req, res) {
    console.log('post 모듈 안에 있는 showpost 호출됨.');

    // URL 파라미터로 전달됨
    var paramId = req.body.id || req.query.id || req.params.id;
    var paramSeq = req.body.member_seq || req.query.member_seq || req.params.member_seq;
    console.log('요청 파라미터 : ' + paramId);


    var database = req.app.get('database');

    // 데이터베이스 객체가 초기화된 경우
    if (database.db) {
        // 1. 글 리스트
        database.PostModel.load(paramId, function (err, results) {
            if (err) {
                console.error('게시판 글 조회 중 에러 발생 : ' + err.stack);

                res.writeHead('200', {
                    'Content-Type': 'text/html;charset=utf8'
                });
                res.write('<h2>게시판 글 조회 중 에러 발생</h2>');
                res.write('<p>' + err.stack + '</p>');
                res.end();

                return;
            }

            if (results) {
                console.log("너가 선택한것 : " + JSON.stringify(results))
                console.log('trying to update hits.');

                database.PostModel.incrHits(results._doc._id, function (err2, results2) {
                    console.log('incrHits executed.');

                    if (err2) {
                        console.log('incrHits �떎�뻾 以� �뿉�윭 諛쒖깮.');
                        console.dir(err2);
                        return;
                    }

                });
                res.status(200).json(results);
                res.end();
            } else {
                res.writeHead('200', {
                    'Content-Type': 'text/html;charset=utf8'
                });
                res.write('<h2>글 조회  실패</h2>');
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
var addcomment = function (req, res) {
    console.log('addcomment 호출됨');

    var paramId = req.body.postId || req.query.postId;
    var paramContents = req.body.contents || req.query.contents;
    var paramWriter = req.body.writer || req.query.writer;

    console.log('넣을것 : ' + paramId + ', ' + paramContents + ', ' +
        paramWriter);

    var database = req.app.get('database');

    // �뜲�씠�꽣踰좎씠�뒪 媛앹껜媛� 珥덇린�솕�맂 寃쎌슦
    if (database.db) {

        // 1. �븘�씠�뵒瑜� �씠�슜�빐 �궗�슜�옄 寃��깋
        database.PostModel.findByIdAndUpdate(paramId, {
                '$push': {
                    'comments': {
                        'contents': paramContents,
                        'writer': paramWriter
                    }
                }
            }, {
                new: true,
                upsert: true
            },
            function (err, results) {
                if (err) {
                    console.log("에러여기?")
                    console.error('寃뚯떆�뙋 �뙎湲� 異붽? 以� �뿉�윭 諛쒖깮 : ' + err.stack);

                    res.writeHead('200', {
                        'Content-Type': 'text/html;charset=utf8'
                    });
                    res.write('<h2>寃뚯떆�뙋 �뙎湲� 異붽? 以� �뿉�윭 諛쒖깮</h2>');
                    res.write('<p>' + err.stack + '</p>');
                    res.end();

                    return;
                }

                console.log("성공인건가 글씨가 깨져서 잘은 모르겠지만 성공같습니당~!@");
                console.log('댓글저장성공 : ' + paramId);
                console.log("여기?")
                return res.sendStatus(200);
                //return res.redirect('/process/showpost/' + paramId);
            });

    } else {
        res.writeHead('200', {
            'Content-Type': 'text/html;charset=utf8'
        });
        res.write('<h2>�뜲�씠�꽣踰좎씠�뒪 �뿰寃� �떎�뙣</h2>');
        res.end();
    }

};
module.exports.listpost = listpost;
module.exports.addpost = addpost;
module.exports.showpost = showpost;
module.exports.addpost = addpost;
module.exports.addcomment = addcomment;
