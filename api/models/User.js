const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
    _id: {
        type: Number,
        required: true
    },
    username: {
        type: String,
        required: true,
        unique: true
    },
    email: {
        type: String,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    albums: {
        type: Array,

    }
});

module.exports = mongoose.model("User", UserSchema);