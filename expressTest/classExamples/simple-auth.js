const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const multer = require('multer');
const upload = multer();
const session = require('express-session');
const cookieParser = require('cookie-parser');

app.set('view engine', 'pug');
app.set('views','./views');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(upload.array());
app.use(cookieParser());
app.use(session({secret: "Mellon"}));

var Users = [];
// Middleware to print the current users everytime a request is received
app.use((req, res, next) => 
{
    let cur_users = Users.map( (element) => (element.id + " ") ).join(' ');
    console.log("Registered users: ", cur_users);

        if (req.session.user) 
        {
            console.log(`Current user: ${req.session.user.id}`);
        } 
        else 
        {
            console.log("Current user: Not set");
        }
    next();
});

app.get('/signup', (req, res) => 
{
    res.render('signup');
});

app.post('/signup', (req, res) => 
{
    if(!req.body.id || !req.body.password)
    {
        res.render('signup', {message: "Please enter both id and password!"});
        return;
    }
    
    const user = Users.find( (element) => 
    {
        return element.id === req.body.id ;
    });

    console.log("<Signup> Find: ", user);

    if (user === undefined || user === null) 
    {
        let newUser = {id: req.body.id, password: req.body.password};
        Users.push(newUser);
        req.session.user = newUser;
        res.redirect('/protected_page');
        return;
    } 
    else 
    {
        res.render('signup', { message: "User Already Exists! Login or choose another user id"});
        return;
    }
});

const port = process.env.PORT || 3000;
app.listen(port, () => 
{
    console.log(`Example app listening on port ${port}`);
});

const checkSignIn = (req, res, next) => 
{
    if(req.session.user)
    {
        return next(); //If session exists, proceed to page
    } 
    else 
    {
        const err = new Error("Not logged in!");
        err.status = 400;
        return next(err); //Error, trying to access unauthorized page!
    }
};

app.get('/login', (req, res) => 
{
    res.render('login');
});

app.post('/login', (req, res) => 
{
    if(!req.body.id || !req.body.password)
    {
        res.render('login', {message: "Please enter both id and password"});
        return;
    }
    let user = Users.find( (element) => 
    {
        return element.id === req.body.id && element.password === req.body.password;
    });

    console.log("<Login> Find: ", user);
    
    if (user === undefined || user === null) 
    {
        res.render('login', {message: "Invalid credentials!"});
        return;
    } 
    else 
    {
        req.session.user = user;
        res.redirect('/protected_page');
        return;
    }
});

app.get('/logout', (req, res) => 
{
    let user = req.session.user.id;
    req.session.destroy( () => 
    {
        console.log(`${user} logged out.`)
    });
    res.redirect('/login');
});

app.get('/protected_page', checkSignIn, (req, res) => {
    res.render('protected_page', {id: req.session.user.id})
});

app.use('/protected_page', (err, req, res, next) => 
{
    // console.error(err.stack); // If you uncomment this, you will get an error printout to your console
    //User should be authenticated! Redirect them to log in.
    res.redirect('/login');
    });