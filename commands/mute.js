const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require('discord.js');
require('dotenv').config();

module.exports = {
  data: new SlashCommandBuilder()
    .setName('mute')
    .setDescription('Timeout (mute) a member')
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
    const logId = process.env.LOG_CHANNEL_ID;
    if (logId) {
      interaction.guild.channels.cache.get(logId)?.send(
        `🔇 **${target.user.tag}** muted for **${minutes}min** by **${interaction.user.tag}** — ${reason}`
      );
    }
    await interaction.reply({
      embeds: [new EmbedBuilder().setColor('#FFA500').setTitle('🔇 Muted')
        .setDescription(`**${target.user.tag}** muted for **${minutes} minutes**.\n**Reason:** ${reason}`)
        .setTimestamp()]
    });
  },
};
