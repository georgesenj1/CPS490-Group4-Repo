const bcrypt = require('bcrypt');
const saltRounds = 10; // Number of salting rounds for bcrypt
const express = require('express');
const app = express();
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const multer = require('multer');
const upload = multer();
const cookieParser = require('cookie-parser');
const session = require('express-session');
const { User } = require('./models'); // Import the User model

// Define the PORT variable
const PORT = process.env.PORT ;

// Other middleware, routes, etc.

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});


  


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
    
    // Hash the password before saving to the database
    bcrypt.hash(password, saltRounds, async (err, hashedPassword) => {
        if (err) {
            console.error('Error hashing the password:', err);
            return res.status(500).send('Internal server error');
        }

        const newUser = new User({ id, password: hashedPassword });
        await newUser.save();
        res.redirect('/login');
    });
});


app.get('/login', (req, res) => {
    res.render('login', { message: '' });
});

app.post('/login', async (req, res) => {
    const { id, password } = req.body;
    const user = await User.findOne({ id });
    
    if (user) {
        // Compare hashed password with the provided password
        bcrypt.compare(password, user.password, (err, result) => {
            if (err) {
                console.error('Error comparing the passwords:', err);
                return res.status(500).send('Internal server error');
            }

            if (result) { // If the passwords match
                req.session.user = { id };
                return res.redirect('/protected_page');
            } else {
                res.render('login', { message: 'Invalid credentials!' });
            }
        });
    } else {
        res.render('login', { message: 'Invalid credentials!' });
    }
});

app.get('/update', checkSignIn, (req, res) => {
    res.render('update', { message: '' });
});

app.post('/update', checkSignIn, async (req, res) => {
    const { newId, newPassword } = req.body;
    
    try {
        const user = await User.findOne({ id: req.session.user.id });
        
        if (!user) {
            return res.render('update', { message: 'User not found!' });
        }

        // If the user wants to change their username, check if the new username already exists
        if (newId && newId !== user.id) {
            const existingUser = await User.findOne({ id: newId });
            if (existingUser) {
                return res.render('update', { message: 'Username already exists!' });
            }
            user.id = newId;
            req.session.user.id = newId; // Update the session too
        }

        // If the user wants to change their password
        if (newPassword) {
            user.password = await bcrypt.hash(newPassword, saltRounds);
        }

        await user.save();

        res.render('protected_page', { message: `Details updated successfully, Hi ${req.session.user.id}!` });
    } catch (error) {
        console.error("Error updating user's details:", error);
        res.status(500).send('Internal server error');
    }
});

app.post('/delete_account', checkSignIn, async (req, res) => {
    try {
        // Get the logged in user's ID
        const userId = req.session.user.id;

        // Delete the user from the database
        await User.deleteOne({ id: userId });

        // Destroy the session
        delete req.session.user;

        // Redirect to a confirmation page or home page with a success message
        res.redirect('/');
    } catch (error) {
        console.error('Error deleting account:', error);
        res.status(500).send('Error deleting account');
    }
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

app.listen(PORT, () => {
    console.log(`App listening at http://localhost:${PORT}`);
});
