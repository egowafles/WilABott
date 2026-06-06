const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require('discord.js');
const { loadDB, saveDB } = require('../utils/db');
require('dotenv').config();

function logAction(guild, action, mod, target, reason) {
  const logId = process.env.LOG_CHANNEL_ID;
  if (!logId) return;
  const logChannel = guild.channels.cache.get(logId);
  if (!logChannel) return;
  const embed = new EmbedBuilder()
    .setColor('#FF6600')
    .setTitle(`🛡️ ${action}`)
    .addFields(
      { name: 'Target', value: `${target.user?.tag || target.tag}`, inline: true },
      { name: 'Moderator', value: `${mod.tag}`, inline: true },
      { name: 'Reason', value: reason || 'No reason provided' },
    ).setTimestamp();
  logChannel.send({ embeds: [embed] });
}

// KICK
const kick = {
  data: new SlashCommandBuilder()
    .setName('kick')
    .setDescription('Kick a member')
    .setDefaultMemberPermissions(PermissionFlagsBits.KickMembers)
    .addUserOption(opt => opt.setName('user').setDescription('User').setRequired(true))
    .addStringOption(opt => opt.setName('reason').setDescription('Reason').setRequired(false)),
  async execute(interaction) {
    const target = interaction.options.getMember('user');
    const reason = interaction.options.getString('reason') || 'No reason provided';
    if (!target?.kickable) return interaction.reply({ content: '❌ Cannot kick this user.', ephemeral: true });
    await target.kick(reason);
    logAction(interaction.guild, 'KICK', interaction.user, target, reason);
    const embed = new EmbedBuilder().setColor('#FF6600').setTitle('👢 Kicked')
      .setDescription(`**${target.user.tag}** was kicked.\n**Reason:** ${reason}`).setTimestamp();
    await interaction.reply({ embeds: [embed] });
  },
};

// WARN
const warn = {
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
    const embed = new EmbedBuilder().setColor('#FFA500').setTitle('⚠️ Warning Issued')
      .setDescription(`**${target.tag}** warned.\n**Reason:** ${reason}\n**Total warnings:** ${db[target.id].length}`)
      .setTimestamp();
    await interaction.reply({ embeds: [embed] });
  },
};

// WARNINGS
const warnings = {
  data: new SlashCommandBuilder()
    .setName('warnings')
    .setDescription('View warnings for a user')
    .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers)
    .addUserOption(opt => opt.setName('user').setDescription('User').setRequired(true)),
  async execute(interaction) {
    const target = interaction.options.getUser('user');
    const db = loadDB('warnings');
    const userWarns = db[target.id] || [];
    if (userWarns.length === 0) return interaction.reply({ content: `✅ **${target.tag}** has no warnings.`, ephemeral: true });
    const list = userWarns.map((w, i) => `**${i + 1}.** ${w.reason} — by ${w.mod}`).join('\n');
    const embed = new EmbedBuilder().setColor('#FFA500').setTitle(`⚠️ Warnings for ${target.tag}`)
      .setDescription(list).setTimestamp();
    await interaction.reply({ embeds: [embed], ephemeral: true });
  },
};

// CLEAR
const clear = {
  data: new SlashCommandBuilder()
    .setName('clear')
    .setDescription('Clear messages from a channel')
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages)
    .addIntegerOption(opt => opt.setName('amount').setDescription('Number of messages (1-100)').setRequired(true).setMinValue(1).setMaxValue(100)),
  async execute(interaction) {
    const amount = interaction.options.getInteger('amount');
    await interaction.channel.bulkDelete(amount, true);
    const embed = new EmbedBuilder().setColor('#00FF00').setTitle('🧹 Messages Cleared')
      .setDescription(`Deleted **${amount}** messages.`).setTimestamp();
    const reply = await interaction.reply({ embeds: [embed], fetchReply: true });
    setTimeout(() => reply.delete().catch(() => {}), 3000);
  },
};

// MUTE (timeout)
const mute = {
  data: new SlashCommandBuilder()
    .setName('mute')
    .setDescription('Timeout a member')
    .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers)
    .addUserOption(opt => opt.setName('user').setDescription('User').setRequired(true))
    .addIntegerOption(opt => opt.setName('minutes').setDescription('Duration in minutes').setRequired(true))
    .addStringOption(opt => opt.setName('reason').setDescription('Reason').setRequired(false)),
  async execute(interaction) {
    const target = interaction.options.getMember('user');
    const minutes = interaction.options.getInteger('minutes');
    const reason = interaction.options.getString('reason') || 'No reason provided';
    if (!target?.moderatable) return interaction.reply({ content: '❌ Cannot mute this user.', ephemeral: true });
    await target.timeout(minutes * 60 * 1000, reason);
    logAction(interaction.guild, 'MUTE', interaction.user, target, `${minutes}min — ${reason}`);
    const embed = new EmbedBuilder().setColor('#FFA500').setTitle('🔇 Muted')
      .setDescription(`**${target.user.tag}** muted for **${minutes} minutes**.\n**Reason:** ${reason}`).setTimestamp();
    await interaction.reply({ embeds: [embed] });
  },
};

// Export all — discord.js needs one per file so we export them individually
// This file exports KICK as default; others are registered separately
module.exports = kick;
module.exports.warn = warn;
module.exports.warnings = warnings;
module.exports.clear = clear;
module.exports.mute = mute;
