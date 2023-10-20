const express = require('express');
const bodyParser = require('body-parser');
const multer = require('multer');
const upload = multer();
const app = express();
const port = 3000;

app.get('/', function(req, res){
    res.render('form');
});

app.set('view engine', 'pug');
app.set('views','./views');

// for parsing application/json
app.use(bodyParser.json());
// for parsing application/x-wwww-form-urlencoded
app.use(bodyParser.urlencoded({ extended: true }));
// for parsing multipart/form-data
app.use(upload.array());
app.use(express.static('public'));

app.post('/', function(req, res){
    console.log(req.body);
    res.send("Message sent!");
});

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`);
});