var express = require('express');
var formidable = require('formidable');
var async = require('async');
var router = express.Router();
var LOADING_SIZE = 20;

var searchPost = function (req, res, next) {
    var searchKeyWord = req.body.searchKeyWord;

    var database = req.app.get('database');
    if (database.db) {
        var tasks = [
function (callback) {
                database.SoftwareInfoModel.findBySearchKeyWord(searchKeyWord, start_page, LOADING_SIZE, post_category, function (err, results) {
                    if (err) {
                        console.error('맛집정보 반환 중 오류 발생 :' + err.stack);
                        callback(err, null);
                        res.end();
                        return;
                    }
                    if (results.length == 0)
                        return callback("값에러")
                    callback(null, results);
                });
                },
function (data, callback) {
                var count = 0;
                console.log("data.length : " + data.length)
                data.forEach((item, index) => { //같은원리 아닌가? for로 하면 안되는이유는??
                    database.SoftwareInfoImageModel.findByseq(item.seq, function (err, result) {
                        if (err) {
                            console.error('이미지정보 반환 중 오류 발생 :' + err.stack);
                            res.end();
                            return;
                        }
                        if (data.length == 0)
                            return callback("값없음")
                        if (result.length > 0) {
                            result.sort(function (a, b) {
                                //사진이 데이터베이스에 0,1,2순서로 저장되지않으므로 정렬해줌
                                return a.filename < b.filename ? -1 : a.filename > b.filename ? 1 : 0;
                            })
                            data[index].image_filename = result[0].filename;
                        }
                        count++;
                        if (count == data.length) {
                            callback(null, data)
                        }
                    });
                });
},
function (data, callback) {
                var ctr = 0;
                data.forEach((item, index) => {
                    database.SoftwareKeepModel.findByseqfromInfoseq(item.seq, function (err, result) {
                        if (err) {
                            console.error('이미지정보 반환 중 오류 발생 :' + err.stack);
                            res.end();
                            return;
                        }
                        if (result.length > 0) {
                            if (parseInt(member_seq) == parseInt(result[0].member_seq) && result.length != 0) {
                                data[index].is_keep = 'true';
                            } else {
                                data[index].is_keep = 'false';
                            }
                        } else { //즐겨찾기한게 없으면 안들어오기떄문에 false값을 줄 수 없어서 주기위해 여기에도 추가해야함
                            data[index].is_keep = 'false';
                        }
                        ctr++;
                        if (ctr == data.length) callback(null, data) // 가져온 info값들의 즐겨찾기 유무조사후 빠져나오기위한 함수
                    })
                });
                    },
function (endresults, callback) {
                // console.log("값 : " + JSON.stringify(endresults));
                res.status(200).json(endresults);
                res.end();
                callback(null);
                    }
        ];
        async.waterfall(tasks, function (err) {
            if (err)
                console.log('err');
            else
                console.log('done');
        });
    } else {
        console.log("데이터베이스 오픈 오류");
        res.end();
    }
}


//등록된 게시글 닉네임 클릭 후 프로필보기
/*
내가 (로그인한상태) 상대방프로필보기누르면 상대방이 즐겨찾기한내용들도 같이 추가가됩니다
이건어떻게해야할까요?


*/

