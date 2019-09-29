const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
    _id : {
        type: Number,
        required: true,
        unique: true
    },
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

    },
    time: {
        type: Date,
        default: new Date() 
    }
});

module.exports = mongoose.model("User", UserSchema);