/**
 * 데이터베이스 스키마를 정의하는 모듈
 *
 * @date 2016-11-10
 * @author Mike
 */

var crypto = require('crypto');
var Schema = {};

Schema.createSchema = function (mongoose) {

    // 스키마 정의
    var bestfood_memberschema = mongoose.Schema({
        phone: {
            type: String,
            default: '',
        },
        name: {
            type: String,
            default: ''
        },
        sextype: {
            type: String,
            default: ''
        },
        birthday: {
            type: String,
            default: ''
        },
        member_icon_filename: {
            type: String,
            default: ''
        },
        reg_date: {
            type: Date,
            default: Date.now
        }

    });



    // 모델 객체에서 사용할 수 있는 메소드 정의
    bestfood_memberschema.static('findByPhone', function (phone, callback) {
        return this.find({
            phone: phone
        }).lean().exec(callback);
    });
    bestfood_memberschema.static('findByMail', function (email, callback) {
        return this.find({
            email: email
        }).lean().exec(callback);
    });
    bestfood_memberschema.static('findAll', function (callback) {
        return this.find({}).lean().exec(callback);
    });

    console.log('bestfood_memberschema 정의함.');

    return bestfood_memberschema;
};

// module.exports에 UserSchema 객체 직접 할당
module.exports = Schema;
