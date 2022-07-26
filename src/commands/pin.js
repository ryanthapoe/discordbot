const { SlashCommandBuilder } = require('@discordjs/builders');
const SavedMessage = require('../models/savedMessage');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('pin')
    .setDescription('Get pinned message by alias, author, or all message')
    .addSubcommand(subcommand => 
      subcommand
        .setName('get')
        .setDescription('Get pinned message')
        .addStringOption(option => 
          option
            .setName('alias')
            .setDescription('get pinned message by message alias'))
        .addStringOption(option => option.setName('author')
          .setDescription('get pinned message by certain author'))
    )
    .addSubcommand(subcommand =>
      subcommand
        .setName('add')
        .setDescription('Add pinned message')
        .addStringOption(option => 
          option
            .setName('alias')
            .setDescription('set message alias')
            .setRequired(true)
        )
        .addStringOption(option => 
          option
            .setName('url')
            .setDescription('add message url that will be pinned')
            .setRequired(true)
        )
    )
    .addSubcommand(subcommand => 
      subcommand
        .setName('delete')
        .setDescription('Delete pinned message by alias')
        .addStringOption(option => option.setName('alias')
          .setDescription('message alias that will be deleted')
          .setRequired(true)
        )
    ),
  async execute(interaction) {
    const { user, guild } = interaction;
    const { username } = user;

    if (!username) {
      return await interaction.reply('Who are you ?!');
    }

    if (!guild) {
      return await interaction.reply('Where am i?');
    }

    const defaultQuery = {
      guildId: guild.id,
      status: true,
    };

    if (interaction.options.getSubcommand() === 'get') {
      const messageAlias = interaction.options.getString('alias');
      const author = interaction.options.getString('author');

      if (messageAlias) {
        const result = await SavedMessage.findOne({ messageAlias, ...defaultQuery });
        if (result) {
          const { messageUrl } = result;
          return await interaction.reply(`${messageAlias}: ${messageUrl}`);
        }
        return await interaction.reply(`no message found with ${messageAlias} alias.`);
      }

      if (author) {
        const result = await SavedMessage.find().where({ author, ...defaultQuery });
        if (result.length > 0) {
          let message = `Pinned message by ${author}\n`;
          result.forEach(data => {
            message += `${data.messageAlias}: ${data.messageUrl}\n`;
          });
          return await interaction.reply(message);
        }
        return await interaction.reply(`no message found from ${author} author.`);
      }

      if (!author && !messageAlias) {
        const result = await SavedMessage.find(defaultQuery);
        if (result.length > 0) {
          let message = 'Pinned message\n';
          result.forEach(data => {
            message += `[${data.author}] ${data.messageAlias}: ${data.messageUrl}\n`;
          });
          return await interaction.reply(message);
        }
        return await interaction.reply('no message found.');
      }
      
      return await interaction.reply('please use command correctly >.<\'\'');
    }
    
    if (interaction.options.getSubcommand() === 'add') {
      const messageAlias = interaction.options.getString('alias');
      const messageUrl = interaction.options.getString('url');
      try {
        const isMessageExist = await SavedMessage.findOne({ messageAlias, ...defaultQuery });
        if (!isMessageExist) {
          const newMessage = new SavedMessage({ author: username, messageUrl, messageAlias, ...defaultQuery });
          const result = await newMessage.save();
          if (result) {
            return await interaction.reply('Message pinned');
          }
        }
        return await interaction.reply('Message with that alias already exist!');
      } catch (error) {
        console.log(`ERROR pinning message by ${username}`, error);
        return await interaction.reply('Something went wrong!');
      }
    }

    if (interaction.options.getSubcommand() === 'delete') {
      const messageAlias = interaction.options.getString('alias');
      try {
        const updated = await SavedMessage.findOneAndUpdate({ messageAlias, ...defaultQuery }, { status: false }).lean();
        if (updated) {
          return await interaction.reply('Message deleted');
        }
        return await interaction.reply('No message deleted');
      } catch (error) {
        console.log(`ERROR pinning message by ${username}`, error);
        return await interaction.reply('Something went wrong!');
      }
    }
  }
};