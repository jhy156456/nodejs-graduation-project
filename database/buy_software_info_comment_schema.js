var crypto = require('crypto');

var Schema = {};

Schema.createSchema = function (mongoose) {

    // 스키마 정의

    var SoftwareInfoCommentSchema = mongoose.Schema({
        seq: {
            type: Number,
            default: 0
        },

        cmt_num: Number, //댓글 정렬위한 필드

        post_id: { //게시물 테이블의 primary key(등록글의 seq를 넣으면 될듯)
            type: Number,
            default: 0
        },
        brd_id: { //게시판 테이블의 primary key(등록글 분류의 seq를 넣으면 될듯)
            type: Number,
            default: 0
        },
        
        cmt_reply: String, //답변 댓글 여부
        cmt_secret: Number,
        cmt_content: { //댓글내용
            type: String,
            default: ""
        },
        cmt_useremail: {
            type: String,
            default: ""
        },
        cmt_usernickname: {
            type: String,
            default: ""
        },
        cmt_userseq: {
            type: Number,
            default: 0
        },
        info_seq: {
            type: Number,
            default: 0
        },
        cmt_like: {
            type: Number,
            default: 0
        },
        cmt_dislike: {
            type: Number,
            default: 0
        },
        cmt_blame: {
            type: Number,
            default: 0
        },
        cmt_del: {
            type: Number
            default: 0
        },
        reg_date: {
            type: Date,
            default: Date.now
        }

    });

    // 모델 객체에서 사용할 수 있는 메소드 정의

    SoftwareInfoCommentSchema.static('findByseq', function (seq, callback) {
        return this.find({
            info_seq: seq
        }).lean().exec(callback);
    });

    SoftwareInfoCommentSchema.static('findAll', function (callback) {
        return this.find({}).lean().exec(callback);
    });

    console.log('UserSchema 정의함.');

    return SoftwareInfoCommentSchema;
};

// module.exports에 UserSchema 객체 직접 할당
module.exports = Schema;
