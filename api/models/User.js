const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
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