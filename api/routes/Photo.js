const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");


const Photo = require("../models/Photos");
const Album = require("../models/Album");

const storage = multer.diskStorage({
    destination: path.resolve(__dirname, "..", "..", "public/images"),
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
};

const upload = multer({
    storage: storage,
    limits: {
        fileSize: 5 * 1024 * 1024 + 1,
    },
    fileFilter: fileFilter
});

module.exports = router;