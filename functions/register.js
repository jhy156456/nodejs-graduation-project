'use strict';


const bcrypt = require('bcryptjs');

exports.registerUser = (database, name, email, password, sextype, birthday, nickName,userType) =>

    new Promise((resolve, reject) => {
        const salt = bcrypt.genSaltSync(10);
        const hash = bcrypt.hashSync(password, salt);
        const newUser = new database.UserModel({
            sextype: sextype,
            birthday: birthday,
            name: name,
            email: email,
            nickname: nickName,
            hashed_password: hash,
            user_type:userType,
            created_at: new Date()
        });
        newUser.save()
            .then(() => resolve({
                status: 201,
                message: '회원가입완료'
            }))
            .catch(err => {
                if (err.code == 11000) {
                    reject({
                        status: 409,
                        message: '이메일이 존재합니다'
                    });
                } else {
                    reject({
                        status: 500,
                        message: 'Internal Server Error !'
                    });
                }
            });
    });

exports.checkNickName = (database, nickName) =>
    new Promise((resolve, reject) => {
        database.UserModel.find({
                nickname: nickName
            })
            .then(users => {
                if (users.length == 0) {
                    resolve({
                        status: 201,
                        message: '사용가능합니다'
                    });
                } else {
                    reject({
                        status: 409,
                        message: '사용불가능'
                    });
                }
            })
            .catch(err => {
                reject({
                    status: 500,
                    message: 'Internal Server Error!'
                });
            })
    });


/*
            .then(() => resolve({
                status: 201,
                message: '사용가능합니다!'
            }))
            .catch(err => {
                if (errcode == 11000) {
                    reject({
                        status: 409,
                        message: '사용불가능'
                    });
                } else {
                    reject({
                        status: 500,
                        message: 'Internal Server Error!'
                    });
                }
            });
    });
    */
