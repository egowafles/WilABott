const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require('discord.js');
require('dotenv').config();

const YOUTUBE_URL = 'https://youtube.com/@Randomrudyyt';

module.exports = {
  data: new SlashCommandBuilder()
    .setName('live')
    .setDescription('Announce you are going live on YouTube')
    .addStringOption(opt =>
      opt.setName('title').setDescription('Stream title').setRequired(true))
    .addStringOption(opt =>
      opt.setName('game').setDescription('Game you\'re playing').setRequired(false))
    .addStringOption(opt =>
      opt.setName('url').setDescription('Custom stream URL (optional)').setRequired(false)),
  cooldown: 60,
  async execute(interaction) {
    const title = interaction.options.getString('title');
    const game = interaction.options.getString('game') || 'Fortnite';
    const url = interaction.options.getString('url') || YOUTUBE_URL;

    const color = '#FF0000';
    const icon = '🔴';
    const platformName = 'YouTube';

    const embed = new EmbedBuilder()
      .setColor(color)
      .setTitle(`${icon} RUDY IS LIVE!`)
      .setDescription([
        `**${title}**`,
        '',
        `🎮 Playing: **${game}**`,
        `📺 Platform: **${platformName}**`,
        `🔗 [Watch Now](${url})`,
        '',
        '> Come hang out, drop a follow and let\'s get it! 🔥',
      ].join('\n'))
      .setThumbnail(interaction.user.displayAvatarURL({ dynamic: true }))
      .setImage('https://i.imgur.com/your-banner-here.png') // replace with your banner
      .setFooter({ text: 'Wil A Bot • Fortnite Creative' })
      .setTimestamp();

    const channelId = process.env.LIVE_NOTIFICATIONS_CHANNEL_ID;
    const channel = channelId
      ? interaction.guild.channels.cache.get(channelId)
      : interaction.channel;

    if (channel) {
      await channel.send({ content: '@everyone 🔴 **RUDY IS LIVE!**', embeds: [embed] });
    }

    await interaction.reply({ content: `✅ Live announcement posted in ${channel}!`, ephemeral: true });
  },
};
