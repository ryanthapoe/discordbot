require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { Client, GatewayIntentBits , Collection, InteractionType } = require('discord.js');
const mongoose = require('mongoose');

const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages] });

client.commands = new Collection();
const commandsPath = path.join(__dirname, 'commands');
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
  const filePath = path.join(commandsPath, file);
  const command = require(filePath);
  client.commands.set(command.data.name, command);
}

client.once('ready', () => {
  mongoose.connect(process.env.MONGO_CLUSTER_URL, {
    dbName: 'kizuna'
  }, function(err) {
    if (err) return console.log('error connecting to database', err);
    console.log('connected to database');
    console.log('BOT READY!!');
  });
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