var postedList = function (req, res, next) {
    var member_seq = req.query.member_seq;
    var current_page = req.query.current_page || 0;
    var mySeq = req.query.my_seq;
    console.log("current_page : " + current_page)
    console.log("보고자 하는 프로필의 seq : " + member_seq)
    var start_page = current_page * LOADING_SIZE;
    if (!member_seq) {
        return res.sendStatus(400);
    }
    var database = req.app.get('database');
    console.log("게시글 정렬 호출됨");
    if (database.db) {
        var tasks = [
function (callback) {
                database.SoftwareInfoModel.findBySeqandReg_date(member_seq, start_page, LOADING_SIZE, function (err, results) {
                    if (err) {
                        console.error('맛집정보 반환 중 오류 발생 :' + err.stack);
                        callback(err, null);
                        res.end();
                        return;
                    }
                    if (results.length == 0)
                        return callback("값에러")
                    callback(null, results);
                });
                },
function (data, callback) {
                var count = 0;
                console.log("data.length : " + data.length)
                data.forEach((item, index) => { //같은원리 아닌가? for로 하면 안되는이유는??
                    database.SoftwareInfoImageModel.findByseq(item.seq, function (err, result) {
                        if (err) {
                            console.error('이미지정보 반환 중 오류 발생 :' + err.stack);
                            res.end();
                            return;
                        }
                        if (data.length == 0)
                            return callback("값없음")
                        if (result.length > 0) {
                            data[index].image_filename = result[0].filename;
                        }
                        count++;
                        if (count == data.length) {
                            callback(null, data)
                        }
                    });
                });
},
function (data, callback) {
                var ctr = 0;
                data.forEach((item, index) => {
                    database.SoftwareKeepModel.findByseqfromInfoseq(item.seq, function (err, result) {
                        if (err) {
                            console.error('이미지정보 반환 중 오류 발생 :' + err.stack);
                            res.end();
                            return;
                        }
                        if (result.length > 0) {
                            if (parseInt(mySeq) == parseInt(result[0].member_seq) && result.length != 0) {
                                data[index].is_keep = 'true';
                            } else {
                                data[index].is_keep = 'false';
                            }
                        } else { //즐겨찾기한게 없으면 안들어오기떄문에 false값을 줄 수 없어서 주기위해 여기에도 추가해야함
                            data[index].is_keep = 'false';
                        }
                        ctr++;
                        if (ctr == data.length) callback(null, data) // 가져온 info값들의 즐겨찾기 유무조사후 빠져나오기위한 함수
                    })
                });
                    },
function (endresults, callback) {
              //  console.log("postedList값 : " + JSON.stringify(endresults));
                res.status(200).json(endresults);
                res.end();
                callback(null);
                    }
        ];
        async.waterfall(tasks, function (err) {
            if (err)
                console.log('err');
            else
                console.log('done');
        });
    }
}

//food/info
var info = function (req, res, next) { //info
    if (!req.body.member_seq) {
        return res.sendStatus(400);
    }
    var member_seq = req.body.member_seq;
    var post_member_icon_filename = req.body.post_member_icon_filename;
    var name = req.body.name;
    var tel = req.body.tel;
    var post_nickname = req.body.post_nickname;
    var description = req.body.description;
    var os = req.body.os;
    var post_category = req.body.post_category;
    var database = req.app.get('database');
    var postTag = req.body.post_tag;

    console.log("포스트태그값 : " + postTag);
    if (database.db) {
        addfoodinfo(database, post_member_icon_filename, member_seq, name, tel, description, post_nickname, os, post_category, postTag, function (err, result) {
            if (err) {
                console.error('맛집정보 저장 중 에러 발생 : ' + err.stack);
                console.log('<h2>맛집정보 저장 중 에러 발생</h2>');
                console.log('<p>' + err.stack + '</p>');
                res.end();
                return;
            }

            if (result) {
                console.log('데이터 저장 성공 : ' + result.seq);
                res.status(200).send('' + result.seq); //이걸보내야 이미지 저장할 수 있는 액티비티로 넘어간다.
                res.end();

            } else {
                console.log('맛집정보 저장  실패');
                res.end();
            }
        });
    } else {
        console.log('<h2>데이터베이스 연결 실패</h2>');
        res.end();
    }

};


//food/info/image
var info_image = function (req, res) { //info/image'
    console.log('food/info/image 호출됨.');
    var form = new formidable.IncomingForm();

    form.on('fileBegin', function (name, file) {
        file.path = './public/img/' + file.name;
    });
    var database = req.app.get('database');
    form.parse(req, function (err, fields, files) {
        if (database.db) {
            addfoodinfoimage(database, fields.info_seq, files.file.name, fields.image_memo, function (err, result) {
                if (err) {
                    console.error('이미지정보 저장 중 에러 발생 : ' + err.stack);
                    console.log('<h2>이미지정보 저장 중 에러 발생</h2>');
                    console.log('<p>' + err.stack + '</p>');
                    res.end();
                    return;
                }

                if (result) {
                    console.log('이미지정보 저장 성공');
                    res.status(200).send('' + result.name);
                    res.end();

                } else {
                    console.log('<h2>맛집정보 저장  실패</h2>');
                    res.end();
                }
            });
        } else {
            console.log('<h2>데이터베이스 연결 실패</h2>');
            res.end();
        }
    });
}

