const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const User = require("../models/User");


router.post("/signup", async(req, res, next) => {
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

            let NumberOfUsers = await User.findOne().sort({ _id: -1 });
            NumberOfUsers = NumberOfUsers._id;

            if (NumberOfUsers === undefined || NumberOfUsers === null)
                NumberOfUsers = 0

            User.create({
                username: username,
                password: hash,
                _id: NumberOfUsers + 1
            }, (errors, user) => {

                if (errors) {
                    return res.status(404).json({
                        message: "Error in user creation",
                        err: errors
                    })
                } else {
                    res.status(200).json({
                        message: "All Good and User has been created"
                    });

                    next();
                }
            });
        }
    });
});


router.post("/login", async(req, res, next) => {
    const username = req.body.username;
    const password = req.body.password;

    let user = await User.find({ username: username });

    if (user.length < 1)
        return res.status(404).json({
            message: "User Not Found"
        });

    bcrypt.compare(password, user[0].password, (err, result) => {
        if (err) {
            console.log(err);
            return res.status(404).json({
                message: "Wrong Credentials"
            });
        }

        if (result) {
            const token = jwt.sign({
                username: user[0].username,
                _id: user[0]._id
            }, process.env.JWT_KEY, {
                expiresIn: "2h"
            });

            return res.status(200).json({
                message: "User Logged in Succesfully",
                token: token
            });
        } else {
            return res.status(404).json({
                message: "Wrong Credentials"
            });
        }
    });
});
module.exports = router;