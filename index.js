// update lại npm i
// run with cmd: nodemon index
const express = require("express");
const path = require("path");
const RouterHome = require("./router/router")
const file = require("./server");
const app = express();
const SUCCESS = "Success";
app.use("/home", RouterHome);
const fs = require('fs');

app.get('/start', async (req, res) => {
    res.json([{
        name: 'server.js',
        pm2_env: {
            status: 'stopped',
        }
    }]);
});

app.use(express.json());
app.use(express.urlencoded({
  extended: true
}));

app.post('/home', async (req, res) => {
    try {
        const keyword = req.body.keyword;
        const bukken_id = req.body.bukken_id;
        const resCrawl = await file.asyncCall(keyword, bukken_id);
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify(resCrawl));
    } catch (error) {
        console.log(error);
        res.status(500).end();
    }
});

app.get('/download/:fileName', async (req, res) => {
    try {
        const file = `${__dirname}/data/${req.params.fileName}`;
        //file exists
        if (fs.existsSync(file)) {
            console.log(123)
            res.download(file); // Set disposition and send it.
        } else {
            res.sendFile(`${__dirname}/public/html/404.html`);
        }
    } catch (error) {
        console.log(error);
        res.status(500).end();
    }
});
app.get('/allFile', async (req, res) => {
    const testFolder = './data/';
    const file = `${__dirname}/data/data.csv`;
    res.download(file); // Set disposition and send it.
});
app.post('/delete-file', async (req, res) => {
    try {
        const file = `${__dirname}/data.csv`;
        fs.unlinkSync(file); // Set disposition and send it.
        res.end(JSON.stringify({Message: SUCCESS, fileName: "data.csv"}))
    } catch (error) {
        res.status(500).end();
    }
});
app.use(express.static(__dirname + '/public'));

app.listen(3000);

