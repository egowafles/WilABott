const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('userinfo')
    .setDescription('Get info about a user')
    .addUserOption(opt => opt.setName('user').setDescription('User to look up').setRequired(false)),
  async execute(interaction) {
    const target = interaction.options.getMember('user') || interaction.member;
    const user = target.user;
    const roles = target.roles.cache.filter(r => r.id !== interaction.guild.id).map(r => r.toString()).join(' ') || 'None';
    const embed = new EmbedBuilder()
      .setColor('#9B59B6')
      .setTitle(`👤 ${user.tag}`)
      .setThumbnail(user.displayAvatarURL({ dynamic: true, size: 256 }))
      .addFields(
        { name: '🆔 ID', value: user.id, inline: true },
        { name: '🤖 Bot', value: user.bot ? 'Yes' : 'No', inline: true },
        { name: '📅 Account Created', value: `<t:${Math.floor(user.createdTimestamp / 1000)}:D>`, inline: true },
        { name: '📥 Joined Server', value: target.joinedAt ? `<t:${Math.floor(target.joinedTimestamp / 1000)}:D>` : 'Unknown', inline: true },
        { name: '🎭 Roles', value: roles.length > 1024 ? roles.slice(0, 1020) + '...' : roles },
      )
      .setTimestamp();
    await interaction.reply({ embeds: [embed] });
  },
};
