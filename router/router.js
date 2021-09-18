const express = require("express");
const path = require("path");
const router = express.Router();

module.exports = router;

router.get("/", function(req, res) {
    // res.json("Hello world!")
    res.sendFile(path.join(__dirname, "../public/html/home.html"))
});