//food/info/:seq
var info_seq = function (req, res, next) { //info/:seq
    var seq = parseInt(req.params.seq);
    var member_seq = parseInt(req.query.member_seq);
    var database = req.app.get('database');
    if (database.db) {
        var tasks = [
            function (callback) {
                database.SoftwareInfoModel.findByseq(seq, function (err, results) {
                    if (err) {
                        console.error('회원정보 반환 중 오류 발생 :' + err.stack);
                        callback(err, null);
                        res.end();
                        return;
                    }
                    if (results.length == 0) return callback("값없음")


                    database.SoftwareInfoModel.incrHits(results[0]._id, function (err2, results2) {
                        console.log('incrHits executed.');

                        if (err2) {
                            console.log('incrHits 에러');
                            console.dir(err2);
                            return;
                        }

                    });
                    callback(null, results); //info내용1개 반환하는듯
                })
            },
//이 info에서 추출한거와 같은 이미지가 있는지 조사한다 같은 이미지가 2개라면 코드가 바뀔것같다..
            function (data, callback) {
                database.SoftwareInfoImageModel.findByseq(data[0].seq, function (err, result) {
                    if (err) {
                        console.error('이미지정보 반환 중 오류 발생 :' + err.stack);
                        res.end();
                        return;
                    }
                    if (result.length > 0) {
                        //console.log("불러온 이미지값" + JSON.stringify(result));
                        data[0].image_filename = result[0].filename; //첫화면을 위함,리스트의 첫화면
                        data[0].total_image_filename = result; //총 개수를 위함. 이미지여러개
                        data[0].total_image_filename.sort(function (a, b) { //사진이 데이터베이스에 0,1,2순서로 저장되지않으므로 정렬해줌
                            return a.filename < b.filename ? -1 : a.filename > b.filename ? 1 : 0;
                        })
                        callback(null, data);
                    } else callback(null, data);
                });
},
            //위 info에서 추출한 내용을 기준으로 keep모델에서 keep에등록되어있는게 있는지 확인하고 그 keep에 등록되어있는게
            //나의 member_seq와 같은지 확인한다. 같다면 궈궈!
            function (data, callback) {
                database.SoftwareKeepModel.findByseqfromInfoseq(data[0].seq, function (err, result) {
                    if (err) {
                        console.error('이미지정보 반환 중 오류 발생 :' + err.stack);
                        res.end();
                        return;
                    }
                    if (result.length > 0) {
                        if (parseInt(member_seq) == parseInt(result[0].member_seq) && result.length != 0) {
                            data[0].is_keep = 'true';
                        } else {
                            data[0].is_keep = 'false';
                        }
                        callback(null, data);
                    } else { //즐겨찾기한게 없으면 안들어오기떄문에 false값을 줄 수 없어서 주기위해 여기에도 추가해야함
                        data[0].is_keep = 'false';
                        callback(null, data);
                    }
                })
                //???????????????콜백이 여기들어가면 윗윗줄의 data[0].is_keep을 실행하기도전에 endresults를 하고 지랄 ㅡㅡ 
                //그래서 위에 이프엘스에 각각넣어줌 ㅡㅡ 개짜증남정말 ㅡㅡ
                    },
            function (endresults, callback) {
                //console.log("인포값 : " + JSON.stringify(endresults[0]));
                res.json(endresults[0]);
                callback(null);
                    }
        ];
        async.waterfall(tasks, function (err) {
            if (err)
                console.log('err');
            else
                console.log('done');
        });
    } else { // 데이터베이스 객체가 초기화되지 않은 경우 실패 응답 전송
        res.end();
        console.log('<h2>데이터베이스 연결 실패</h2>');
    }
}

var addcomment = function (req, res) {
    console.log('addcomment 호출됨');

    var paramId = req.body.postId || req.query.postId;
    var paramContents = req.body.contents || req.query.contents;
    var paramWriter = req.body.writer || req.query.writer;
    var paramcommentWriterIconFileName = req.body.comment_writer_icon_filename || req.query.comment_writer_icon_filename;

    //console.log("넣으려는 값 : " + JSON.stringify(req.body));
    var database = req.app.get('database');

    if (database.db) {

        database.SoftwareInfoModel.findByIdAndUpdate(paramId, {
                '$push': {
                    'comments': {
                        'contents': paramContents,
                        'writer': paramWriter,
                        'comment_writer_icon_filename': paramcommentWriterIconFileName
                    }
                }
            }, {
                new: true,
                upsert: true
            },
            function (err, results) {
                if (err) {
                    console.error('에러내용 : ' + err.stack);
                    res.end();

                    return;
                }
                //console.log("댓글 : " + results.comments);
                console.log("댓글 아이디값 : " + results.comments[results.comments.length - 1]._id);
                return res.status(200).send('' + results.comments[results.comments.length - 1]._id);
            });

    } else {
        res.writeHead('200', {
            'Content-Type': 'text/html;charset=utf8'
        });
        res.write('<h2>�뜲�씠�꽣踰좎씠�뒪 �뿰寃� �떎�뙣</h2>');
        res.end();
    }

};

