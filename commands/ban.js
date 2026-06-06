const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require('discord.js');
const { loadDB, saveDB } = require('../utils/db');
require('dotenv').config();

function logAction(guild, action, mod, target, reason) {
  const logId = process.env.LOG_CHANNEL_ID;
  if (!logId) return;
  const logChannel = guild.channels.cache.get(logId);
  if (!logChannel) return;
  const embed = new EmbedBuilder()
    .setColor(action === 'BAN' ? '#FF0000' : action === 'KICK' ? '#FF6600' : '#FFA500')
    .setTitle(`🛡️ ${action}`)
    .addFields(
      { name: 'Target', value: `${target.user?.tag || target.tag}`, inline: true },
      { name: 'Moderator', value: `${mod.tag}`, inline: true },
      { name: 'Reason', value: reason || 'No reason provided' },
    )
    .setTimestamp();
  logChannel.send({ embeds: [embed] });
}

module.exports = {
  data: new SlashCommandBuilder()
    .setName('ban')
    .setDescription('Ban a member')
    .setDefaultMemberPermissions(PermissionFlagsBits.BanMembers)
    .addUserOption(opt => opt.setName('user').setDescription('User to ban').setRequired(true))
    .addStringOption(opt => opt.setName('reason').setDescription('Reason').setRequired(false))
    .addIntegerOption(opt => opt.setName('days').setDescription('Delete message days (0-7)').setRequired(false)),
  async execute(interaction) {
    const target = interaction.options.getMember('user');
    const reason = interaction.options.getString('reason') || 'No reason provided';
    const days = interaction.options.getInteger('days') || 0;
    if (!target) return interaction.reply({ content: '❌ User not found.', ephemeral: true });
    if (!target.bannable) return interaction.reply({ content: '❌ I cannot ban this user.', ephemeral: true });
    await target.ban({ deleteMessageDays: days, reason });
    logAction(interaction.guild, 'BAN', interaction.user, target, reason);
    const embed = new EmbedBuilder().setColor('#FF0000').setTitle('🔨 Banned')
      .setDescription(`**${target.user.tag}** was banned.\n**Reason:** ${reason}`).setTimestamp();
    await interaction.reply({ embeds: [embed] });
  },
};
