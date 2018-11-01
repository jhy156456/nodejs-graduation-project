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


var getUser = function (req, res) {
    var seq = req.params.seq;
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

    if (!name || !email || !password || !name.trim() || !email.trim() || !password.trim()) {

        res.status(400).json({
            message: 'Invalid Request !'
        });

    } else {
        register.registerUser(database, name, email, password, sextype, birthday, nickName)
            .then(result => {
                res.setHeader('Location', '/users/' + email);
                res.status(result.status).json({
                    message: result.message
                })
            })
            .catch(err => res.status(err.status).json({
                message: err.message
            }));
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

module.exports.checkDuplicatedNickName=checkDuplicatedNickName;
module.exports.getUser = getUser;
module.exports.one = one;
module.exports.two = two;
module.exports.three = three;
module.exports.four = four;
module.exports.six = six;
module.exports.five = five;
