const bodyParser = require('body-parser');
const multer = require('multer');
const upload = multer();

const express = require('express');
const app = express();

app.use(bodyParser.json()); // for parsing application/json
app.use(bodyParser.urlencoded({ extended: true })); // for parsing application/x-wwww-form-urlencoded
app.use(upload.array()); // for parsing multipart/form-data

const port = process.env.PORT || 32;

const uname = "georgesenj1";
const pword = "newpassword";
const cluster = "cluster0.32eaxp8";

const dbname = ""; // defaults to "test" if left blank
// Template literal -- that means use back-tick (`) which is the same key as ~

const uri = `mongodb+srv://${uname}:${pword}@${cluster}.mongodb.net/${dbname}?retryWrites=true&w=majority`;
const mongoose = require('mongoose');
const mongoose_settings = {useNewUrlParser: true};

mongoose.connect(uri, mongoose_settings);
const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error: "));
db.once("open", () => {
    console.log("Connected successfully to MongoDB");
});

const petSchema = mongoose.Schema({
    name: String,
    age: Number,
    species: String
});

const Pet = mongoose.model("pet", petSchema);

app.set('view engine', 'pug');
app.set('views','./views');
app.get('/pet', (req, res) => {
    res.render('pet');
});

app.post('/pet', async (req, res) => 
{
    var petInfo = await req.body; //Get the parsed information

    if(!petInfo.name || !petInfo.age || !petInfo.species)
    {
        res.render('show_message', {
        message: "Sorry, you did not provide all of the necessary info",
        type: "error"});
    } 
    else 
    {
        var newPet = new Pet({
            name: petInfo.name,
            age: petInfo.age,
            species: petInfo.species
        });

        newPet.save()
        .then( (result) => 
        {
            res.render('show_message', {message: "New pet added", type: "success", pet: petInfo});
        })
        .catch( (err) => 
        {
            res.render('show_message', {message: "Database error", type: "error"});
        })
    }
});

// Empty `filter` means "match all documents"
const filter = {};
const all = await Pet.find(filter);

await Pet.find();

app.get('/all', async (req, res) => 
{
    const filter = {};
    Pet.find(filter).exec()
        .then( (result) => 
        {
            res.render('show_all', {message: "Retrieves", type: "success", pets: result});
        })
        .catch( (err) => {
            res.render('show_all', {message: "Database error", type: "error"});
        })
});