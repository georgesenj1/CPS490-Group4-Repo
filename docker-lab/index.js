const bcrypt = require('bcrypt');
const saltRounds = 10;
const express = require('express');
const app = express();
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const multer = require('multer');
const upload = multer();
const cookieParser = require('cookie-parser');
const session = require('express-session');
const { User, Chat, Group } = require('./models'); // Import the Chat model
const http = require('http'); // Import the 'http' module
const server = http.createServer(app); // Create an HTTP server
const io = require('socket.io')(server); // Set up Socket.io

const PORT = process.env.PORT || 3001;

// MongoDB Connection - Should use environment variables for credentials
const uname = 'prabhakaranj1';
const pword = encodeURIComponent('prabhakaranj1');
const cluster = 'cluster0.kifx1pt';
const dbname = 'test';
const uri = `mongodb+srv://${uname}:${pword}@${cluster}.mongodb.net/${dbname}?retryWrites=true&w=majority`;

mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true })
    .catch(err => console.error("Failed to connect to MongoDB:", err.message));

mongoose.connection.on("error", console.error.bind(console, "connection error: "));
mongoose.connection.once("open", () => console.log("Connected successfully to MongoDB"));

app.set('view engine', 'pug');
app.set('views', './views');
app.use(express.static('public'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(upload.array());
app.use(cookieParser());
app.use(session({
    secret: process.env.SESSION_SECRET, 
    resave: true, 
    saveUninitialized: true
}));

// Middleware for checking if the user is logged in
const checkSignIn = (req, res, next) => {
    if (req.session.user) {
        return next();
    } else {
        const err = new Error("Not logged in!");
        err.status = 400;
        next(err);
    }
};

// Create an object to store user-to-socket mappings
const userSockets = {};
// ... [Rest of your existing server-side code] ...

// Socket.io setup
io.on('connection', (socket) => {
    console.log('A user connected');

    socket.on('registerUser', (userId) => {
        userSockets[userId] = socket.id;
        console.log(`User registered: ${userId} with socket ID: ${socket.id}`);
    });

    socket.on('chatMessage', async (message) => {
        try {
            const newMessage = new Chat({
                sender: message.senderUserId,
                receiver: message.receiverUserId,
                message: message.text,
            });
            await newMessage.save();
            console.log('Message saved:', newMessage);

            const receiverSocketId = userSockets[message.receiverUserId];
            if (receiverSocketId) {
                io.to(receiverSocketId).emit('chatMessage', newMessage);
            }
        } catch (error) {
            console.error('Error handling chat message:', error);
        }
    });

    // Inside io.on('connection', (socket) => { ... });

    socket.on('groupChatMessage', async (message) => {
        try {
            // Find the group by its ID
            const group = await Group.findById(message.groupId);
    
            // Save the message with a reference to the group
            const newMessage = new Chat({
                sender: message.senderUserId,
                message: message.text,
                group: message.groupId // Assign the group ID
            });
            await newMessage.save();
    
            // Broadcast the message to all members in the group
            group.members.forEach(memberId => {
                const memberSocketId = userSockets[memberId.toString()];
                if (memberSocketId) {
                    io.to(memberSocketId).emit('groupChatMessage', newMessage);
                }
            });
        } catch (error) {
            console.error('Error handling group chat message:', error);
        }
    });
    

    socket.on('disconnect', () => {
        for (const [userId, socketId] of Object.entries(userSockets)) {
            if (socketId === socket.id) {
                delete userSockets[userId];
                console.log(`User disconnected: ${userId}`);
                break;
            }
        }
    });
});

// ... [Rest of your existing server-side code] ...


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
    try {
        const { id, password } = req.body;
        const existingUser = await User.findOne({ id });
        if (existingUser) {
            return res.render('signup', { message: 'User already exists!' });
        }

        const hashedPassword = await bcrypt.hash(password, saltRounds);
        const newUser = new User({ id, password: hashedPassword });
        await newUser.save();
        res.redirect('/login');
    } catch (err) {
        console.error('Error in /signup:', err);
        res.status(500).render('signup', { message: 'Internal server error' });
    }
});

app.post('/send-message', checkSignIn, async (req, res) => {
    try {
        const { receiverUserId, text } = req.body;
        const senderUserId = req.session.user.id; // Get sender's user ID from session

        console.log('Sender:', senderUserId);
        console.log('Receiver:', receiverUserId);
        console.log('Message:', text);

        // Create a new chat message document
        const newMessage = new Chat({
            sender: senderUserId,
            receiver: receiverUserId,
            message: text,
        });

        // Save the message to the database
        await newMessage.save();

        // Store the sender's socket ID in the userSockets object
        userSockets[senderUserId] = req.session.socketId;

        // Get the receiver's socket ID from the userSockets object
        const receiverSocketId = userSockets[receiverUserId];

        // Emit the chat message to the receiver using Socket.io
        if (receiverSocketId) {
            io.to(receiverSocketId).emit('chatMessage', newMessage);
        }

        // Respond with a success message
        res.status(200).send('Message sent successfully');
    } catch (error) {
        console.error('Error sending message:', error);
        res.status(500).send('Error sending message');
    }
});

