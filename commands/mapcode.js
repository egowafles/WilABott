const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { loadDB, saveDB } = require('../utils/db');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('mapcode')
    .setDescription('Post your Fortnite UEFN map code')
    .addStringOption(opt => opt.setName('code').setDescription('Map code').setRequired(true))
    .addStringOption(opt => opt.setName('name').setDescription('Map name').setRequired(false))
    .addStringOption(opt => opt.setName('description').setDescription('Map description').setRequired(false)),
  async execute(interaction) {
    const code = interaction.options.getString('code');
    const name = interaction.options.getString('name') || 'My Fortnite Map';
    const desc = interaction.options.getString('description') || 'The ultimate Fortnite Creative experience!';
    const embed = new EmbedBuilder()
      .setColor('#FF6B00')
      .setTitle(`🗺️ ${name}`)
      .setDescription(desc)
      .addFields(
        { name: '📋 Map Code', value: `\`\`\`${code}\`\`\`` },
        { name: '🎮 How to Play', value: 'In Fortnite → Discovery → Island Code → Paste the code above!' },
      )
      .setFooter({ text: 'Wil A Bot • Fortnite Creative' })
      .setTimestamp();
    await interaction.reply({ embeds: [embed] });
  },
};
