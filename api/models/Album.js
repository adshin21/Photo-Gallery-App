const mongoose = require("mongoose");

const AlbumSchema = mongoose.Schema({
    _id: {
        type: Number,
        required: true,
        unique: true
    },
    album_name: {
        type: String,
        required: true
    },
    private: {
        type: Boolean,
        default: false
    },
    cover_photo: {
        type: String,
        required: true
    },
    creator: {
        type: Number,
        required: true,
    },
    photos: {
        type: Array
    },
    date: {
        type: Date,
        default: new Date()
    },
    likes: {
        type: Array,
    }
});

module.exports = mongoose.model("Album", AlbumSchema);