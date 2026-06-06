const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require('discord.js');
const { loadDB, saveDB } = require('../utils/db');
require('dotenv').config();

function logAction(guild, action, mod, target, reason) {
  const logId = process.env.LOG_CHANNEL_ID;
  if (!logId) return;
  const logChannel = guild.channels.cache.get(logId);
  if (!logChannel) return;
  guild.channels.cache.get(logId)?.send({
    embeds: [new EmbedBuilder().setColor('#FFA500').setTitle(`🛡️ ${action}`)
      .addFields(
        { name: 'Target', value: target.tag || target.user?.tag, inline: true },
        { name: 'Moderator', value: mod.tag, inline: true },
        { name: 'Reason', value: reason }
      ).setTimestamp()]
  });
}

module.exports = {
  data: new SlashCommandBuilder()
    .setName('warn')
    .setDescription('Warn a member')
    .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers)
    .addUserOption(opt => opt.setName('user').setDescription('User').setRequired(true))
    .addStringOption(opt => opt.setName('reason').setDescription('Reason').setRequired(true)),
  async execute(interaction) {
    const target = interaction.options.getUser('user');
    const reason = interaction.options.getString('reason');
    const db = loadDB('warnings');
    if (!db[target.id]) db[target.id] = [];
    db[target.id].push({ reason, mod: interaction.user.tag, date: new Date().toISOString() });
    saveDB('warnings', db);
    logAction(interaction.guild, 'WARN', interaction.user, target, reason);
    await interaction.reply({
      embeds: [new EmbedBuilder().setColor('#FFA500').setTitle('⚠️ Warning Issued')
        .setDescription(`**${target.tag}** warned.\n**Reason:** ${reason}\n**Total warnings:** ${db[target.id].length}`)
        .setTimestamp()]
    });
  },
};
