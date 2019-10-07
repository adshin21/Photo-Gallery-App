const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");

const User = require("../models/User");
const Album = require("../models/Album");
const Photo = require("../models/Photos");
const auth = require("../middleware/auth");

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

            User.create({
                username: username,
                password: hash
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

router.delete("/:username", auth, async (req, res, next) => {
    // console.log(req.userData._id);
    const albums = await Album.find({creator: mongoose.Types.ObjectId(req.userData._id)});

    console.log(albums);
    /*
    let number_of_albums = 0;

    for(let i in albums){
        const album = await Album.findOne({_id: albums[i]._id});
        for(let j in album.photos){
            Photos.findByIdAndRemove({_id: mongoose.Types.ObjectId(album.photos[j])}, (err) => {
                if(err){
                    return res.status(404).json({
                        message: "Problem in removing the images",
                        err
                    });
                }
            });
        }

        Album.findByIdAndRemove({_id: album[i]._id}, (err) => {
            if(err){
                return res.status(404).json({
                    message: "Problem in removing the album",
                    err
                });
            }
            number_of_albums++;
        });
    }

    if(number_of_albums === albums.length && number_of_albums){
        User.findByIdAndRemove({_id: mongoose.Types.ObjectId(req.userData._id)}, (err) => {
            if(err){
                return res.status(404).json({
                    message: "Cannot remove User, Please try again",
                    err
                });
            }
            else{   
                res.status(200).json({
                    message: "The User removed successfully"
                });
                next();
            }
        });
    }
    else{
        return res.status(404).json({
            message: "User not removed"
        });
    }
    */
});


module.exports = router;