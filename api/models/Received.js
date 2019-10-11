const mongoose = require("mongoose");

const ReceivedSchema = mongoose.Schema({
    receiver: {
        type: mongoose.Types.ObjectId,
        required: true
    },
    sender: {
        type: mongoose.Types.ObjectId,
        required: true
    },
    albums: {
        type: Array
    },
    images: {
        type: Array
    },
    time: {
        type: Date,
        default: new Date()
    }
});


module.exports = mongoose.model("Received", ReceivedSchema);