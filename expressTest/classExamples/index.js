const express = require('express');
const app = express();
const port = 3000;
app.get('/hello', (req, res) => {
    res.send("Hello World!");
});
app.post('/hello', (req, res) => {
    res.send("You just called the post method at '/hello'!\n");
});
    app.listen(port, () => {
    console.log(`Example app listening on port ${port}`);
});

app.set('view engine', 'pug');
app.set('views','./views');
app.get('/pet', (req, res) => {
    res.render('pet');
});
app.post('/pet', async (req, res) => {
    var petInfo = await req.body; //Get the parsed information
    if(!petInfo.name || !petInfo.age || !petInfo.species){
        res.render('show_message', {
        message: "Sorry, you did not provide all of the necessary info",
        type: "error"});
    } 
    else {
        var newPet = new Pet({
        name: petInfo.name,
        age: petInfo.age,
        species: petInfo.species
    });
    newPet.save()
    .then( (result) => {
    res.render('show_message', {message: "New pet added", type: "success", pet: petInfo});
    })
    .catch( (err) => {
    res.render('show_message', {message: "Database error", type: "error"});
    })
    }
    });