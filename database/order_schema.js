/**
 * 게시판을 위한 데이터베이스 스키마를 정의하는 모듈
 *
 * @date 2016-11-10
 * @author Mike
 */

var utils = require('../utils/utils');

var SchemaObj = {};

SchemaObj.createSchema = function (mongoose) {

    // 글 스키마 정의
    var orderSchema = mongoose.Schema({
        buyerid: {
            type: Number,
            default :0
        },
        sellerid: {
            type: Number,
            default :0
        },
        productid: {
            type: Number,
            default :0
        },
        buyer_phone: {
            type: String,
            default: ''
        },
        seller_nickname: {
            type: String,
            default: ''
        },
        buyer_nickname: {
            type: String,
            default: ''
        },
        pay_method: {
            type: String,
            default: ''
        },
        buy_method: {
            type: String,
            default: ''
        },
        
        deposit_name: {

        },
        deposit_date: {
            type: Date,
            index: {
                unique: false
            },
            'default': Date.now
        },
        contents: {
            type: String,
            trim: true,
            'default': ''
        }, // 글 내용

        created_at: {
            type: Date,
            index: {
                unique: false
            },
            'default': Date.now
        },
        updated_at: {
            type: Date,
            index: {
                unique: false
            },
            'default': Date.now
        }
    });

    // 필수 속성에 대한 'required' validation
    //orderSchema.path('title').required(true, '글 제목을 입력하셔야 합니다.');
    //orderSchema.path('contents').required(true, '글 내용을 입력하셔야 합니다.');

    // 스키마에 인스턴스 메소드 추가
    orderSchema.methods = {
        savePost: function (callback) { // 글 저장
            var self = this;

            this.validate(function (err) {
                if (err) return callback(err);

                self.save(callback);
            });
        },
        addComment: function (user, comment, callback) { // 댓글 추가
            this.comment.push({
                contents: comment.contents,
                writer: user._id
            });

            this.save(callback);
        },
        removeComment: function (id, callback) { // 댓글 삭제
            var index = utils.indexOf(this.comments, {
                id: id
            });
            if (~index) {
                this.comments.splice(index, 1);
            } else {
                return callback('ID [' + id + '] 를 가진 댓글 객체를 찾을 수 없습니다.');
            }

            this.save(callback);
        }
    }

    orderSchema.statics = {
        // ID로 글 찾기
        load: function (id, callback) {
            this.findOne({
                    _id: id
                })
                .populate('writer', 'name provider email')
                .exec(callback);
        },
        list: function (options, callback) {
            var criteria = options.criteria || {};

            this.find(criteria)
                .populate('writer', 'name provider email')
                .sort({
                    'created_at': -1
                })
                .limit(Number(options.LOADING_SIZE))
                .skip(options.start_page)
                .exec(callback);
        }
    }

    console.log('orderSchema 정의함.');

    return orderSchema;
};

// module.exports에 orderSchema 객체 직접 할당
module.exports = SchemaObj;
