const express = require('express');
const cookieParser = require('cookie-parser');
const session = require('express-session');

const app = express();
const port = process.env.PORT || 3000;

app.use(cookieParser());
app.use(session( {secret: "Caput Draconis", resave: true, saveUninitialized: true }));
app.get('/', (req, res) => {

if(req.session.page_views){
    req.session.page_views++;
    res.send("You visited this page " + req.session.page_views + " times");
} 
else 
{
    req.session.page_views = 1;
    res.send("Welcome to this page for the first time!");
}
});

app.listen(port, () => 
{
    console.log(`Example app listening on port ${port}`);
});