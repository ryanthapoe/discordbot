module.exports = {
  healthcheck: function(interaction) {
    const { guild } = interaction;
    return interaction.reply(`Bot is ready! \nServer: ${guild.name}`);
  }
};