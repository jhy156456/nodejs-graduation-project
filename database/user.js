const mongoose = require('mongoose');


var Schema = {};
Schema.createSchema = function (mongoose) {
    var UserSchema = mongoose.Schema({
        seq: {
            type: Number,
            default: 0
        },
        name: {
            type: String,
            default: ''
        },
        email: {
            type: String,
            default: ''
        },
        phone: {
            type: String,
            default: ''
        },
        nickname: {
            type: String,
            default: '',
            unique: true
        },
        user_type: {
            type: String,
            default: ''
        },
        user_like: {
            type: Number,
            default: 0
        },
        one_line_description: {
            type: String,
            default: '한줄설명을 입력하세요'
        },
        hashed_password: String,
        created_at: String,
        temp_password: String,
        temp_password_time: String,
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
        registrationId: {
            type: String,
            'default': ''
        },
        reg_date: {
            type: Date,
            default: Date.now
        },
        is_kakao_user:{
            type:Boolean,
            default:false
        },
        kakao_id:{
            type:String,
            default:''
        }

    });
    UserSchema.static('findByEmail', function (post_nickname, callback) {
        return this.find({
            nickname: post_nickname
        }).lean().exec(callback);
    });
    UserSchema.static('findByPhone', function (phone, callback) {
        return this.find({
            phone: phone
        }).lean().exec(callback);
    });
    UserSchema.static('findBySeq', function (seq, callback) {
        return this.find({
            seq: seq
        }, {
            name: 1,
            nickname: 1,
            member_icon_filename: 1
        }).lean().exec(callback);
    });
    UserSchema.static('findByMail', function (email, callback) { //이거로 MyApp User값 셋팅
        return this.find({
            email: email
        }, {
            hashed_password: 0,
            registrationId: 0
        }).lean().exec(callback);
    });
    UserSchema.static('findAll', function (callback) {
        return this.find({}).lean().exec(callback);
    });
    UserSchema.static('findByNickName', function (nickName, callback) {
        return this.find({
            nickname: nickName
        }).lean().exec(callback);
    });
    UserSchema.static('findSupporters', function (myNickName, start_page, LOADING_SIZE, callback) {
        return this.find({
            user_type: "Supporters",
            nickname: {
                $ne: myNickName
            }
        }).limit(LOADING_SIZE).skip(start_page).lean().exec(callback);
    })
    return UserSchema;
}
module.exports = Schema;
