const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { loadDB, saveDB } = require('../utils/db');
require('dotenv').config();

module.exports = {
  data: new SlashCommandBuilder()
    .setName('suggest')
    .setDescription('Submit a suggestion for the server or stream')
    .addStringOption(opt => opt.setName('suggestion').setDescription('Your suggestion').setRequired(true))
    .addStringOption(opt => opt.setName('type').setDescription('Type of suggestion').setRequired(false)
      .addChoices(
        { name: 'Server', value: 'server' },
        { name: 'Stream', value: 'stream' },
        { name: 'Map', value: 'map' },
        { name: 'Content', value: 'content' },
      )),
  async execute(interaction) {
    const suggestion = interaction.options.getString('suggestion');
    const type = interaction.options.getString('type') || 'general';
    const db = loadDB('suggestions');
    const id = Object.keys(db).length + 1;
    db[id] = { suggestion, type, userId: interaction.user.id, status: 'pending', date: new Date().toISOString() };
    saveDB('suggestions', db);

    const embed = new EmbedBuilder()
      .setColor('#3498DB')
      .setTitle(`💡 New Suggestion #${id}`)
      .addFields(
        { name: '📝 Suggestion', value: suggestion },
        { name: '📂 Type', value: type.charAt(0).toUpperCase() + type.slice(1), inline: true },
        { name: '👤 From', value: interaction.user.toString(), inline: true },
        { name: '📊 Status', value: '⏳ Pending', inline: true },
      )
      .setTimestamp();

    const logId = process.env.LOG_CHANNEL_ID;
    if (logId) interaction.guild.channels.cache.get(logId)?.send({ embeds: [embed] });

    await interaction.reply({
      embeds: [new EmbedBuilder().setColor('#00FF00').setTitle('✅ Suggestion Submitted!')
        .setDescription(`Your suggestion **#${id}** has been submitted! Thanks for helping improve the server 🙏`)
        .setTimestamp()],
      ephemeral: true,
    });
  },
};
