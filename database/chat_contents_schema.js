var Schema = {};

Schema.createSchema = function (mongoose) {
    var chatSchema = mongoose.Schema({
        room: {
            type: mongoose.Schema.ObjectId,
            required: true,
            ref: 'room'
        },
        sender: {
            type: String,
            required: true,
        },
        receiver: {
            type: String,
            required: true,
        },
        sender_id: {
            type: mongoose.Schema.ObjectId,
            ref: 'user'
        },
        receiver_id: {
            type: mongoose.Schema.ObjectId,
            ref: 'user'
        },
        chat: String,
        gif: String,
        createdAt: {
            type: Date,
            default: Date.now,
        },
    });
    chatSchema.static('list', function (roomId,start_page,LOADING_SIZE, callback) {
        return this.find({
            room: roomId
        }).populate('sender_id',{member_icon_filename:1}).populate('receiver_id',{member_icon_filename:1}).sort({
            "createdAt": -1
        }).skip(start_page).limit(LOADING_SIZE).lean().exec(callback);
    });
    return chatSchema
}

module.exports = Schema;
