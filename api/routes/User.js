const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");

const Users = require("../models/User");
const Albums = require("../models/Album");
const Photos = require("../models/Photos");
const auth = require("../middleware/auth");

router.post("/signup", async(req, res, next) => {
    const username = req.body.username;
    const password = req.body.password;

    let user = await Users.findOne({ username: username });

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

            Users.create({
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

    let user = await Users.find({ username: username });

    if (user.length < 1)
        return res.status(404).json({
            message: "User Not Found"
        });

    bcrypt.compare(password, user[0].password, (err, result) => {
        if (err) {
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
    
    const removeAlbumPhotos = async (album,image) => {
        return new Promise((resolve,reject)=>{
            Photos.findByIdAndRemove({_id: mongoose.Types.ObjectId(album.photos[image])}, (err) => {
                if(err){
                    return resolve({
                        status: false,
                        message: "The photo is not removed",
                        err
                    });   
                }else{
                    return resolve({
                        status: true,
                        message: 'Album photos removed',
                        err: null,
                    });
                }
            });
        });
    }

    const removeAlbum = async (album) => {
        return new Promise((resolve,reject) => {
            Albums.findByIdAndRemove({_id: album._id}, (err) => {
                if(err){
                    return resolve({
                        status: false,
                        message: "The album is not removed",
                        err
                    });
                }
                else{
                    return resolve({
                        status: true,
                        message: "The album has been removed",
                        err: null
                    });
                }
            });
        });
    }

    const albums = await Albums.find({creator: mongoose.Types.ObjectId(req.userData._id)});

    let number_of_albums = 0;

    for(let i in albums){
        const album = await Albums.findOne({_id: albums[i]._id});
        for(let j in album.photos){
            let result = await removeAlbumPhotos(album,j);

            if(!result.status){
                return res.status(404).json({
                   err: result.err,
                   message: result.msg
                });
            }
        }

        let result = await removeAlbum(album);

        if(result.status){
            number_of_albums++;
        }
        else{
            return res.status(404).json({
                err: result.err,
                message: result.msg
            });
        }
    }

    if(number_of_albums === albums.length && number_of_albums){
        Users.findByIdAndRemove({_id: mongoose.Types.ObjectId(req.userData._id)}, (err) => {
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
});


module.exports = router;