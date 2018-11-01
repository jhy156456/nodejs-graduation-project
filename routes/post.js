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
            //console.log("불러온 값" + JSON.stringify(results));
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

                return res.status(200).send('' + result.seq); //이걸보내야 이미지 저장할 수 있는 액티비티로 넘어간다.
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
            start_page: start_page,
            LOADING_SIZE: LOADING_SIZE
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
                        console.log('incrHits 에러');
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
var removeComment = function (req, res) {
    console.log('removeComment 호출됨');


    var commentId = req.body.commentId || req.query.commentId || req.params.commentId;
    var postId = req.body.postId || req.query.postId || req.params.postId;
    console.log("포스트아이디 : " + postId);
    console.log("코멘트아이디 : " + commentId)
    var database = req.app.get('database');
    if (database.db) {


        database.PostModel.findById(postId,
            function (err, results) {
                if (err) {
                    console.error('에러내용 : ' + err.stack);
                    res.end();
                    return;
                }
                if (results) {
                   // console.log("결과값 : " + JSON.stringify(results))
                    results.removeComment(commentId, function (err, results) {
                        if(err){
                            console.log("댓글 삭제 실패");
                            res.end();
                            return;
                        }
                        console.log("댓글 삭제 성공")
                        return res.status(200).end();
                    })
                }else{
                    console.log("해당아이디로 등록된 게시글 없음")
                }
                //return res.redirect('/process/showpost/' + paramId);
            });

    } else {
        console.log("데이터베이스 오류");
        res.end();
    }



}



var addcomment = function (req, res) {
    console.log('addcomment 호출됨');

    var paramId = req.body.postId || req.query.postId;
    var paramContents = req.body.contents || req.query.contents;
    var paramWriter = req.body.writer || req.query.writer;
     var paramcommentWriterIconFileName = req.body.writer_member_icon_filename || req.query.writer_member_icon_filename;
    console.log('넣을것 : ' + paramId + ', ' + paramContents + ', ' +
        paramWriter);

    var database = req.app.get('database');


    if (database.db) {


        database.PostModel.findByIdAndUpdate(paramId, {
                '$push': {
                    'comments': {
                        'contents': paramContents,
                        'writer': paramWriter,
                        'comment_writer_icon_filename':paramcommentWriterIconFileName
                    }
                }
            }, {
                new: true,
                upsert: true
            },
            function (err, results) {
                if (err) {
                    console.log("에러여기?")
                    console.error('에러내용 : ' + err.stack);

                    res.writeHead('200', {
                        'Content-Type': 'text/html;charset=utf8'
                    });
                    res.write('<h2>寃뚯떆�뙋 �뙎湲� 異붽? 以� �뿉�윭 諛쒖깮</h2>');
                    res.write('<p>' + err.stack + '</p>');
                    res.end();

                    return;
                }
                console.log("댓글 저장 성공");
                return res.status(200).send('' + results.comments[results.comments.length-1]._id);
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
module.exports.removeComment = removeComment;
