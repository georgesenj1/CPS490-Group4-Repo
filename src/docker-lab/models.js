// models.js

const mongoose = require('mongoose');

// Schema for storing chat messages
const chatSchema = new mongoose.Schema({
    sender: { type: String, required: true, ref: 'User' },
    receiver: { type: String, ref: 'User' }, // Make receiver optional
    message: { type: String, required: true },
    timestamp: { type: Date, default: Date.now },
    public: { type: Boolean, default: true }, 
    group: { type: mongoose.Schema.Types.ObjectId, ref: 'Group' }, // Add a field for group chats
  });
  

const Chat = mongoose.model('Chat', chatSchema, 'chat');

// Updated user schema
const userSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  // Add a field to reference chats related to this user
  chats: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Chat' }],
  online: { type: Boolean, default: false }, 
});

const User = mongoose.model('User', userSchema, 'user'); // Forces the collection name to 'user'

// Group schema
const groupSchema = new mongoose.Schema({
    name: { type: String, required: true, unique: true },
    members: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    chats: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Chat' }],
  });
  
  const Group = mongoose.model('Group', groupSchema, 'group');
  
 // New schema for public chat messages
const publicChatSchema = new mongoose.Schema({
    sender: { type: String, required: true, ref: 'User' },
    message: { type: String, required: true },
    timestamp: { type: Date, default: Date.now },
    thumbsUp: { type: Number, default: 0 } 
});

const PublicChat = mongoose.model('PublicChat', publicChatSchema, 'publicChat');

module.exports = {
  User,
  Chat,
  Group,
  PublicChat // export the PublicChat model
};

