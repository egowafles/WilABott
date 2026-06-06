const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('serverinfo')
    .setDescription('Show server information'),
  async execute(interaction) {
    const guild = interaction.guild;
    await guild.members.fetch();
    const bots = guild.members.cache.filter(m => m.user.bot).size;
    const humans = guild.memberCount - bots;
    const channels = guild.channels.cache;
    const embed = new EmbedBuilder()
      .setColor('#9B59B6')
      .setTitle(`🌌 ${guild.name}`)
      .setThumbnail(guild.iconURL({ dynamic: true }))
      .addFields(
        { name: '👑 Owner', value: `<@${guild.ownerId}>`, inline: true },
        { name: '📅 Created', value: `<t:${Math.floor(guild.createdTimestamp / 1000)}:D>`, inline: true },
        { name: '👥 Members', value: `${humans} humans, ${bots} bots`, inline: true },
        { name: '📺 Channels', value: `${channels.filter(c => c.type === 0).size} text | ${channels.filter(c => c.type === 2).size} voice`, inline: true },
        { name: '🎭 Roles', value: `${guild.roles.cache.size}`, inline: true },
        { name: '😄 Emojis', value: `${guild.emojis.cache.size}`, inline: true },
        { name: '🚀 Boosts', value: `${guild.premiumSubscriptionCount || 0} (Tier ${guild.premiumTier})`, inline: true },
      )
      .setFooter({ text: `ID: ${guild.id}` })
      .setTimestamp();
    await interaction.reply({ embeds: [embed] });
  },
};
