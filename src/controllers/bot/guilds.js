const Guilds = require('../../models/guilds');

module.exports = {
  get: async () => {
    try {
      const guilds = await Guilds.find({ status: true });
      if (guilds) {
        return guilds;
      }
      throw new Error('Cannot get guilds');
    } catch (error) {
      console.log('ERROR get guilds', error);
      return false;
    }
  },
  add: async function (interaction) {
    try {
      const { id, name } = interaction;

      const foundGuild = await Guilds.findOne({ guildId: id });
      const isGuildExist = Boolean(foundGuild);
      
      if (isGuildExist && foundGuild.status === false) {
        const updated = await Guilds.updateOne({ guildId: id }, { status: true });
        if (updated) {
          return console.log(`added commands to guild ${name}`);
        }
        throw new Error(`Guilds add ${{isGuildExist, status: foundGuild.status}}`);
      }

      if (!isGuildExist) {
        const newGuild = new Guilds({ guildId: id, name });
        const result = await newGuild.save();
        if (result) {
          return console.log(`added commands to guild ${name}`);
        }
        throw new Error(`Guilds add ${{result}}`);
      }

      throw new Error(`Missing params ${{ interaction, id, name, foundGuild, isGuildExist}}`);
    } catch (error) {
      console.log('ERROR add guild ', error);
      return 'Something went wrong!';
    }
    
  },
  delete: async function(interaction) {
    try {
      const { id } = interaction;
      const result = await Guilds.findOneAndUpdate({ guildId: id }, { status: false });
      if (result) {
        console.log(`guild ${interaction.name} deleted`);
      }
    } catch (error) {
      console.log('ERROR delete guild', error);
    }
  }
};