require('dotenv').config();
const fs = require('fs');
const path = require('path');
const express = require('express');
const mongoose = require('mongoose');
const { Client, GatewayIntentBits , Collection, InteractionType } = require('discord.js');
const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v9');

const app = express();

app.listen(3000, () => {
  console.log('express running...');
});

app.get('/', (req, res) => {
  res.send('express running...');
});

const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages] });
const rest = new REST({ version: '9' }).setToken(process.env.DISCORD_TOKEN);

client.commands = new Collection();
const commandsPath = path.join(__dirname, 'commands');
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
  const filePath = path.join(commandsPath, file);
  const command = require(filePath);
  client.commands.set(command.data.name, command);
}

const commands = [];

for(const file of commandFiles) {
  const filePath = path.join(commandsPath, file);
  const command = require(filePath);
  commands.push(command.data.toJSON());
}

const discordGuildsIdEnv = process.env.DISCORD_GUILD_ID;
const discordGuildsId = discordGuildsIdEnv.split(',');

discordGuildsId.forEach((id) => {
  rest.put(Routes.applicationGuildCommands(process.env.DISCORD_CLIENT_ID, id), { body: commands })
    .then(() => console.log('Successfully registered application commands.'))
    .catch(console.error);
});


client.once('ready', () => {
  mongoose.connect(process.env.MONGO_CLUSTER_URL, {
    dbName: 'kizuna'
  }, function(err) {
    if (err) return console.log('error connecting to database', err);
    console.log('connected to database');
    console.log('BOT READY!!');
  });
});

client.on('guildCreate', async interaction => {
  rest.put(Routes.applicationGuildCommands(process.env.DISCORD_CLIENT_ID, interaction.id), { body: commands })
    .then(() => console.log('Successfully registered application commands. to ' + interaction.name))
    .catch(console.error);
});

client.on('interactionCreate', async interaction => {
  if (interaction.type === InteractionType.ApplicationCommand) {
    const { commandName, user } = interaction;
    const command = client.commands.get(commandName);
    if (!command) return;

    try {
      await command.execute(interaction);
    } catch (error) {
      console.log(`ERROR ${commandName} from ${user.username}`, error);
      await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
    }
  }
});

client.login(process.env.DISCORD_TOKEN);