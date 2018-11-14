var express = require('express');
var formidable = require('formidable');
var router = express.Router();
var async = require('async');
//keep/list
var keep_list = function(req, res, next) { //router.get('/list', function(req, res, next) {
    var member_seq = req.query.member_seq;
    console.log("조회하려는 멤버seq : " +req.query.member_seq);
    var user_latitude = req.query.user_latitude;
    var user_longitude = req.query.user_longitude;
    var database = req.app.get('database');
    if (!member_seq) {
        return res.sendStatus(400);
    }

    var tasks = [
        function(callback) {
            database.SoftwareKeepModel.findByreg_date(member_seq,function(err, results) { //keep등록순 정렬
                if (err) {
                    console.error('맛집정보 반환 중 오류 발생 :' + err.stack);
                    callback(err, null);
                    res.end();
                    return;
                }
                console.log("추출한 keep : " + JSON.stringify(results));
                callback(null, results);
            });
        },
        function(data, callback) {
            var count = 0;
            if (data.length == 0) {
                console.log("2번째 콜백함수")
                callback(null, data)
                return //return을 안해주면 밑으로 내려감            
            }

            data.forEach((item, index) => { //같은원리 아닌가? for로 하면 안되는이유는??
                database.SoftwareInfoImageModel.findByseq(item.info_seq, function(err, result) {
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
        function(data, callback) {
            if (data.length == 0) {
                console.log("3번째 콜백함수")
                callback(null, data)
                return
            }
            var ctr = 0;
            var keepIndex = 0;
            var myKeep = [];
            if (data.length > 0) {
                data.forEach((item, index) => {
                    //정렬된 keep의 info_Seq와 info의 seq와 같은값 추출
                    database.SoftwareInfoModel.findByInfoseq(item.info_seq, function(err, result) {
                        if (err) {
                            console.error('이미지정보 반환 중 오류 발생 :' + err.stack);
                            res.end();
                            return;
                        }
                        if (result.length > 0) {
                            //console.log("result.length : "  +result.length)
                            //console.log("member_seq : " + member_seq)
                            //console.log("result[0].member_seq : " + result[0].member_seq);
                            if (parseInt(member_seq) == parseInt(item.member_seq)) {
                                data[index].is_keep = 'true';
                                myKeep[keepIndex] = Object.assign(data[index], result[0]);
                                keepIndex++;
                            }
                        }
                        ctr++;
                        if (ctr == data.length) { // 가져온 info값들의 즐겨찾기 유무조사후 빠져나오기위한 함수
                            callback(null, myKeep);
                        }
                    });
                });
            }
            else { //keep컬렉션에 아무것도 없을경우.. 그럴리는 없을 것 같당!
                callback(null, myKeep);
            }
        },
        function(endresults, callback) {
            console.log("여기옴?")
            res.status(200).json(endresults);

            res.end();
            callback(null);
        }
    ];
    async.waterfall(tasks, function(err) {
        if (err)
            console.log('err');
        else
            console.log('done');
    });

}

//keep/:member_seq/:info_seq
var keep_info_seq_post = function(req, res, next) { //router.post('/:member_seq/:info_seq', function(req, res, next) {
    var member_seq = req.params.member_seq;
    var info_seq = req.params.info_seq;
    var database = req.app.get('database');
    if (!member_seq || !info_seq) {
        return res.sendStatus(400);
    }
    if (database.db) {
        //이미 즐겨찾기가 되어있는지 조사하기
        database.SoftwareKeepModel.find({
            "member_seq": member_seq,
            "info_seq": info_seq
        }, function(err, result) {
            if (err) {
                console.error('검색 중 에러 발생 : ' + err.stack);
                console.log('검색 중  에러 발생');
                console.log('<p>' + err.stack + '</p>');
                res.end();
                return;
            }
            if (result.length > 0) {
                console.log('이미 즐겨찾기가 존재함');
                return res.sendStatus(400);
            }
            else {
                var keep = new database.SoftwareKeepModel({
                    member_seq: member_seq,
                    info_seq: info_seq
                });

                // save()로 저장
                keep.save(function(err) {
                    if (err) {
                        callback(err, null);
                        return;
                    }

                });

                //update실행 , update안에 function을 붙여야 되더라;;
                console.log("info_seq 값 : " + info_seq);
                var newkeep_cnt;
                database.SoftwareInfoModel.find({
                    seq: info_seq
                }, function(err, results) {
                    if (err) {
                        callback(err, null);
                        return;
                    }
                    if (results.length > 0) {
                        newkeep_cnt = results[0].keep_cnt + 1;
                        database.SoftwareInfoModel.update({
                            seq: info_seq
                        }, {
                            $set: {
                                keep_cnt: newkeep_cnt
                            }
                        }, function(err) {
                            if (err) {
                                callback(err, null);
                                return;
                            }
                        });
                    }
                    res.end();
                });
                console.log("즐겨찾기 데이터 추가함");
                res.sendStatus(200);
            }
        });
    }
    else {
        console.log('데이터베이스 연결 실패');
        res.end();
    }

    ////////////////////////////////////////////////////////////////////////////////////////////////////

}

//keep/:member_seq/:info_seq
var keep_info_seq_delete = function(req, res, next) { //router.delete('/:member_seq/:info_seq', function(req, res, next) {

    var member_seq = req.params.member_seq;
    var info_seq = req.params.info_seq;
    var database = req.app.get('database');

    if (!member_seq || !info_seq) {
        return res.sendStatus(400);
    }
    //keep모델 삭제 실행
    database.SoftwareKeepModel.remove({
        info_seq: info_seq,
        member_seq: member_seq
    }, function(err) {
        if (err) {
            callback(err, null);
            return;
        }
    });
    //keep_cnt값 1감소
    database.SoftwareInfoModel.find({
        seq: info_seq
    }, function(err, results) {
        if (err) {
            callback(err, null);
            return;
        }
        if (results.length > 0) {
            newkeep_cnt = results[0].keep_cnt - 1;
            database.SoftwareInfoModel.update({
                seq: info_seq
            }, {
                $set: {
                    keep_cnt: newkeep_cnt
                }
            }, function(err) {
                if (err) {
                    callback(err, null);
                    return;
                }
            });
        }
        res.end();
    });
    console.log("즐겨찾기 데이터 추가함");
    res.sendStatus(200);
}

module.exports.keep_list = keep_list;
module.exports.keep_info_seq_post = keep_info_seq_post;
module.exports.keep_info_seq_delete = keep_info_seq_delete;
