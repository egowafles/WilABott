const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { loadDB } = require('../utils/db');

function getLevelFromXP(xp) { return Math.floor(0.1 * Math.sqrt(xp)); }

module.exports = {
  data: new SlashCommandBuilder()
    .setName('leaderboard')
    .setDescription('Show top 10 most active members'),
  cooldown: 10,
  async execute(interaction) {
    await interaction.deferReply();
    const db = loadDB('xp');
    const sorted = Object.entries(db)
      .sort((a, b) => b[1].xp - a[1].xp)
      .slice(0, 10);

    const medals = ['🥇', '🥈', '🥉'];
    const lines = await Promise.all(sorted.map(async ([id, data], i) => {
      let name;
      try {
        const user = await interaction.client.users.fetch(id);
        name = user.username;
      } catch { name = 'Unknown'; }
      const medal = medals[i] || `**${i + 1}.**`;
      const level = getLevelFromXP(data.xp);
      return `${medal} **${name}** • Level ${level} • ${data.xp} XP`;
    }));

    const embed = new EmbedBuilder()
      .setColor('#FFD700')
      .setTitle('🏆 Server Leaderboard')
      .setDescription(lines.join('\n'))
      .setFooter({ text: 'Top 10 most active members' })
      .setTimestamp();

    await interaction.editReply({ embeds: [embed] });
  },
};
