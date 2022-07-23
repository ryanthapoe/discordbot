const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('healthcheck')
    .setDescription('send the condition of bot app'),
  async execute(interaction) {
    const { guild } = interaction;
    return await interaction.reply(`Bot is ready! \nServer: ${guild.name}`);
  }
};