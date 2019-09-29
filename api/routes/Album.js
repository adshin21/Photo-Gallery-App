const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");

const auth = require("../middleware/auth");
const Album = require("../models/Album");
const User = require("../models/User");


const storage = multer.diskStorage({
    destination: path.resolve(__dirname, "..", "..", "public/cover-photo"),
    filename: (req, file, cb) => {
        cb(null, new Date().toISOString() + file.originalname);
    }
});

const fileFilter = (req, file, cb) => {
    if (file.mimetype === "image/jpeg" || file.mimetype === "image/png" || file.mimetype === "image/jpg") {
        cb(null, true);
    } else {
        cb(null, false);
    }
}

const upload = multer({
    storage: storage,
    limits: {
        fileSize: 1024 * 1024 * 5 + 1
    }
})


router.post("/create", auth, upload.single("cover-photo"), async(req, res, next) => {

    let album = await Album.findOne({ album_name: req.body.album_name, private: req.body.private });

    if (album) {
        return res.status(404).json({
            message: "Album name is already exists"
        });
    }

    let NumberofAlbums = await Album.findOne().sort({ _id: -1 });

    if (NumberofAlbums === undefined || NumberofAlbums === null)
        NumberofAlbums = 0;
    else
        NumberofAlbums = NumberofAlbums._id;

    Album.create({
        _id: NumberofAlbums + 1,
        album_name: req.body.album_name,
        private: req.body.private,
        cover_photo: req.file.path,
        creator: req.userData._id,
    }, async(err, album) => {
        if (err) {
            return res.status(404).json({
                message: "There is some problem in creation of the album",
                err
            });
        } else {
            User.findOneAndUpdate({ _id: req.body.userData }, {
                $push: {
                    "albums": NumberofAlbums + 1
                },
            }, {
                safe: true,
                upsert: true
            }, (error, data) => {
                if (error) {
                    return res.status(404).json({
                        message: "The album is not added in the user table",
                        error: error
                    });
                } else {
                    res.status(200).json({
                        message: "Succesfully Added the Album"
                    });
                    next();
                }
            });
        }
    });
});

module.exports = router;