var list = function (req, res, next) { //list', function(req, res, next) {

    var member_seq = req.query.member_seq;
    var searchKeyWord = req.query.key_word;
    var order_type = req.query.order_type;
    var current_page = req.query.current_page || 0;
    var start_page = current_page * LOADING_SIZE;
    var post_category = req.query.post_category;
    var image_filename = '';
    if (!member_seq) {
        return res.sendStatus(400);
    }
    console.log("FoodList currnet_page : " + req.query.current_page);
    console.log("FoodList start_page : " + start_page);
    var database = req.app.get('database');
    if (order_type == 'reg_date') {
        console.log("등록순 정렬 호출 됨");
        if (database.db) {
            var tasks = [
function (callback) {
                    database.SoftwareInfoModel.findByreg_date(searchKeyWord, start_page, LOADING_SIZE, post_category, function (err, results) {
                        if (err) {
                            console.error('맛집정보 반환 중 오류 발생 :' + err.stack);
                            callback(err, null);
                            res.end();
                            return;
                        }
                        if (results.length == 0)
                            return callback("값에러")
                        callback(null, results);
                    });
                },
function (data, callback) {
                    var count = 0;
                    data.forEach((item, index) => { //같은원리 아닌가? for로 하면 안되는이유는??
                        database.SoftwareInfoImageModel.findByseq(item.seq, function (err, result) {
                            if (err) {
                                console.error('이미지정보 반환 중 오류 발생 :' + err.stack);
                                res.end();
                                return;
                            }
                            if (data.length == 0)
                                return callback("값없음")
                            if (result.length > 0) {
                                result.sort(function (a, b) {
                                    //사진이 데이터베이스에 0,1,2순서로 저장되지않으므로 정렬해줌
                                    return a.filename < b.filename ? -1 : a.filename > b.filename ? 1 : 0;
                                })
                                data[index].image_filename = result[0].filename;
                            }
                            count++;
                            if (count == data.length) {
                                callback(null, data)
                            }
                        });
                    });
},
function (data, callback) {
                    var ctr = 0;
                    data.forEach((item, index) => {
                        database.SoftwareKeepModel.findByseqfromInfoseq(item.seq, function (err, result) {
                            if (err) {
                                console.error('이미지정보 반환 중 오류 발생 :' + err.stack);
                                res.end();
                                return;
                            }
                            if (result.length > 0) {
                                if (parseInt(member_seq) == parseInt(result[0].member_seq) && result.length != 0) {
                                    data[index].is_keep = 'true';
                                } else {
                                    data[index].is_keep = 'false';
                                }
                            } else { //즐겨찾기한게 없으면 안들어오기떄문에 false값을 줄 수 없어서 주기위해 여기에도 추가해야함
                                data[index].is_keep = 'false';
                            }
                            ctr++;
                            if (ctr == data.length) callback(null, data) // 가져온 info값들의 즐겨찾기 유무조사후 빠져나오기위한 함수
                        })
                    });
                    },
function (endresults, callback) {
                    // console.log("값 : " + JSON.stringify(endresults));
                    res.status(200).json(endresults);
                    res.end();
                    callback(null);
                    }
        ];
            async.waterfall(tasks, function (err) {
                if (err)
                    console.log('err');
                else
                    console.log('done');
            });
        }
    } else if (order_type == 'keep_cnt') { //즐겨찾기정렬
        console.log("즐겨찾기 정렬 호출 됨");
        if (database.db) {
            var tasks = [
function (callback) {
                    database.SoftwareInfoModel.findBykeep_cnt(searchKeyWord, start_page, LOADING_SIZE, post_category, function (err, results) {
                        if (err) {
                            console.error('맛집정보 반환 중 오류 발생 :' + err.stack);
                            callback(err, null);
                            res.end();
                            return;
                        }
                        if (results.length == 0)
                            return callback("값에러")
                        callback(null, results);
                    });
                },
function (data, callback) {
                    var count = 0;
                    data.forEach((item, index) => { //같은원리 아닌가? for로 하면 안되는이유는??
                        database.SoftwareInfoImageModel.findByseq(item.seq, function (err, result) {
                            if (err) {
                                console.error('이미지정보 반환 중 오류 발생 :' + err.stack);
                                res.end();
                                return;
                            }
                            if (data.length == 0)
                                return callback("값없음")
                            if (result.length > 0) {
                                result.sort(function (a, b) {
                                    //사진이 데이터베이스에 0,1,2순서로 저장되지않으므로 정렬해줌
                                    return a.filename < b.filename ? -1 : a.filename > b.filename ? 1 : 0;
                                })
                                data[index].image_filename = result[0].filename;
                            }
                            count++;
                            if (count == data.length) {
                                callback(null, data)
                            }
                        });
                    });
},
function (data, callback) {
                    var ctr = 0;
                    data.forEach((item, index) => {
                        database.SoftwareKeepModel.findByseqfromInfoseq(item.seq, function (err, result) {
                            if (err) {
                                console.error('이미지정보 반환 중 오류 발생 :' + err.stack);
                                res.end();
                                return;
                            }
                            if (result.length > 0) {
                                if (parseInt(member_seq) == parseInt(result[0].member_seq) && result.length != 0) {
                                    data[index].is_keep = 'true';
                                } else {
                                    data[index].is_keep = 'false';
                                }
                            } else { //즐겨찾기한게 없으면 안들어오기떄문에 false값을 줄 수 없어서 주기위해 여기에도 추가해야함
                                data[index].is_keep = 'false';
                            }
                            ctr++;
                            if (ctr == data.length) callback(null, data) // 가져온 info값들의 즐겨찾기 유무조사후 빠져나오기위한 함수
                        })
                    });
                    },
function (endresults, callback) {
                    //console.log("값 : " + JSON.stringify(endresults));
                    res.status(200).json(endresults);
                    res.end();
                    callback(null);
                    }
        ];
            async.waterfall(tasks, function (err) {
                if (err)
                    console.log('err');
                else
                    console.log('done');
            });
        }
    } else if (order_type == 'hits_cnt') {
        console.log("조회순 정렬 호출 됨2");
        if (database.db) {
            var tasks = [
function (callback) {
                    database.SoftwareInfoModel.findByhits_cnt(searchKeyWord, start_page, LOADING_SIZE, post_category, function (err, results) {
                        if (err) {
                            console.error('맛집정보 반환 중 오류 발생 :' + err.stack);
                            callback(err, null);
                            res.end();
                            return;
                        }
                        if (results.length == 0)
                            return callback("값에러")
                        callback(null, results);
                    });
                },
function (data, callback) {
                    var count = 0;
                    data.forEach((item, index) => { //같은원리 아닌가? for로 하면 안되는이유는??
                        database.SoftwareInfoImageModel.findByseq(item.seq, function (err, result) {
                            if (err) {
                                console.error('이미지정보 반환 중 오류 발생 :' + err.stack);
                                res.end();
                                return;
                            }
                            if (data.length == 0)
                                return callback("값없음")
                            if (result.length > 0) {
                                result.sort(function (a, b) {
                                    //사진이 데이터베이스에 0,1,2순서로 저장되지않으므로 정렬해줌
                                    return a.filename < b.filename ? -1 : a.filename > b.filename ? 1 : 0;
                                })
                                data[index].image_filename = result[0].filename;
                            }
                            count++;
                            if (count == data.length) {
                                callback(null, data)
                            }
                        });
                    });
},
function (data, callback) {
                    var ctr = 0;
                    data.forEach((item, index) => {
                        database.SoftwareKeepModel.findByseqfromInfoseq(item.seq, function (err, result) {
                            if (err) {
                                console.error('이미지정보 반환 중 오류 발생 :' + err.stack);
                                res.end();
                                return;
                            }
                            if (result.length > 0) {
                                if (parseInt(member_seq) == parseInt(result[0].member_seq) && result.length != 0) {
                                    data[index].is_keep = 'true';
                                } else {
                                    data[index].is_keep = 'false';
                                }
                            } else { //즐겨찾기한게 없으면 안들어오기떄문에 false값을 줄 수 없어서 주기위해 여기에도 추가해야함
                                data[index].is_keep = 'false';
                            }
                            ctr++;
                            if (ctr == data.length) callback(null, data) // 가져온 info값들의 즐겨찾기 유무조사후 빠져나오기위한 함수
                        })
                    });
                    },
function (endresults, callback) {
                    // console.log("값2 : " + JSON.stringify(endresults));
                    res.status(200).json(endresults);
                    res.end();
                    callback(null);
                    }
        ];
            async.waterfall(tasks, function (err) {
                if (err) {
                    res.sendStatus(400);
                    console.log('err');
                } else
                    console.log('done');
            });
        }
    }
}


