const { ActivityType } = require('discord.js');
const { REST, Routes } = require('@discordjs/rest');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

module.exports = {
  name: 'ready',
  once: true,
  async execute(client) {
    console.log(`✅ Wil A Bot is online as ${client.user.tag}`);

    // Set bot activity
    client.user.setPresence({
      activities: [{
        name: '🎮 Wil A Bot | /help',
        type: ActivityType.Watching,
      }],
      status: 'online',
    });

    // Register slash commands
    const commands = [];
    const commandsPath = path.join(__dirname, '../commands');
    const commandFiles = fs.readdirSync(commandsPath).filter(f => f.endsWith('.js'));
    for (const file of commandFiles) {
      const command = require(path.join(commandsPath, file));
      if (command.data) commands.push(command.data.toJSON());
    }

    const rest = new REST({ version: '10' }).setToken(process.env.DISCORD_TOKEN);
    try {
      await rest.put(
        Routes.applicationGuildCommands(process.env.CLIENT_ID, process.env.GUILD_ID),
        { body: commands }
      );
      console.log(`✅ Registered ${commands.length} slash commands`);
    } catch (err) {
      console.error('❌ Failed to register commands:', err);
    }
  },
};
