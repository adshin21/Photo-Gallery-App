const mongoose = require("mongoose");

const PhotoSchema = mongoose.Schema({
    id:{
        type: Number,
        required: true,
        unique: true
    },
    album_id: {
        type: Number,
        required: true
    },
    image_name: {
        type: String,
    },
    destination: {
        type: String,
    },
    likes: {
        type: Array
    },
    time: {
        type: Date,
        default: new Date()
    }
});

module.exports = mongoose.model("Photo", PhotoSchema);