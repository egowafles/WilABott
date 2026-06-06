const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require('discord.js');
const { loadDB } = require('../utils/db');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('warnings')
    .setDescription('View warnings for a user')
    .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers)
    .addUserOption(opt => opt.setName('user').setDescription('User').setRequired(true)),
  async execute(interaction) {
    const target = interaction.options.getUser('user');
    const db = loadDB('warnings');
    const userWarns = db[target.id] || [];
    if (userWarns.length === 0)
      return interaction.reply({ content: `✅ **${target.tag}** has no warnings.`, ephemeral: true });
    const list = userWarns.map((w, i) => `**${i + 1}.** ${w.reason} — by ${w.mod} on ${new Date(w.date).toLocaleDateString()}`).join('\n');
    await interaction.reply({
      embeds: [new EmbedBuilder().setColor('#FFA500')
        .setTitle(`⚠️ Warnings for ${target.tag}`)
        .setDescription(list).setTimestamp()],
      ephemeral: true,
    });
  },
};
