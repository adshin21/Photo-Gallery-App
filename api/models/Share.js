const mongoose = require("mongoose");

const ShareSchema = mongoose.Schema({
    receiver: {
        type: mongoose.Types.ObjectId,
        required: true
    },
    sender: {
        type: mongoose.Types.ObjectId,
        required: true
    },
    album: {
        type: String
    },
    image: {
        type: String
    },
    time: {
        type: Date,
        default: new Date()
    }
});

module.exports = mongoose.model("Share", ShareSchema)