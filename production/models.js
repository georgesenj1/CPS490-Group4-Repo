// models.js
const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    id: { type: String, required: true, unique: true },
    username: { type: String, required: true, unique: true, default: 'someDefaultValue' },
    password: { type: String, required: true }
  });
  

const User = mongoose.model('User', userSchema);

module.exports = {
  User
};
