const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

const User = require("../models/User");

let getNextVal = async(sequencename) => {

    let sequenceDocs = await User.findAndModify({
        query: { _id: sequencename },
        update: { $inc: { sequencevalue: 1 } }
    });

    return sequenceDocs.sequencevalue;
};

let cnt = 0;
router.post("/", async(req, res, next) => {
    const username = req.body.username;
    const password = req.body.password;
    let user = await User.findOne({ username: username });

    if (user) {
        return res.status(400).json({
            message: "User already exits"
        });
    }

    let enc = await bcrypt.hash(password, 10, async(err, hash) => {
        if (err) {
            return res.status(404).json({
                message: "Not Found"
            });
        } else {

            user = new User({
                username: username,
                password: hash,
                _id: getNextVal("user")
            });

            await user.save();
            return res.status(200).json({
                message: "User Successfully Created"
            });
        }
    });


    next();
});
module.exports = router;