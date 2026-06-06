const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('embed')
    .setDescription('Create a custom embed message')
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages)
    .addStringOption(opt => opt.setName('title').setDescription('Embed title').setRequired(true))
    .addStringOption(opt => opt.setName('description').setDescription('Embed description').setRequired(true))
    .addStringOption(opt => opt.setName('color').setDescription('Hex color e.g. #FF0000').setRequired(false))
    .addStringOption(opt => opt.setName('footer').setDescription('Footer text').setRequired(false))
    .addStringOption(opt => opt.setName('image').setDescription('Image URL').setRequired(false))
    .addStringOption(opt => opt.setName('thumbnail').setDescription('Thumbnail URL').setRequired(false)),
  async execute(interaction) {
    const title = interaction.options.getString('title');
    const description = interaction.options.getString('description').replace(/\\n/g, '\n');
    const color = interaction.options.getString('color') || '#9B59B6';
    const footer = interaction.options.getString('footer') || 'Wil A Bot';
    const image = interaction.options.getString('image');
    const thumbnail = interaction.options.getString('thumbnail');

    const embed = new EmbedBuilder()
      .setTitle(title)
      .setDescription(description)
      .setColor(color)
      .setFooter({ text: footer })
      .setTimestamp();

    if (image) embed.setImage(image);
    if (thumbnail) embed.setThumbnail(thumbnail);

    await interaction.reply({ embeds: [embed] });
  },
};
