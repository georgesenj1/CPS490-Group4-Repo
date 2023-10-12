const mongoose = require('mongoose');
const mongoose_settings = {useNewUrlParser: true};

const petSchema = mongoose.Schema({
    name: String,
    age: Number,
    species: String
    });
    const Pet = mongoose.model("pet", petSchema);

const bodyParser = require('body-parser');
const multer = require('multer');
const upload = multer();

app.use(bodyParser.json()); // for parsing application/json
app.use(bodyParser.urlencoded({ extended: true })); // for parsing application/x-wwww-form-urlencoded
app.use(upload.array()); // for parsing multipart/form-data

app.set('view engine', 'pug');
app.set('views','./views');
app.get('/pet', (req, res) => {
    res.render('pet');
});