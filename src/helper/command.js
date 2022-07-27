const { Routes } = require('discord-api-types/v9');
const { REST } = require('@discordjs/rest');
const { Collection } = require('discord.js');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const rest = new REST({ version: '9' }).setToken(process.env.DISCORD_TOKEN);

module.exports = {
  get: function() {
    const commandsCollection = new Collection();
    const commands = [];
    
    const commandsPath = path.join(process.cwd(), '/src/commands');
    const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));
    
    for (const file of commandFiles) {
      const filePath = path.join(commandsPath, file);
      const command = require(filePath);
      commandsCollection.set(command.data.name, command);
      commands.push(command.data.toJSON());
    }
    return { commands, commandsCollection };
  },
  register: function(id, commands) {
    rest.put(Routes.applicationGuildCommands(process.env.DISCORD_CLIENT_ID, id), { body: commands })
      .then(() => console.log('Successfully registered application commands.'))
      .catch(error => console.log(`error registering application commands to ${id}`, error));
  }
};