const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const mongoose = require("mongoose");

const auth = require("../middleware/auth");
const Albums = require("../models/Album");
const Users = require("../models/User");
const Photos = require("../models/Photos");

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        let new_path = "";
        
        if (req.originalUrl === "/album/create")
            new_path = path.resolve(__dirname, "..", "..", "public/cover-photo");
        else
            new_path = path.resolve(__dirname, "..", "..", "public/image");

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

    let album = await Albums.findOne({ album_name: req.body.album_name, private: req.body.private });

    if (album) {
        return res.status(404).json({
            message: "Album name is already exists"
        });
    }
    
    Albums.create({
        album_name: req.body.album_name,
        private: req.body.private,
        cover_photo: req.file.path,
        creator: req.userData._id,
    }, (err, album) => {
        if (err) {
            return res.status(404).json({
                message: "There is some problem in creation of the album",
                err
            });
        } else {
            Users.findOneAndUpdate({ _id: req.userData._id }, {
                $push: {
                    "albums": album._id
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
    const data = await Albums.find({ album_name: req.params.album_name }).sort({ _id: -1 });
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

    const album = await Albums.findOne({album_name: req.params.album_name});
    
    Photos.create({
        album_id: album._id,
        destination: req.file.path,
    }, (err, data) => {
        if(err){
            return res.status(404).json({
                message: "There is an issue in adding the photos",
                err
            });
        }
        else{
            Albums.findOneAndUpdate({_id: album._id},{
                $push:{
                    "photos": data._id
                }
            }, (error, dataa) => {
                if(error){
                    return res.status(404).json({
                        message: "Oops there is an issue",
                        err
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


router.get('/:album_name/like', auth,async (req, res, next) => {
    
    let Albumdata = await Albums.findOne({album_name: req.params.album_name});
    let like_user = await Albumdata.likes.includes(req.userData._id);
    
    if(like_user){
        Albums.findOneAndUpdate({_id: Albumdata._id}, {
            $pull: {
                "likes": req.userData._id
            }
        }, (err, data) => {
            if(err){
                return res.status(404).json({
                    message: "There is some issue in unliking"
                });
            }
            else{
                res.status(200).json({
                    message: "Album Unliked successfully"
                });
                next();
            }
        });
    }
    else{
        Albums.findOneAndUpdate({_id: Albumdata._id}, {
            $push: {
                "likes": req.userData._id
            }
        },(err, data) => {
            if(err)
                return res.status(404).json({
                    message: "There is some issues in liking the album"
                });
            else{
                res.status(200).json({
                    message: "Album liked successfully"
                });
                next();
            }
        });
    }
});


router.delete("/:album_name/:image_id", auth, async (req, res, next) => {
    
    const image = await Photos.findOne({_id: mongoose.Types.ObjectId(req.params.image_id)});
    
    if(image === null || image === undefined){
        return res.status(404).json({
            message: "Image not found"
        });
    }

    Photos.findByIdAndRemove({_id: image._id}, (err,data) => {
        if(err){
            return res.status(404).json({
                message: "The image cannot be removed / image not found"
            });
        }
        else{
            Albums.findOneAndUpdate({album_name: req.body.album_name}, {
                $pull: {
                    "photos": req.body.image_id
                }
            }, (error, data) => {
                if(error){
                    return res.status(404).json({
                        message: "The picture is not completly removed",
                        error
                    });
                }
                else{
                    res.status(200).json({
                        message: "Image removed successfully",
                    });
                    next();
                }
            });
        }
    })
});


router.delete("/:album_id", auth, async (req, res, next) => {

    const removeAlbumPhotos = async (album,image) => {
        return new Promise((resolve,reject)=>{
            Photos.findByIdAndRemove({_id: mongoose.Types.ObjectId(album.photos[image])}, (err) => {
                if(err){
                    return resolve({
                        status: false,
                        message: "The album is not removed",
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

    const album = await Albums.findOne({_id: mongoose.Types.ObjectId(req.params.album_id)});

    if(!album){
        return res.status(404).json({
            message: "There Album not find"
        });
    }

    let x = 0;
    for (let image in album.photos){
        let result = await removeAlbumPhotos(album,image);
        if(result.status){
            x++;
        }else{
            //TODO if return on 1 failure or something else you want 
            return res.status(404).json(result);
        }
    }

    if(x === album.photos.length && x){
        Albums.findByIdAndRemove({_id: mongoose.Types.ObjectId(req.params.album_id)}, (err) => {
            if(err){
                return res.status(200).json({
                    message: "Album not removed",
                    err
                });
            }
            else{
                res.status(200).json({
                    message: "The album has removed successfully"
                });
                next();
            }
        });
    }
    else{
        return res.status(404).json({
            message: "Album not removed"
        });
    }

});


module.exports = router;