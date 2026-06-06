const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('clear')
    .setDescription('Clear messages from a channel')
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages)
    .addIntegerOption(opt =>
      opt.setName('amount').setDescription('Number of messages (1-100)').setRequired(true).setMinValue(1).setMaxValue(100)),
  async execute(interaction) {
    const amount = interaction.options.getInteger('amount');
    const deleted = await interaction.channel.bulkDelete(amount, true);
    const embed = new EmbedBuilder().setColor('#00FF00').setTitle('🧹 Cleared')
      .setDescription(`Deleted **${deleted.size}** messages.`).setTimestamp();
    const reply = await interaction.reply({ embeds: [embed], fetchReply: true });
    setTimeout(() => reply.delete().catch(() => {}), 3000);
  },
};
