const { SlashCommandBuilder } = require('@discordjs/builders');
const SavedMessage = require('../models/savedMessage');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('get-pin')
    .setDescription('Get pin message alias')
    .addStringOption(option => option.setName('alias').setDescription('get message link with this alias'))
    .addStringOption(option => option.setName('user').setDescription('get alias by this user')),
  async execute(interaction) {
    const alias = interaction.options.getString('alias');
    const user = interaction.options.getString('user');
    try {
      if (alias) {
        const data = await SavedMessage.findOne({ messageAlias: alias });
        if (data) {
          const { messageUrl } = data;
          return await interaction.reply(`${alias}: ${messageUrl}`);
        }
      }
      if (user) {
        const result = await SavedMessage.find().where({ author: user });
        let message = `Pinned message by ${user}\n`;
        result.forEach(data => {
          message += `${data.messageAlias}: ${data.messageUrl}\n`;
        });
        return await interaction.reply(message);
      }
      const result = await SavedMessage.find();
      let message = 'Pinned message\n';
      result.forEach(data => {
        message += `[${data.author}] ${data.messageAlias}: ${data.messageUrl}\n`;
      });
      return await interaction.reply(message);
    } catch (error) {
      console.log(`ERROR getting pinned message by ${interaction.user.username}`, error);
      return await interaction.reply('something went wrong!');
    }
  }
};