//////////////////////////////////////////////////내부함수/////////////////////////////////////////////
var addfoodinfo = function (database, post_member_icon_filename, member_seq, name, tel, description, post_nickname, os, post_category, postTag, callback) {
    console.log('addinfo 호출됨.');

    var info = new database.SoftwareInfoModel({
        post_member_icon_filename: post_member_icon_filename,
        member_seq: member_seq,
        name: name,
        tel: tel,
        os: os,
        post_nickname: post_nickname,
        description: description,
        post_category: post_category,
        post_tag: postTag
    });

    // save()로 저장
    info.save(function (err) {
        if (err) {
            callback(err, null);
            return;
        }

        console.log("데이터 추가함.");
        callback(null, info);

    });
}
//addfoodinfoimage(database, fields.info_seq,files.file.name,fields.image_memo
var addfoodinfoimage = function (database, info_seq, name, image_memo, callback) {
    console.log('addinfoimage 호출됨.');

    var infoImage = new database.SoftwareInfoImageModel({
        info_seq: info_seq,
        filename: name,
        image_memo: image_memo
    });

    // save()로 저장
    infoImage.save(function (err) {
        if (err) {
            callback(err, null);
            return;
        }

        console.log("이미지 데이터 추가함.");
        callback(null, info);

    });
}

