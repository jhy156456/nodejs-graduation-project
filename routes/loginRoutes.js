var express = require('express');
var formidable = require('formidable');
var router = express.Router();
const auth = require('basic-auth');
const jwt = require('jsonwebtoken');

const register = require('../functions/register');
const login = require('../functions/login');
const profile = require('../functions/profile');
const password = require('../functions/password');
const config = require('../config2/config.json');
var LOADING_SIZE = 20;

var getUser = function (req, res) {
    var seq = req.params.seq;
    var mySeq = req.query.seq;
    var database = req.app.get('database');
    if (database.db) {
        database.UserModel.findBySeq(seq, function (err, results) {
            if (err) {
                console.error('회원정보 반환 중 오류 발생 :' + err.stack);
                callback(err, null);
                res.end();
                return;
            }
            if (results.length > 0) {
                console.log("조회하려는 값 : " + JSON.stringify(results[0]));
                res.json(results[0]);
                res.end();
            } else {
                res.sendStatus(400);
                res.end();
            }
        });
    }
}

var one = function (req, res) {
    var database = req.app.get('database');
    res.end('Welcome JHY Server !');
}
var two = function (req, res) {
    var database = req.app.get('database');
    const credentials = auth(req);

    if (!credentials) {

        res.status(400).json({
            message: 'Invalid Request !'
        });

    } else {

        login.loginUser(database, credentials.name, credentials.pass)

            .then(result => {

                const token = jwt.sign(result, config.secret, {
                    expiresIn: 1440
                });

                res.status(result.status).json({
                    message: result.message,
                    token: token
                });

            })

            .catch(err => res.status(err.status).json({
                message: err.message
            }));
    }

}
var checkDuplicatedNickName = function (req, res) {
    console.log("낫파운드 어디? 0: " + nickName);
    var nickName = req.params.nickname;
    var database = req.app.get('database');
    console.log("낫파운드 어디? : " + nickName);
    register.checkNickName(database, nickName)
        .then(result => {
            //res.setHeader('Location', '/users/' + email);
            res.status(result.status).json({
                message: result.message
            })
        })
        .catch(err => res.status(err.status).json({
            message: err.message
        }));

}


var three = function (req, res) {
    var database = req.app.get('database');
    const name = req.body.name;
    const email = req.body.email;
    const password = req.body.password;
    var sextype = req.body.sextype;
    var nickName = req.body.nickname;
    var birthday = req.body.birthday;
    var member_type = req.body.user_type;
    var registrationId;

    if (!name || !email || !password || !name.trim() || !email.trim() || !password.trim()) {

        res.status(400).json({
            message: 'Invalid Request !'
        });

    } else {
        database.DeviceModel.findOne({ //findone은 [0]하지 않습니다^^
            mobile: req.body.phone
        }, function (err2, results2) {
            if (err2) {
                console.log('registrationId 추출 에러');
                console.dir(err2);
                return;
            }
            console.log("registrationId : " + results2.registrationId);
            registrationId = results2.registrationId;
            console.log('registrationId 추출 성공');
            register.registerUser(database, name, email, password, sextype, birthday, nickName, member_type, registrationId)
                .then(result => {
                    res.setHeader('Location', '/users/' + email);
                    res.status(result.status).json({
                        message: result.message
                    })
                })
                .catch(err => res.status(err.status).json({
                    message: err.message
                }));
        });


    }
}
var four = function (req, res) {
    var database = req.app.get('database');
    if (checkToken(req)) {

        profile.getProfile(database, req.params.id)

            .then(result => res.json(result))

            .catch(err => res.status(err.status).json({
                message: err.message
            }));

    } else {

        res.status(401).json({
            message: 'Invalid Token !'
        });
    }

}
var five = function (req, res) {
    var database = req.app.get('database');
    if (checkToken(req)) {

        const oldPassword = req.body.password;
        const newPassword = req.body.newPassword;

        if (!oldPassword || !newPassword || !oldPassword.trim() || !newPassword.trim()) {

            res.status(400).json({
                message: 'Invalid Request !'
            });

        } else {

            password.changePassword(database, req.params.id, oldPassword, newPassword)

                .then(result => res.status(result.status).json({
                    message: result.message
                }))

                .catch(err => res.status(err.status).json({
                    message: err.message
                }));

        }
    } else {

        res.status(401).json({
            message: 'Invalid Token !'
        });
    }

}
var six = function (req, res) {
    var database = req.app.get('database');
    const email = req.params.id;
    const token = req.body.token;
    const newPassword = req.body.password;

    if (!token || !newPassword || !token.trim() || !newPassword.trim()) {

        password.resetPasswordInit(database, email)

            .then(result => res.status(result.status).json({
                message: result.message
            }))

            .catch(err => res.status(err.status).json({
                message: err.message
            }));

    } else {

        password.resetPasswordFinish(database, email, token, newPassword)

            .then(result => res.status(result.status).json({
                message: result.message
            }))

            .catch(err => res.status(err.status).json({
                message: err.message
            }));
    }
}

