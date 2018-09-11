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
    var SoftwareKeepSchema = mongoose.Schema({
        seq: Number,
        member_seq: Number,
        info_seq: Number,
        reg_date: {
            type: Date,
            default: Date.now
        }

    });


    // 모델 객체에서 사용할 수 있는 메소드 정의
    SoftwareKeepSchema.static('findByMemberseqandInfoseq', function (m_seq, i_seq, callback) {
        return this.find({
            member_seq: m_seq,
            info_seq: i_seq
        }).lean().exec(callback);
    });

    SoftwareKeepSchema.static('findByseq', function (seq, callback) {
        return this.find({
            member_seq: seq
        }).lean().exec(callback);
    });
    SoftwareKeepSchema.static('findByseqfromInfoseq', function (seq, callback) {
        return this.find({
            info_seq: seq
        }).lean().exec(callback);
    });
    SoftwareKeepSchema.static('findByreg_date', function (callback) {
        return this.find({}).sort({
            "reg_date": -1
        }).lean().exec(callback);
    });
    SoftwareKeepSchema.static('findAll', function (callback) {
        return this.find({}).lean().exec(callback);
    });

    console.log('SoftwareKeepSchema 정의함.');

    return SoftwareKeepSchema;
};

// module.exports에 UserSchema 객체 직접 할당
module.exports = Schema;
