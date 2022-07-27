const mongoose = require('mongoose');

const GuildsSchema = new mongoose.Schema({
  guildId: {
    type: String,
    required: true,
  },
  name: {
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

const Guilds = mongoose.model('Guilds', GuildsSchema);

module.exports = Guilds;