app.get('/get-messages', async (req, res) => {
    const { senderId, receiverId } = req.query;

    try {
        const messages = await Chat.find({
            $or: [
                { sender: senderId, receiver: receiverId },
                { sender: receiverId, receiver: senderId }
            ]
        }).sort({ timestamp: 1 }); // Sort by timestamp to get messages in order

        res.json(messages);
    } catch (error) {
        console.error('Error fetching messages:', error);
        res.status(500).send('Internal Server Error');
    }
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
                req.session.socketId = req.sessionID; // Store the socket ID in the session
                return res.redirect('/protected_page');
            } else {
                res.render('login', { message: 'Invalid credentials!' });
            }
        });
    } else {
        res.render('login', { message: 'Invalid credentials!' });
    }
});

app.get('/chat', checkSignIn, async (req, res) => {
    try {
        const currentUser = req.session.user.id;
        const users = await User.find({}, 'id'); // Fetch other users

        // Find the current user's ObjectId using the username
        const currentUserDoc = await User.findOne({ id: currentUser });
        if (!currentUserDoc) {
            throw new Error('Current user not found');
        }

        // Fetch groups where the current user is a member using ObjectId
        const groups = await Group.find({ members: currentUserDoc._id });

        // Render the chat page with users and groups data
        res.render('chat', { users, groups, userId: currentUser });
    } catch (err) {
        console.error(err);
        res.status(500).send('Internal Server Error');
    }
});






app.get('/chat/:userId', checkSignIn, async (req, res) => {
    try {
        const { userId } = req.params;

        // Fetch the user details for the selected user
        const user = await User.findOne({ id: userId });

        if (!user) {
            return res.status(404).send('User not found');
        }

        // Render the chat_user page with the selected user's details and user session information
        res.render('chat_user', { user, session: req.session });
    } catch (err) {
        console.error(err);
        res.status(500).send('Internal Server Error');
    }
});

// Define a route to handle user searches
app.get('/search', async (req, res) => {
    try {
        const { query } = req.query; // Get the user's search query

        // Fetch users that match the search query
        const users = await User.find({ id: { $regex: query, $options: 'i' } }, 'id');

        // Render the chat page with the search results
        res.render('chat', { users, query });
    } catch (err) {
        console.error(err);
        res.status(500).send('Internal Server Error');
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


app.post('/create-group', checkSignIn, async (req, res) => {
    try {
        const { groupName, members } = req.body; // members are usernames or user IDs

        // Convert usernames/IDs to ObjectIds
        const memberIds = await Promise.all(members.map(async (member) => {
            const user = await User.findOne({ id: member });
            return user._id;
        }));

        const newGroup = new Group({ name: groupName, members: memberIds });
        await newGroup.save();
        res.status(200).json({ message: 'Group created successfully', groupId: newGroup._id });
    } catch (error) {
        console.error('Error creating group:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});


app.get('/group-chat/:groupId', checkSignIn, async (req, res) => {
    try {
        const { groupId } = req.params;
        const group = await Group.findById(groupId);

        if (!group) {
            return res.status(404).send('Group not found');
        }

        // Here, you might want to check if the user is a member of the group
        // Render a group chat page (you'll need to create a corresponding Pug template)
        res.render('group_chat', { group, userId: req.session.user.id });
    } catch (err) {
        console.error(err);
        res.status(500).send('Internal Server Error');
    }
});


app.post('/add-to-group', checkSignIn, async (req, res) => {
    try {
        const { groupId, userId } = req.body;
        const group = await Group.findById(groupId);
        if (!group.members.includes(userId)) {
            group.members.push(userId);
            await group.save();
            res.status(200).send('User added to group successfully');
        } else {
            res.status(400).send('User already in group');
        }
    } catch (error) {
        console.error('Error adding user to group:', error);
        res.status(500).send('Internal Server Error');
    }
});

app.get('/get-group-messages', checkSignIn, async (req, res) => {
    const { groupId } = req.query;

    try {
        const messages = await Chat.find({ group: groupId })
                                  .populate('sender', 'id') // Assuming you want to include the sender's ID
                                  .sort({ timestamp: 1 }); // Sort by timestamp to get messages in order

        res.json(messages);
    } catch (error) {
        console.error('Error fetching group messages:', error);
        res.status(500).send('Internal Server Error');
    }
});

server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
