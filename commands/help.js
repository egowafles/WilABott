const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('help')
    .setDescription('Shows all Wil A Bot commands'),
  cooldown: 5,
  async execute(interaction) {
    const embed = new EmbedBuilder()
      .setColor('#9B59B6')
      .setTitle('🌌 Wil A Bot — All Commands')
      .setDescription('The all-in-one bot for your server')
      .addFields(
        {
          name: '🎮 Fortnite',
          value: [
            '`/mapcode` — Post your UEFN map code',
            '`/stats` — Show your Fortnite stats',
            '`/loadout` — Share your loadout',
            '`/scrim` — Organize a scrim',
          ].join('\n'),
        },
        {
          name: '📺 Stream',
          value: [
            '`/live` — Announce you\'re going live',
            '`/schedule` — Set/show stream schedule',
            '`/clip` — Share a clip',
            '`/youtube` — Post a new YouTube video',
          ].join('\n'),
        },
        {
          name: '🎁 Community',
          value: [
            '`/giveaway` — Start a giveaway',
            '`/poll` — Create a poll',
            '`/rank` — Show your server rank/XP',
            '`/leaderboard` — Top XP leaderboard',
            '`/suggest` — Submit a suggestion',
          ].join('\n'),
        },
        {
          name: '🛡️ Moderation',
          value: [
            '`/ban` — Ban a member',
            '`/kick` — Kick a member',
            '`/mute` — Mute a member',
            '`/warn` — Warn a member',
            '`/warnings` — View a member\'s warnings',
            '`/clear` — Clear messages',
          ].join('\n'),
        },
        {
          name: '⚙️ Utility',
          value: [
            '`/serverinfo` — Server stats',
            '`/userinfo` — User info',
            '`/avatar` — Get someone\'s avatar',
            '`/ping` — Bot latency',
            '`/embed` — Create a custom embed',
          ].join('\n'),
        },
      )
      .setFooter({ text: 'Wil A Bot • Fortnite Creative' })
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });
  },
};
