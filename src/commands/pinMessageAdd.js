const { SlashCommandBuilder } = require('@discordjs/builders');
const SavedMessage = require('../models/savedMessage');

const data = new SlashCommandBuilder().setName('pin').setDescription('Save message url with alias');
data.addStringOption(option => option.setName('alias').setDescription('set message alias').setRequired(true));
data.addStringOption(option => option.setName('url').setDescription('set message url').setRequired(true));

module.exports = {
  data,
  async execute(interaction) {
    const messageAlias = interaction.options.getString('alias');
    const messageUrl = interaction.options.getString('url');
    const { user } = interaction;
    const { username } = user;
    try {
      const isMessageExist = await SavedMessage.findOne({ messageAlias });
      if (!isMessageExist) {
        const newMessage = new SavedMessage({ author: username, messageUrl, messageAlias});
        const result = await newMessage.save();
        if (result) {
          return await interaction.reply('Message Pinned');
        }
      }
      return await interaction.reply('Message with that alias already exist!');
    } catch (error) {
      console.log(`ERROR pinning message by ${username}`, error);
      return await interaction.reply('Something went wrong!');
    }
    
  }
};