require('dotenv').config();
const fs = require('fs');
const path = require('path');
const express = require('express');
const mongoose = require('mongoose');
const { Client, GatewayIntentBits , Collection, InteractionType } = require('discord.js');
const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v9');

const guildController = require('./controllers/bot/guilds');

const app = express();

app.listen(3000, () => {
  console.log('express running...');
});

app.get('/', (req, res) => {
  res.json({ msg: 'Hello World'});
});

const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages] });
const rest = new REST({ version: '9' }).setToken(process.env.DISCORD_TOKEN);

client.commands = new Collection();
const commands = [];

const commandsPath = path.join(__dirname, 'commands');
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
  const filePath = path.join(commandsPath, file);
  const command = require(filePath);
  client.commands.set(command.data.name, command);
  commands.push(command.data.toJSON());
}

const registerGuildCommand = (id, cmds) => {
  rest.put(Routes.applicationGuildCommands(process.env.DISCORD_CLIENT_ID, id), { body: cmds })
    .then(() => console.log('Successfully registered application commands.'))
    .catch(error => console.log(`error registering application commands to ${id}`, error));
};

const dbUrl = process.env.NODE_ENV === 'development' ? process.env.MONGO_CLUSTER_URL_DEV : process.env.MONGO_CLUSTER_URL;

client.once('ready', () => {
  mongoose.connect(dbUrl, {
    dbName: 'kizuna'
  }, async function(err) {
    if (err) return console.log('error connecting to database', err);

    const discordGuilds = await guildController.get();
    discordGuilds.forEach(guild => {
      registerGuildCommand(guild.guildId, commands);
    });

    console.log('connected to database');
    console.log('BOT READY!!');
  });
});

client.on('guildCreate', async interaction => {
  await guildController.add(interaction);
  registerGuildCommand(interaction.id, commands);
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