var listwithTag = function (req, res, next) { //list', function(req, res, next) {

    var member_seq = req.query.member_seq;
    var searchKeyWord = req.query.key_word;
    var order_type = req.query.order_type;
    var current_page = req.query.current_page || 0;
    var start_page = current_page * LOADING_SIZE;
    var post_category = req.query.post_category;
    var postTag = req.query.post_tag;
    console.log("태그값 : " + postTag);
    var image_filename = '';
    if (!member_seq) {
        return res.sendStatus(400);
    }
    console.log("FoodList currnet_page : " + req.query.current_page);
    console.log("FoodList start_page : " + start_page);
    var database = req.app.get('database');
    if (order_type == 'reg_date') {
        console.log("등록순 정렬 호출 됨");
        if (database.db) {
            var tasks = [
function (callback) {
                    database.SoftwareInfoModel.findByreg_datewithTag(postTag, searchKeyWord, start_page, LOADING_SIZE, post_category, function (err, results) {
                        if (err) {
                            console.error('맛집정보 반환 중 오류 발생 :' + err.stack);
                            callback(err, null);
                            res.end();
                            return;
                        }
                        if (results.length == 0)
                            return callback("값에러")
                        callback(null, results);
                    });
                },
function (data, callback) {
                    var count = 0;
                    data.forEach((item, index) => { //같은원리 아닌가? for로 하면 안되는이유는??
                        database.SoftwareInfoImageModel.findByseq(item.seq, function (err, result) {
                            if (err) {
                                console.error('이미지정보 반환 중 오류 발생 :' + err.stack);
                                res.end();
                                return;
                            }
                            if (data.length == 0)
                                return callback("값없음")
                            if (result.length > 0) {
                                result.sort(function (a, b) {
                                    //사진이 데이터베이스에 0,1,2순서로 저장되지않으므로 정렬해줌
                                    return a.filename < b.filename ? -1 : a.filename > b.filename ? 1 : 0;
                                })
                                data[index].image_filename = result[0].filename;
                            }
                            count++;
                            if (count == data.length) {
                                callback(null, data)
                            }
                        });
                    });
},
function (data, callback) {
                    var ctr = 0;
                    data.forEach((item, index) => {
                        database.SoftwareKeepModel.findByseqfromInfoseq(item.seq, function (err, result) {
                            if (err) {
                                console.error('이미지정보 반환 중 오류 발생 :' + err.stack);
                                res.end();
                                return;
                            }
                            if (result.length > 0) {
                                if (parseInt(member_seq) == parseInt(result[0].member_seq) && result.length != 0) {
                                    data[index].is_keep = 'true';
                                } else {
                                    data[index].is_keep = 'false';
                                }
                            } else { //즐겨찾기한게 없으면 안들어오기떄문에 false값을 줄 수 없어서 주기위해 여기에도 추가해야함
                                data[index].is_keep = 'false';
                            }
                            ctr++;
                            if (ctr == data.length) callback(null, data) // 가져온 info값들의 즐겨찾기 유무조사후 빠져나오기위한 함수
                        })
                    });
                    },
function (endresults, callback) {
                    // console.log("값 : " + JSON.stringify(endresults));
                    res.status(200).json(endresults);
                    res.end();
                    callback(null);
                    }
        ];
            async.waterfall(tasks, function (err) {
                if (err)
                    console.log('err');
                else
                    console.log('done');
            });
        }
    } else if (order_type == 'keep_cnt') { //즐겨찾기정렬
        console.log("즐겨찾기 정렬 호출 됨");
        if (database.db) {
            var tasks = [
function (callback) {
                    database.SoftwareInfoModel.findBykeep_cnt(start_page, LOADING_SIZE, post_category, function (err, results) {
                        if (err) {
                            console.error('맛집정보 반환 중 오류 발생 :' + err.stack);
                            callback(err, null);
                            res.end();
                            return;
                        }
                        if (results.length == 0)
                            return callback("값에러")
                        callback(null, results);
                    });
                },
function (data, callback) {
                    var count = 0;
                    data.forEach((item, index) => { //같은원리 아닌가? for로 하면 안되는이유는??
                        database.SoftwareInfoImageModel.findByseq(item.seq, function (err, result) {
                            if (err) {
                                console.error('이미지정보 반환 중 오류 발생 :' + err.stack);
                                res.end();
                                return;
                            }
                            if (data.length == 0)
                                return callback("값없음")
                            if (result.length > 0) {
                                result.sort(function (a, b) {
                                    //사진이 데이터베이스에 0,1,2순서로 저장되지않으므로 정렬해줌
                                    return a.filename < b.filename ? -1 : a.filename > b.filename ? 1 : 0;
                                })
                                data[index].image_filename = result[0].filename;
                            }
                            count++;
                            if (count == data.length) {
                                callback(null, data)
                            }
                        });
                    });
},
function (data, callback) {
                    var ctr = 0;
                    data.forEach((item, index) => {
                        database.SoftwareKeepModel.findByseqfromInfoseq(item.seq, function (err, result) {
                            if (err) {
                                console.error('이미지정보 반환 중 오류 발생 :' + err.stack);
                                res.end();
                                return;
                            }
                            if (result.length > 0) {
                                if (parseInt(member_seq) == parseInt(result[0].member_seq) && result.length != 0) {
                                    data[index].is_keep = 'true';
                                } else {
                                    data[index].is_keep = 'false';
                                }
                            } else { //즐겨찾기한게 없으면 안들어오기떄문에 false값을 줄 수 없어서 주기위해 여기에도 추가해야함
                                data[index].is_keep = 'false';
                            }
                            ctr++;
                            if (ctr == data.length) callback(null, data) // 가져온 info값들의 즐겨찾기 유무조사후 빠져나오기위한 함수
                        })
                    });
                    },
function (endresults, callback) {
                    //console.log("값 : " + JSON.stringify(endresults));
                    res.status(200).json(endresults);
                    res.end();
                    callback(null);
                    }
        ];
            async.waterfall(tasks, function (err) {
                if (err)
                    console.log('err');
                else
                    console.log('done');
            });
        }
    } else if (order_type == 'hits_cnt') {
        console.log("조회순 정렬 호출 됨2");
        if (database.db) {
            var tasks = [
function (callback) {
                    database.SoftwareInfoModel.findByhits_cnt(start_page, LOADING_SIZE, post_category, function (err, results) {
                        if (err) {
                            console.error('맛집정보 반환 중 오류 발생 :' + err.stack);
                            callback(err, null);
                            res.end();
                            return;
                        }
                        if (results.length == 0)
                            return callback("값에러")
                        callback(null, results);
                    });
                },
function (data, callback) {
                    var count = 0;
                    data.forEach((item, index) => { //같은원리 아닌가? for로 하면 안되는이유는??
                        database.SoftwareInfoImageModel.findByseq(item.seq, function (err, result) {
                            if (err) {
                                console.error('이미지정보 반환 중 오류 발생 :' + err.stack);
                                res.end();
                                return;
                            }
                            if (data.length == 0)
                                return callback("값없음")
                            if (result.length > 0) {
                                result.sort(function (a, b) {
                                    //사진이 데이터베이스에 0,1,2순서로 저장되지않으므로 정렬해줌
                                    return a.filename < b.filename ? -1 : a.filename > b.filename ? 1 : 0;
                                })
                                data[index].image_filename = result[0].filename;
                            }
                            count++;
                            if (count == data.length) {
                                callback(null, data)
                            }
                        });
                    });
},
function (data, callback) {
                    var ctr = 0;
                    data.forEach((item, index) => {
                        database.SoftwareKeepModel.findByseqfromInfoseq(item.seq, function (err, result) {
                            if (err) {
                                console.error('이미지정보 반환 중 오류 발생 :' + err.stack);
                                res.end();
                                return;
                            }
                            if (result.length > 0) {
                                if (parseInt(member_seq) == parseInt(result[0].member_seq) && result.length != 0) {
                                    data[index].is_keep = 'true';
                                } else {
                                    data[index].is_keep = 'false';
                                }
                            } else { //즐겨찾기한게 없으면 안들어오기떄문에 false값을 줄 수 없어서 주기위해 여기에도 추가해야함
                                data[index].is_keep = 'false';
                            }
                            ctr++;
                            if (ctr == data.length) callback(null, data) // 가져온 info값들의 즐겨찾기 유무조사후 빠져나오기위한 함수
                        })
                    });
                    },
function (endresults, callback) {
                    // console.log("값2 : " + JSON.stringify(endresults));
                    res.status(200).json(endresults);
                    res.end();
                    callback(null);
                    }
        ];
            async.waterfall(tasks, function (err) {
                if (err) {
                    res.sendStatus(400);
                    console.log('err');
                } else
                    console.log('done');
            });
        }
    }
}

