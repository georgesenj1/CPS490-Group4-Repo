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
const { User, Chat, Group, PublicChat } = require('./models'); // Import the Chat model
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

    socket.on('publicChatMessage', async (message) => {
        try {
            const newMessage = new PublicChat({
                sender: message.senderUserId,
                message: message.text
            });
            await newMessage.save();
            io.emit('publicChatMessage', newMessage); // Broadcast to all users for public messages
        } catch (error) {
            console.error('Error handling public chat message:', error);
        }
    });

    // Register a user in a group when they join
    socket.on('registerGroup', (groupId, userId) => {
        socket.join(groupId);
        console.log(`User ${userId} joined group ${groupId}`);
    });

    // Handling typing in group chats
    socket.on('startTyping', (data) => {
        socket.to(data.groupId).emit('userTyping', { senderUserId: data.senderUserId });
    });

    socket.on('stopTyping', (data) => {
        socket.to(data.groupId).emit('userStopTyping', { senderUserId: data.senderUserId });
    });    


    socket.on('typing', (data) => {
        socket.to(userSockets[data.receiverUserId]).emit('typing', data.senderUserId);
    });
    
    socket.on('stopTyping', (data) => {
        socket.to(userSockets[data.receiverUserId]).emit('stopTyping', data.senderUserId);
    });
    
        
    socket.on('chatMessage', async (message) => {
        try {
            const newMessage = new Chat({
                sender: message.senderUserId,
                receiver: message.receiverUserId,
                message: message.text,
                public: message.isPublic // Add this line to handle public messages
            });
            await newMessage.save();
            console.log('Message saved:', newMessage);

            // Check if the message is public and broadcast accordingly
            if(message.isPublic) {
                io.emit('publicMessage', newMessage); // Broadcast to all users
            } else {
                const receiverSocketId = userSockets[message.receiverUserId];
                if (receiverSocketId) {
                    io.to(receiverSocketId).emit('chatMessage', newMessage);
                }
            }
        } catch (error) {
            console.error('Error handling chat message:', error);
        }
    });

    // Inside io.on('connection', (socket) => { ... });

    socket.on('groupChatMessage', async (message) => {
        try {
            const newMessage = new Chat({
                sender: message.senderUserId,
                message: message.text,
                group: message.groupId
            });
            await newMessage.save();
            io.to(message.groupId).emit('groupChatMessage', newMessage); // Broadcasting to the group
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

app.get('/get-public-messages', async (req, res) => {
    try {
        const messages = await PublicChat.find({}).sort({ timestamp: 1 });
        res.json(messages.map(message => ({ sender: message.sender, message: message.message })));
    } catch (error) {
        console.error('Error fetching public messages:', error);
        res.status(500).send('Internal Server Error');
    }
});


app.get('/update', (req, res) => {
    // Render the existing "update.pug" template
    res.render('update');
});

app.post('/send-message', checkSignIn, async (req, res) => {
    try {
        const { receiverUserId, text, isPublic } = req.body; // Add 'isPublic' to determine the message type
        const senderUserId = req.session.user.id; // Get sender's user ID from session

        console.log('Sender:', senderUserId);
        console.log('Receiver:', receiverUserId);
        console.log('Message:', text);
        console.log('Is Public:', isPublic);

        // Create a new chat message document
        const newMessage = new Chat({
            sender: senderUserId,
            message: text,
            public: isPublic // Set the public attribute based on the request
        });

        if (isPublic) {
            newMessage.receiver = null; // For public messages, receiver is null
            io.emit('publicMessage', newMessage); // Emit to all users for public messages
        } else {
            newMessage.receiver = receiverUserId;
            // Store the sender's and receiver's socket ID in the userSockets object
            userSockets[senderUserId] = req.session.socketId;
            const receiverSocketId = userSockets[receiverUserId];

            // Emit the chat message to the receiver using Socket.io
            if (receiverSocketId) {
                io.to(receiverSocketId).emit('chatMessage', newMessage);
            }
        }

        // Save the message to the database
        await newMessage.save();

        // Respond with a success message
        res.status(200).send('Message sent successfully');
    } catch (error) {
        console.error('Error sending message:', error);
        res.status(500).send('Error sending message');
    }
});

app.get('/get-public-messages', async (req, res) => {
    try {
        const messages = await Chat.find({ public: true }).sort({ timestamp: 1 });
        res.json(messages);
    } catch (error) {
        console.error('Error fetching public messages:', error);
        res.status(500).send('Internal Server Error');
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
        bcrypt.compare(password, user.password, async (err, result) => {
            if (err) {
                console.error('Error comparing the passwords:', err);
                return res.status(500).send('Internal server error');
            }

            if (result) { // If the passwords match
                req.session.user = { id };
                req.session.socketId = req.sessionID; // Store the socket ID in the session
                await User.updateOne({ id }, { online: true }); // Set user online
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



app.get('/search', checkSignIn, async (req, res) => {
    try {
        const { query } = req.query; // Extract the search query from the request

        // Fetch users that match the search query using a regex for case-insensitive partial matches
        const users = await User.find({ id: { $regex: query, $options: 'i' } });

        const currentUser = req.session.user.id;
        const currentUserDoc = await User.findOne({ id: currentUser });

        const groups = await Group.find({ members: currentUserDoc._id });

        // Render the chat page with the search results
        res.render('chat', { users, groups, userId: currentUser, query: query });
    } catch (err) {
        console.error('Error in /search:', err);
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

app.get('/logout', async (req, res) => {
    if (req.session.user) {
      await User.updateOne({ id: req.session.user.id }, { online: false }); // Set user offline
      delete req.session.user;
    }
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

app.get('/create-group', checkSignIn, async (req, res) => {
    try {
        const users = await User.find({});
        res.render('create-group', { users });
    } catch (err) {
        console.error(err);
        res.status(500).send('Internal Server Error');
    }
});

// When the group chat page loads
app.get('/group-chat/:groupId', checkSignIn, async (req, res) => {
    const groupId = req.params.groupId;
    try {
        const group = await Group.findById(groupId);
        if (!group) {
            return res.status(404).send('Group not found');
        }
        const messages = await Chat.find({ group: groupId }).sort({ timestamp: 1 }); // Sort oldest to newest
        res.render('group_chat', { group, messages, userId: req.session.user.id });
    } catch (error) {
        console.error('Error loading group chat:', error);
        res.status(500).send('Internal Server Error');
    }
});



app.get('/group-chat', checkSignIn, async (req, res) => {
    try {
        const groups = await Group.find({}); // Or any criteria for fetching groups
        res.render('group-chat', { groups });
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

app.get('/one-on-one-chat', checkSignIn, async (req, res) => {
    const currentUser = req.session.user.id;
    const users = await User.find({}, 'id online'); // Fetch users with online status
    res.render('one-on-one-chat', { users, userId: currentUser });
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
