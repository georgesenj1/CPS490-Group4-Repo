const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const multer = require('multer');
const upload = multer();
const cookieParser = require('cookie-parser');
const session = require('express-session');
const { User } = require('./models'); // Import the User model

const app = express();
const port = 3001;

// MongoDB Connection
const uname = 'prabhakaranj1';
const pword = encodeURIComponent('prabhakaranj1');
const cluster = 'cluster0.kifx1pt';
const dbname = 'test';

const uri = `mongodb+srv://${uname}:${pword}@${cluster}.mongodb.net/${dbname}?retryWrites=true&w=majority`;

const mongoose_settings = { useNewUrlParser: true, useUnifiedTopology: true };

mongoose.connect(uri, mongoose_settings).catch(err => {
    console.error("Failed to connect to MongoDB:", err.message);
});

const db = mongoose.connection;

db.on("error", console.error.bind(console, "connection error: "));
db.once("open", () => {
    console.log("Connected successfully to MongoDB");
});

// Express Configuration
app.set('view engine', 'pug');
app.set('views', './views');
app.use(express.static('public'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(upload.array());
app.use(cookieParser());
app.use(session({ secret: "YourSecretPhraseHere", resave: true, saveUninitialized: true }));

const checkSignIn = (req, res, next) => {
    if(req.session.user){
        return next();
    } else {
        const err = new Error("Not logged in!");
        err.status = 400;
        return next(err);
    }
};

app.get('/', (req, res) => {
    res.render('home');
});

app.use((req, res, next) => {
    if (req.session.user) {
        console.log(`Current user: ${req.session.user.id}`);
    } else {
        console.log("Current user: Not set");
    }
    next();
});

app.get('/signup', (req, res) => {
    res.render('signup', { message: '' });
});

app.post('/signup', async (req, res) => {
    const { id, password } = req.body;
    const existingUser = await User.findOne({ id });
    if (existingUser) {
        return res.render('signup', { message: 'User already exists!' });
    }
    const newUser = new User({ id, password });
    await newUser.save();
    res.redirect('/login');
});

app.get('/login', (req, res) => {
    res.render('login', { message: '' });
});

app.post('/login', async (req, res) => {
    const { id, password } = req.body;
    const user = await User.findOne({ id, password });
    if (user) {
        req.session.user = { id };
        return res.redirect('/protected_page');
    }
    res.render('login', { message: 'Invalid credentials!' });
});

app.get('/logout', (req, res) => {
    delete req.session.user;
    res.redirect('/login');
});

app.get('/protected_page', checkSignIn, (req, res) => {
    res.render('protected_page', { message: `Hi, ${req.session.user.id}!` });
});

app.use('/protected_page', (err, req, res, next) => {
    res.redirect('/login');
});

app.listen(port, () => {
    console.log(`App listening at http://localhost:${port}`);
});
