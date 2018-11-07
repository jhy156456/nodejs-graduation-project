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
            password: String,
            createdAt: {
                type: Date,
                default: Date.now,
            },
        });

        roomSchema.static('findByuserNickName', function (userNickName,start_page,LOADING_SIZE ,callback) {
            return this.find({
                $or: [{
                    owner: userNickName
            }, {
                    participant: userNickName
            }]
            }).sort({
                "createdAt":-1
            }).skip(start_page).limit(LOADING_SIZE).lean().exec(callback);
        });
    return roomSchema;
}
module.exports = Schema;
