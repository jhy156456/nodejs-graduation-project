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
        chat: String,
        gif: String,
        createdAt: {
            type: Date,
            default: Date.now,
        },
    });
    
    return chatSchema
}

module.exports = Schema;


