const mongoose = require('mongoose');
// const db = require('../config/db');

const savedMessageSchema = new mongoose.Schema({
  author: {
    type: String,
    required: true,
  },
  messageUrl: {
    type: String,
    required: true,
  },
  messageAlias: {
    type: String,
    required: true,
    unique: true,
  },
}, 
{ 
  timestamps: true
});

const SavedMessage = mongoose.model('SavedMessage', savedMessageSchema);

module.exports = SavedMessage;