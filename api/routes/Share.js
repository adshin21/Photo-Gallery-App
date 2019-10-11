const express = require("express");
const router = express.Router();

const mongoose = require("mongoose");

const auth = require("../middleware/auth");

const Albums = require("../models/Album");
const Photos = require("../models/Photos")
const User = require("../models/User");
const Shares = require("../models/Share");


router.get("/sent", auth, async(req, res, next) => {
    const data = await Shares.find({ sender: req.userData._id }).sort({ _id: -1 });
    res.status(200).json({
        message: "These are the sent files",
        data
    });
    next();
});


router.get("/received", auth, async(req, res, next) => {
    const data = await Shares.find({ receiver: req.userData._id }).sort({ _id: -1 });
    res.status(200).json({
        message: "These are the data received by you",
        data
    });
    next();
});


router.post("/album/:albumId", auth, async(req, res, next) => {

    const album = await Albums.findById({ _id: req.params.albumId });

    console.log(req.body);
    if (album.creator != req.userData._id) {
        return res.status(404).json({
            message: "This album does not belong to you"
        });
    }


    const already = await Shares.findOne({ sender: mongoose.Types.ObjectId(req.userData._id), receiver: mongoose.Types.ObjectId(req.body.receiver), album: req.params.albumId });

    if (already) {
        return res.status(404).json({
            message: "The album had been already shared with this user"
        });
    }

    Shares.create({
        sender: mongoose.Types.ObjectId(req.userData._id),
        receiver: mongoose.Types.ObjectId(req.body.receiver),
        album: req.params.albumId
    }, (err, data) => {
        if (err) {
            return res.status(404).json({
                message: "There is some problem in sharing",
                err
            });
        } else {
            res.status(200).json({
                message: "Woooo! The album has been shared",
            })
            next();
        }
    });
});


router.post("/image/:imageId", auth, async(req, res, next) => {

    const Photo = await Photos.findById({ _id: mongoose.Types.ObjectId(req.params.imageId) });
    const Album = await Albums.findById({ _id: mongoose.Types.ObjectId(Photo.album_Id) });

    if (Album.creator != req.userData._id) {
        return res.status(404).json({
            message: "The album does not belongs to you"
        });
    }

    const already = await Shares.findOne({ sender: mongoose.Types.ObjectId(req.userData._id), receiver: mongoose.Types.ObjectId(req.params.receiver), image: req.params.imageId });

    if (already) {
        return res.status(404).json({
            message: "The image had been already shared with this user"
        });
    }

    Shares.create({
        sender: mongoose.Types.ObjectId(req.userData._id),
        receiver: mongoose.Types.ObjectId(req.params.receiver),
        image: req.params.imageId
    }, (err, data) => {
        if (err) {
            return res.status(404).json({
                message: "There is some problem in sharing the image",
                err
            });
        } else {
            res.status(200).json({
                message: "Wooo! The image has been shared"
            })
            next();
        }
    });
});



module.exports = router;