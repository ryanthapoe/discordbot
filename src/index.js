require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const { Client, GatewayIntentBits, InteractionType } = require('discord.js');

const guildController = require('./controllers/bot/guilds');
const commandHelper = require('./helper/command');

const app = express();
const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages] });
const dbUrl = process.env.NODE_ENV === 'development' ? process.env.MONGO_CLUSTER_URL_DEV : process.env.MONGO_CLUSTER_URL;
const generatedCommand = commandHelper.get();
const { commands, commandsCollection } = generatedCommand;
client.commands = commandsCollection;

app.listen(3000, () => {
  console.log('express running...');
});

app.get('/', (req, res) => {
  res.json({ msg: 'Hello World'});
});

client.once('ready', () => {
  mongoose.connect(dbUrl, {
    dbName: 'kizuna'
  }, async function(err) {
    if (err) return console.log('error connecting to database', err);

    const discordGuilds = await guildController.get();
    discordGuilds.forEach(guild => {
      commandHelper.register(guild.guildId, commands);
    });

    console.log('connected to database');
    console.log('BOT READY!!');
  });
});

client.on('guildCreate', async interaction => {
  await guildController.add(interaction);
  commandHelper.register(interaction.id, commands);
});

client.on('guildDelete', async interaction => {
  await guildController.delete(interaction);
});

client.on('interactionCreate', async interaction => {
  if (interaction.type === InteractionType.ApplicationCommand) {
    const { commandName, user } = interaction;
    const command = client.commands.get(commandName);
    if (!command) {
      console.log('command not found', command);
      return;
    }
    if (!user) {
      console.log('no user found');
      console.log({ user: interaction.user, guild: interaction.guild});
      return;
    }
    try {
      await command.execute(interaction);
    } catch (error) {
      console.log(`ERROR ${commandName} from ${user.username}`, error);
      await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
    }
  }
});

client.login(process.env.DISCORD_TOKEN);