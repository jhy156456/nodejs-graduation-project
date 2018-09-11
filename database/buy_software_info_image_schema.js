var crypto = require('crypto');

var Schema = {};

Schema.createSchema = function (mongoose) {

    // 스키마 정의

    var SoftwareInfoImageSchema = mongoose.Schema({
        seq : {
            type: Number,
            default : 0
        },
        info_seq: {
            type: Number,
            default: 0
        },
        filename: {
            type: String,
            default: ''
        },
        image_memo: {
            type: String,
            default: ''
        },
        reg_date: {
            type: Date,
            default: Date.now
        }

    });

    // 모델 객체에서 사용할 수 있는 메소드 정의

    SoftwareInfoImageSchema.static('findByseq', function (seq, callback) {
        return this.find({
            info_seq: seq
        }).lean().exec(callback);
    });

    SoftwareInfoImageSchema.static('findAll', function (callback) {
        return this.find({}).lean().exec(callback);
    });

    console.log('UserSchema 정의함.');

    return SoftwareInfoImageSchema;
};

// module.exports에 UserSchema 객체 직접 할당
module.exports = Schema;
