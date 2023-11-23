// models.js

const mongoose = require('mongoose');

// Schema for storing chat messages
const chatSchema = new mongoose.Schema({
  sender: { type: String, required: true, ref: 'User' }, // Reference to the User's 'id' field
  receiver: { type: String, required: true, ref: 'User' }, // Reference to the User's 'id' field
  message: { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
});

const Chat = mongoose.model('Chat', chatSchema, 'chat');

// Updated user schema
const userSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  // Add a field to reference chats related to this user
  chats: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Chat' }],
});

const User = mongoose.model('User', userSchema, 'user'); // Forces the collection name to 'user'

module.exports = {
  User,
  Chat,
};
