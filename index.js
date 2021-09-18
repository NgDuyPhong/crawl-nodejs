// update lại npm i
// run with cmd: nodemon index
const express = require("express");
const path = require("path");
const RouterHome = require("./router/router")
const file = require("./server");
const app = express();

app.use("/home", RouterHome);

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
        const keyword = req.body[0].value;
    
        const resCrawl = await file.asyncCall(keyword);
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify(resCrawl));
    } catch (error) {
        console.log(error);
        res.status(500).end();
    }
    
});

app.get('/crawl', async (req, res) => {
    const file = `${__dirname}/data.csv`;
    res.download(file); // Set disposition and send it.
});
app.use(express.static(__dirname + '/public'));

app.listen(3000);