var listOrder = function (req, res, next) { //list', function(req, res, next) {

    var member_nick_name = req.query.member_nick_name;
    var current_page = req.query.current_page || 0;
    var start_page = current_page * LOADING_SIZE;
    var image_filename = '';
    var database = req.app.get('database');

    if (database.db) {
        // 1. 글 리스트
        var options = {
            buyer_nickname: member_nick_name,
            start_page: start_page,
            LOADING_SIZE: LOADING_SIZE
        }
        database.OrderModel.list(options, function (err, results) {
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
                console.log("주문사항 값:" + JSON.stringify(results))
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


}

var removeInfo = function (req, res) {
    console.log('removeInfo 호출됨');
    /*댓글 등록은 게시판이 나눠져있는데 삭제는 post.js에 같이해놓음
    bestfoodinfo: 1008, notification: 1004*/
    var from = req.body.from || req.query.from || req.params.from;
    var postId = req.body.post_id || req.query.post_id || req.params.post_id;
    console.log("포스트아이디 : " + postId);
    var database = req.app.get('database');
    if (database.db) {

        if (from == 1004) {
              database.PostModel.remove({
                    _id: postId
                },
                function (err, results) {
                    if (err) {
                        console.log("게시글 삭제 실패");
                        console.error('에러내용 : ' + err.stack);
                        res.end();
                        return;
                    }
                    if (results) {

                        console.log("post 게시글 삭제 성공")
                        res.status(200).send('성공')
                        res.end();
                    } else {
                        console.log("해당아이디로 등록된 게시글 없음")
                    }
                    //return res.redirect('/process/showpost/' + paramId);
                });
        } else if (from == 1002) {
            database.SoftwareInfoModel.remove({
                    _id: postId
                },
                function (err, results) {
                    if (err) {
                        console.log("게시글 삭제 실패");
                        console.error('에러내용 : ' + err.stack);
                        res.end();
                        return;
                    }
                    if (results) {

                        console.log("software 게시글 삭제 성공")
                        /*
                        call<String>일경우에 .send를하지않고 res.status(200).end()를하게되면 
                        안드로이드에서 if (response.isSuccessful()) { 이 if문으로 들어가지않는다 ㅠㅠ
                        */
                        res.status(200).send('성공') 
                        res.end();
                    } else {
                        console.log("해당아이디로 등록된 게시글 없음")
                    }
                    //return res.redirect('/process/showpost/' + paramId);
                });
        }
    } else {
        console.log("데이터베이스 오류");
        res.end();
    }



}


module.exports.removeInfo = removeInfo;
module.exports.listOrder = listOrder;
module.exports.listwithTag = listwithTag;
module.exports.postedList = postedList;
module.exports.info = info;
module.exports.info_image = info_image;
module.exports.info_seq = info_seq;
module.exports.list = list;
module.exports.addcomment = addcomment;
