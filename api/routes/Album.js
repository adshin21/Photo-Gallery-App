const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");

const auth = require("../middleware/auth");
const Album = require("../models/Album");
const User = require("../models/User");
const Photos = require("../models/Photos");

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        let new_path = "";
        console.log(req.originalUrl);
        if (req.originalUrl === "/album/create")
            new_path = path.resolve(__dirname, "..", "..", "public/cover-photo");
        else
            new_path = path.resolve(__dirname, "..", "..", "public/image");

        console.log(new_path);
        cb(null,new_path);
    },
    filename: (req, file, cb) => {
        cb(null, new Date().toISOString() + file.originalname);
    },

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
    },
    fileFilter: fileFilter
})


router.post("/create", auth, upload.single("cover-photo"), async(req, res, next) => {

    let album = await Album.findOne({ album_name: req.body.album_name, private: req.body.private });

    if (album) {
        return res.status(404).json({
            message: "Album name is already exists"
        });
    }

    let NumberofAlbums = await Album.findOne().sort({ id: -1 });

    if (NumberofAlbums === undefined || NumberofAlbums === null) {
        NumberofAlbums = 0;
    } else {
        NumberofAlbums = NumberofAlbums.id;
    }

    Album.create({
        id: NumberofAlbums + 1,
        album_name: req.body.album_name,
        private: req.body.private,
        cover_photo: req.file.path,
        creator: req.userData.id,
    }, (err, album) => {
        if (err) {
            return res.status(404).json({
                message: "There is some problem in creation of the album",
                err
            });
        } else {
            User.findOneAndUpdate({ id: req.userData.id }, {
                $push: {
                    "albums": NumberofAlbums + 1
                },
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

router.get("/:album_name", async(req, res, next) => {
    const data = await Album.find({ album_name: req.params.album_name }).sort({ id: -1 });
    if (data) {
        res.status(200).json({
            message: "This is working fine",
            data: data
        });
    } else {
        return res.status(404).json({
            message: "No album find with this name"
        });
    }
    next();
});


router.post("/:album_name/add", auth, upload.single("image"), async(req, res, next) => {

    let NumberofPhotos = await Photos.findOne().sort({id: -1});

    if(NumberofPhotos === undefined || NumberofPhotos === null)
        NumberofPhotos = 0
    else
        NumberofPhotos = NumberofPhotos.id;

    const album = await Album.findOne({album_name: req.params.album_name});
    const album_id = album.id;

    Photos.create({
        id: NumberofPhotos + 1,
        album_id: album_id,
        destination: req.file.destination,
    }, async (err, data) => {
        if(err){
            return res.status(404).json({
                message: "There is an issue in adding the photos"
            });
        }
        else{
            Album.findOneAndUpdate({id: album_id},{
                $push:{
                    "photos": NumberofPhotos + 1
                }
            }, (error, data) => {
                if(error){
                    return res.status(404).json({
                        message: "Oops there is an issue"
                    });
                }
                else{
                    res.status(200).json({
                        message: "Successfully Added the photo in the Album"
                    });
                    next();
                }
            });
        }
    });
});

module.exports = router;