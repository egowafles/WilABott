const { SlashCommandBuilder, EmbedBuilder, Events } = require('discord.js');
const { loadDB, saveDB } = require('../utils/db');

// XP config
const XP_PER_MESSAGE = 15;
const XP_COOLDOWN_MS = 60 * 1000; // 1 min cooldown per user
const xpCooldowns = new Map();

function getLevelFromXP(xp) {
  return Math.floor(0.1 * Math.sqrt(xp));
}

function getXPForLevel(level) {
  return Math.pow(level / 0.1, 2);
}

// Export XP gain handler to be called from messageCreate event
function handleXPGain(message) {
  if (message.author.bot || !message.guild) return;
  const userId = message.author.id;
  const now = Date.now();

  if (xpCooldowns.has(userId) && now - xpCooldowns.get(userId) < XP_COOLDOWN_MS) return;
  xpCooldowns.set(userId, now);

  const db = loadDB('xp');
  if (!db[userId]) db[userId] = { xp: 0, level: 0, messages: 0 };

  const prevLevel = getLevelFromXP(db[userId].xp);
  db[userId].xp += XP_PER_MESSAGE;
  db[userId].messages = (db[userId].messages || 0) + 1;
  const newLevel = getLevelFromXP(db[userId].xp);
  db[userId].level = newLevel;
  saveDB('xp', db);

  // Level up notification
  if (newLevel > prevLevel) {
    message.channel.send({
      embeds: [
        new EmbedBuilder()
          .setColor('#FFD700')
          .setTitle('⬆️ LEVEL UP!')
          .setDescription(`${message.author} just reached **Level ${newLevel}**! 🎉`)
          .setThumbnail(message.author.displayAvatarURL({ dynamic: true }))
          .setTimestamp()
      ]
    }).catch(() => {});
  }
}

module.exports = {
  handleXPGain,
  data: new SlashCommandBuilder()
    .setName('rank')
    .setDescription('Check your server rank and XP')
    .addUserOption(opt => opt.setName('user').setDescription('User to check').setRequired(false)),
  cooldown: 5,
  async execute(interaction) {
    const target = interaction.options.getUser('user') || interaction.user;
    const db = loadDB('xp');
    const data = db[target.id] || { xp: 0, level: 0, messages: 0 };
    const level = getLevelFromXP(data.xp);
    const currentLevelXP = getXPForLevel(level);
    const nextLevelXP = getXPForLevel(level + 1);
    const progress = data.xp - currentLevelXP;
    const needed = nextLevelXP - currentLevelXP;
    const percent = Math.floor((progress / needed) * 100);
    const bar = '█'.repeat(Math.floor(percent / 10)) + '░'.repeat(10 - Math.floor(percent / 10));

    // Calculate rank
    const sorted = Object.entries(db).sort((a, b) => b[1].xp - a[1].xp);
    const rank = sorted.findIndex(([id]) => id === target.id) + 1;

    const embed = new EmbedBuilder()
      .setColor('#9B59B6')
      .setTitle(`🌌 ${target.username}'s Rank`)
      .setThumbnail(target.displayAvatarURL({ dynamic: true }))
      .addFields(
        { name: '🏆 Rank', value: `#${rank}`, inline: true },
        { name: '⭐ Level', value: `${level}`, inline: true },
        { name: '✨ XP', value: `${data.xp}`, inline: true },
        { name: '💬 Messages', value: `${data.messages || 0}`, inline: true },
        { name: `Progress to Level ${level + 1}`, value: `\`[${bar}]\` ${percent}%` },
      )
      .setFooter({ text: 'Wil A Bot • Keep chatting to level up!' })
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });
  },
};
