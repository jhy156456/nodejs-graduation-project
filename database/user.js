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
            unique: true
        },
        phone: {
            type: String,
            default: ''
        },
        nickname: {
            type: String,
            default: ''
        },
        user_type: {
            type: String,
            default: ''
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
        reg_date: {
            type: Date,
            default: Date.now
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
    UserSchema.static('findByMail', function (email, callback) {
        return this.find({
            email: email
        }).lean().exec(callback);
    });
    UserSchema.static('findAll', function (callback) {
        return this.find({}).lean().exec(callback);
    });
    UserSchema.static('findSupporters', function (start_page, LOADING_SIZE, callback) {
        return this.find({
            user_type: "Supporters"
        }).limit(LOADING_SIZE).skip(start_page).lean().exec(callback);
    })
    return UserSchema;
}
module.exports = Schema;
