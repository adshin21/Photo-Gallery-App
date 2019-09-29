const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const morgan = require("morgan");

mongoose.connect("mongodb://localhost/codechef", { useNewUrlParser: true, useFindAndModify: false, useCreateIndex: true, useUnifiedTopology: true });

const UserController = require("./api/routes/User");
const AlbumController = require("./api/routes/Album");
const auth = require("./api/middleware/auth");

const app = express();

app.use(morgan("dev"));

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.static('public'));

app.use("/user", UserController);
app.use("/album", AlbumController);

app.listen(5000, () => {
    console.log(`Server is listening on http://localhost:${5000}`);
});