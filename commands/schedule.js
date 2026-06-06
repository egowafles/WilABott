const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { loadDB, saveDB } = require('../utils/db');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('schedule')
    .setDescription('Set or show the stream schedule')
    .addSubcommand(sub =>
      sub.setName('set')
        .setDescription('Set stream schedule')
        .addStringOption(opt => opt.setName('monday').setDescription('Monday time or OFF').setRequired(false))
        .addStringOption(opt => opt.setName('tuesday').setDescription('Tuesday time or OFF').setRequired(false))
        .addStringOption(opt => opt.setName('wednesday').setDescription('Wednesday time or OFF').setRequired(false))
        .addStringOption(opt => opt.setName('thursday').setDescription('Thursday time or OFF').setRequired(false))
        .addStringOption(opt => opt.setName('friday').setDescription('Friday time or OFF').setRequired(false))
        .addStringOption(opt => opt.setName('saturday').setDescription('Saturday time or OFF').setRequired(false))
        .addStringOption(opt => opt.setName('sunday').setDescription('Sunday time or OFF').setRequired(false)))
    .addSubcommand(sub => sub.setName('show').setDescription('Show current schedule')),
  async execute(interaction) {
    const sub = interaction.options.getSubcommand();
    const db = loadDB('schedule');
    const days = ['monday','tuesday','wednesday','thursday','friday','saturday','sunday'];

    if (sub === 'set') {
      days.forEach(day => {
        const val = interaction.options.getString(day);
        if (val) db[day] = val;
      });
      saveDB('schedule', db);
      await interaction.reply({ content: '✅ Schedule updated!', ephemeral: true });
    } else {
      const dayEmojis = { monday:'1️⃣', tuesday:'2️⃣', wednesday:'3️⃣', thursday:'4️⃣', friday:'5️⃣', saturday:'6️⃣', sunday:'7️⃣' };
      const lines = days.map(d => `${dayEmojis[d]} **${d.charAt(0).toUpperCase()+d.slice(1)}:** ${db[d] || 'Not set'}`);
      const embed = new EmbedBuilder()
        .setColor('#9B59B6')
        .setTitle('📅 Stream Schedule')
        .setDescription(lines.join('\n'))
        .setFooter({ text: 'All times in streamer\'s local timezone' })
        .setTimestamp();
      await interaction.reply({ embeds: [embed] });
    }
  },
};
