var Schema = {};

Schema.createSchema = function (mongoose) {

    // 스키마 정의

    var SoftwareInfoSchema = mongoose.Schema({
        member_seq: Number,
        seq: {
            type: Number,
            default: 0
        },
        name: {
            type: String,
            default: ''
        },
        post_nickname: { //작성자 닉네임
            type: String,
            default: ""
        },
        os: {
            type: String,
            default: ''
        },
        tel: {
            type: String,
            default: ''
        },
        description: {
            type: String,
            default: ''
        },
        keep_cnt: { //즐겨찾기 정렬위함
            type: Number,
            'default': 0
        },
        post_device: { //게시글 등록한 디바이스
            type: String,
            default: ""
        },
        post_num: { //게시글 정렬위함,안드로이드:1,디비:2등등..
            type: Number,
            default: 0
        },
        post_cagegory: { //카테고리 존재시 카테고리 테이블의 연관키? ->구매:1 판매:2 서포터즈:3 공모전:4 커뮤니티:5
            type: Number,
            default: 0
        },
        post_updated_datetime: {
            type: Date
        },
        post_reply: { // 답변 여부
            type: String,
            default: ""
        },
        post_comment_count: { //댓글정렬위함
            type: Number,
            default: 0
        },
        post_comment_updated_datetime: {
            type: Date
        },
        post_hit: { //조회수
            type: Number,
            default: 0
        },
        post_like: {
            type: Number,
            default: 0
        },
        post_dislike: {
            type: Number,
            default: 0
        },
        post_blame: { // 신고된 횟수
            type: Number,
            default: 0
        },
        post_del: {
            type: Number,
            default: 0
        },
        post_image_number: {
            type: Number,
            default: 0
        },
        reg_date: { //댓글정렬위함
            type: Date,
            default: Date.now
        },
        post_member_icon_filename: {
            type :String,
            default: ""
        }
    });

    SoftwareInfoSchema.index({
        geometry: '2dsphere'
    });


    //등록순 정렬
    SoftwareInfoSchema.static('findBySeqandReg_date', function (seq, start_page, LOADING_SIZE, callback) {
        return this.find({
            member_seq: seq
        }).sort({
            "reg_date": -1
        }).skip(start_page).limit(LOADING_SIZE).lean().exec(callback);

    });
    // 스키마에 static 메소드 추가
    // 모든 커피숍 조회
    SoftwareInfoSchema.static('findAll', function (callback) {
        return this.find({}).lean().exec(callback);
    });
    SoftwareInfoSchema.static('findByseq', function (seq, callback) {
        return this.find({
            seq: seq
        }).lean().exec(callback);
    });
    // 등록순 정렬
    SoftwareInfoSchema.static('findByreg_date', function (start_page, LOADING_SIZE, callback) {
        console.log('SoftwareInfoSchema의 findByreg_date 호출됨.');
        return this.find({}).sort({
            "reg_date": -1
        }).skip(start_page).limit(LOADING_SIZE).lean().exec(callback);
    });

    // 즐겨찾기 정렬
    SoftwareInfoSchema.static('findBykeep_cnt', function (start_page, LOADING_SIZE, callback) {
        console.log('bestfood_info_schema의 findBykeep_cnt 호출됨.');
        return this.find({}).sort({
            "keep_cnt": -1
        }).skip(start_page).limit(LOADING_SIZE).lean().exec(callback);
    });


    SoftwareInfoSchema.static('findByInfoseq', function (i_seq, callback) {
        return this.find({
            seq: i_seq
        }).lean().exec(callback);
    });
    SoftwareInfoSchema.static('findBydistance', function (longitude, latitude, maxDistance, callback) {
        console.log('SoftwareInfoSchema의 findBydistance 호출됨.');

        this.find().where('geometry').near({
            center: {
                type: 'Point',
                coordinates: [parseFloat(longitude), parseFloat(latitude)]
            },
            maxDistance: maxDistance
        }).lean().exec(callback);
    });
    console.log('bestfood_info_schema 정의함.');

    return SoftwareInfoSchema;
};

// module.exports에 UserSchema 객체 직접 할당
module.exports = Schema;
