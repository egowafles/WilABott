const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('avatar')
    .setDescription("Get a user's avatar")
    .addUserOption(opt => opt.setName('user').setDescription('User').setRequired(false)),
  async execute(interaction) {
    const user = interaction.options.getUser('user') || interaction.user;
    const avatar = user.displayAvatarURL({ dynamic: true, size: 1024 });
    const embed = new EmbedBuilder()
      .setColor('#9B59B6')
      .setTitle(`🖼️ ${user.username}'s Avatar`)
      .setImage(avatar)
      .addFields({ name: 'Download', value: `[Click Here](${avatar})` })
      .setTimestamp();
    await interaction.reply({ embeds: [embed] });
  },
};
