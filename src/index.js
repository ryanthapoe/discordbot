const { Client, Intents } = require('discord.js');
require('dotenv').config();

const client = new Client({ intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES] });

const textController = require('./controllers/textReply');

client.once('ready', () => {
  console.log('BOT READY!!');
});

client.on('interactionCreate', async interaction => {
  if (!interaction.isCommand()) return;
  
  const { commandName } = interaction;

  if (commandName === 'healthcheck') return textController.healthcheck(interaction);

});

client.login(process.env.DISCORD_TOKEN);