const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
require('dotenv').config();

module.exports = {
  data: new SlashCommandBuilder()
    .setName('youtube')
    .setDescription('Announce a new YouTube video')
    .addStringOption(opt => opt.setName('title').setDescription('Video title').setRequired(true))
    .addStringOption(opt => opt.setName('url').setDescription('Video URL').setRequired(true))
    .addStringOption(opt => opt.setName('description').setDescription('Short description').setRequired(false)),
  cooldown: 30,
  async execute(interaction) {
    const title = interaction.options.getString('title');
    const url = interaction.options.getString('url');
    const desc = interaction.options.getString('description') || 'New video just dropped! Go check it out 🔥';

    const embed = new EmbedBuilder()
      .setColor('#FF0000')
      .setTitle(`🎬 NEW VIDEO — ${title}`)
      .setDescription([
        desc,
        '',
        `🔗 [Watch Now on YouTube](${url})`,
        '',
        '> Like, comment, and subscribe to support the stream! 🙏',
      ].join('\n'))
      .setThumbnail(interaction.user.displayAvatarURL({ dynamic: true }))
      .setFooter({ text: 'Wil A Bot • @Randomrudyyt' })
      .setTimestamp();

    await interaction.reply({ content: '@everyone 🎬 **NEW VIDEO JUST DROPPED!**', embeds: [embed] });
  },
};
