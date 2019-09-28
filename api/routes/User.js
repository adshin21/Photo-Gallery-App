const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

const User = require("../models/User");


let cnt = 0;
router.post("/", async(req, res, next) => {
    const username = req.body.username;
    const password = req.body.password;

    let user = await User.findOne({ username: username });

    if (user) {
        return res.status(400).json({
            message: "User already exits"
        });
        return;
    }
   
    let enc = await bcrypt.hash(password, 10, async(err, hash) => {
        if (err) {
            return res.status(404).json({
                message: "Not Found"
            });
        } else {

            User.create({
                username: username,
                password: hash
            }, (errors, user) => {

                if(errors){
                    return res.status(404).json({
                        message: "Error in user creation",
                        err: errors
                    })
                }
                else{
                    res.status(200).json({
                        message: "All Good and User has been created"
                    });

                    next();
                }
            });
        }
    });
});

module.exports = router;