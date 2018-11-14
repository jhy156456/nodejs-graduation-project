var Schema = {};




Schema.createSchema = function (mongoose) {
    var roomSchema = mongoose.Schema({

        title: {
            type: String,
            required: true,
        },
        max: {
            type: Number,
            required: true,
            default: 10,
            min: 2,
        },
        participant: {
            type: String,
            default: ''
        },
        owner: {
            type: String,
            required: true,
        },
        participant_count: {
            type: Number,
            default: 0
        },
        participant_is_exit: {
            type: Boolean,
            default: false
        },
        owner_is_exit: {
            type: Boolean,
            default: false
        },
        last_chat_contents: {
            type: String,
            default: ''
        },
        participant_member_icon_file_name: {
            type: String,
            default: ''
        },
        owner_member_icon_file_name: {
            type: String,
            default: ''
        },
        password: String,
        createdAt: {
            type: Date,
            default: Date.now,
        },
    });

    roomSchema.static('findById', function (id, start_page, LOADING_SIZE, callback) {
        return this.find({
            room: id
        }).sort({
            "createdAt": -1
        }).skip(start_page).limit(LOADING_SIZE).lean().exec(callback);
    });

    roomSchema.static('findByuserNickName', function (userNickName, start_page, LOADING_SIZE, callback) {
        return this.find({
            $or: [{
                owner: userNickName
            }, {
                participant: userNickName
            }]
        }).sort({
            "createdAt": -1
        }).skip(start_page).limit(LOADING_SIZE).lean().exec(callback);
    });
    return roomSchema;
}
module.exports = Schema;
