const { EmbedBuilder } = require('discord.js');
const { loadDB, saveDB } = require('../utils/db');
require('dotenv').config();

module.exports = {
  name: 'guildMemberAdd',
  async execute(member, client) {
    // Track member count
    const db = loadDB('stats');
    db.totalJoins = (db.totalJoins || 0) + 1;
    saveDB('stats', db);

    // Auto assign member role
    if (process.env.MEMBER_ROLE_ID) {
      const role = member.guild.roles.cache.get(process.env.MEMBER_ROLE_ID);
      if (role) await member.roles.add(role).catch(() => {});
    }

    // Welcome embed
    const channelId = process.env.WELCOME_CHANNEL_ID;
    if (!channelId) return;
    const channel = member.guild.channels.cache.get(channelId);
    if (!channel) return;

    const memberCount = member.guild.memberCount;

    const embed = new EmbedBuilder()
      .setColor('#9B59B6')
      .setTitle('🌌 Welcome to the server!')
      .setDescription([
        `Hey ${member}, welcome to the server! 🎮`,
        '',
        '🔥 You just joined the best Fortnite community!',
        '',
        '**Get Started:**',
        '📜 Read <#' + (process.env.WELCOME_CHANNEL_ID || 'rules') + '> to stay safe',
        '🧭 Check <#' + (process.env.WELCOME_CHANNEL_ID || 'start-here') + '> for everything you need',
        '🎮 Jump into <#' + (process.env.GENERAL_CHANNEL_ID || 'general') + '> and say hi!',
        '',
        `You are member **#${memberCount}** — let\'s gooo! 🚀`,
      ].join('\n'))
      .setThumbnail(member.user.displayAvatarURL({ dynamic: true, size: 256 }))
      .setFooter({ text: 'Wil A Bot • Fortnite Creative' })
      .setTimestamp();

    channel.send({ content: `${member}`, embeds: [embed] });

    // Log to log channel
    const logId = process.env.LOG_CHANNEL_ID;
    if (logId) {
      const logChannel = member.guild.channels.cache.get(logId);
      if (logChannel) {
        logChannel.send(`📥 **${member.user.tag}** joined | Total joins: ${db.totalJoins}`);
      }
    }
  },
};
