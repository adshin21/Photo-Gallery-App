const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");

mongoose.connect("mongodb://localhost/codechef",{ useNewUrlParser: true , useFindAndModify: false , useCreateIndex: true,  useUnifiedTopology: true });

const UserController = require("./api/routes/User");

const app = express();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.use("/user", UserController);

app.listen(5000, () => {
    console.log(`Server is listening on http://localhost:${5000}`);
});