function checkToken(req) {

    const token = req.headers['x-access-token'];

    if (token) {

        try {

            var decoded = jwt.verify(token, config.secret);

            return decoded.message === req.params.id;

        } catch (err) {

            return false;
        }

    } else {

        return false;
    }
}
var getSupporters = function (req, res) {
    console.log('getSupporters 호출됨.');
    var userType = req.params.user_type;
    var myNickName = req.query.my_nick_name;
    var current_page = req.query.current_page || 0;
    var start_page = current_page * LOADING_SIZE;
    console.log("유저타입 : " + userType);
    console.log("현제페이지 : " + current_page)
    var database = req.app.get('database');
    // 데이터베이스 객체가 초기화된 경우
    if (database.db) {
        // 1. 모든 단말 검색
        database.UserModel.findSupporters(myNickName, start_page, LOADING_SIZE, function (err, results) {
            if (err) {
                console.error('서포터즈 리스트 조회중 에러발생 : ' + err.stack);
                res.end();
                return;
            }
            //console.log("서포터즈들 : " +JSON.stringify(results));
            res.status(200).json(results);
            res.end();
        });
    } else {
        console.log("데이터베이스 연결 실패")
        res.end();
    }

};

var userLike = function (req, res) {
    console.log('userLike 호출됨.');
    var database = req.app.get('database');
    var paramNickName = req.body.nickname || req.query.nickname;
    console.log('요청 파라미터 : ' + paramMobile + ', ' + paramRegistrationId);

    // 데이터베이스 객체가 초기화된 경우
    if (database.db) {
        database.UserModel.findOneAndUpdate({
            nickname: paramNickName
        }, {
            $inc: {
                user_like: 1
            },
            participant_is_exit: true
        }, {
            upsert: true,
            'new': true,
            setDefaultsOnInsert: true
        }, function (err2, results2) {
            if (err2) {
                console.log('좋아요 증가 에러');
                console.dir(err2);
                return;
            }
            console.log('좋아요 감소 성공');
            res.end();
        });
    } else {
        console.log('데이터베이스 연결 실패');
        res.end();
    }
}
var userDisLike = function (req, res) {
    console.log('userDisLike 호출됨.');
    var database = req.app.get('database');
    var paramNickName = req.body.nickname || req.query.nickname;
    console.log('요청 파라미터 : ' + paramMobile + ', ' + paramRegistrationId);

    // 데이터베이스 객체가 초기화된 경우
    if (database.db) {
        database.UserModel.findOneAndUpdate({
            nickname: paramNickName
        }, {
            $inc: {
                user_like: -1
            },
            participant_is_exit: true
        }, {
            upsert: true,
            'new': true,
            setDefaultsOnInsert: true
        }, function (err2, results2) {
            if (err2) {
                console.log('좋아요 증가 에러');
                console.dir(err2);
                return;
            }
            console.log('좋아요 감소 성공');
            res.end();
        });
    } else {
        console.log('데이터베이스 연결 실패');
        res.end();
    }
}



var isPastKaKaoLogin = function (req, res) {

    console.log('isPastKaKaoLogin 호출됨.');
    var database = req.app.get('database');
    var paramEmail = req.params.email;
    var paramName = req.params.name;
    console.log("네임 : " + paramName);
    // 데이터베이스 객체가 초기화된 경우
    if (database.db) {
        database.UserModel.findOne({
            email: paramEmail,
            name: paramName
        }, function (err2, result) {
            if (err2) {
                console.log('카카오로그인 검색 에러');
                console.dir(err2);
                return;
            }
            //result값이 null이면 과거에 카카오로그인한적 없던것
            //result값이 null이 아니면 과거에 카카오로그인 한적이 있던것
            console.log("카카오로그인값 : " + JSON.stringify(result))
            res.status(200).send(result)
            res.end()

        });
    } else {
        console.log('데이터베이스 연결 실패');
        res.end();
    }


}

module.exports.isPastKaKaoLogin = isPastKaKaoLogin;
module.exports.userDisLike = userDisLike;
module.exports.userLike = userLike;
module.exports.getSupporters = getSupporters;
module.exports.checkDuplicatedNickName = checkDuplicatedNickName;
module.exports.getUser = getUser;
module.exports.one = one;
module.exports.two = two;
module.exports.three = three;
module.exports.four = four;
module.exports.six = six;
module.exports.five = five;
