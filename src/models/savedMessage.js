const mongoose = require('mongoose');

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
  guildId: {
    type: String,
    required: true,
  },
  status: {
    type: Boolean,
    default: true,
  }
}, 
{ 
  timestamps: true
});

const SavedMessage = mongoose.model('SavedMessage', savedMessageSchema);

module.exports = SavedMessage;