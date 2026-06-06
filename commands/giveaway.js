const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require('discord.js');
const { loadDB, saveDB } = require('../utils/db');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('giveaway')
    .setDescription('Manage giveaways')
    .addSubcommand(sub =>
      sub.setName('start')
        .setDescription('Start a giveaway')
        .addStringOption(opt => opt.setName('prize').setDescription('What are you giving away?').setRequired(true))
        .addIntegerOption(opt => opt.setName('minutes').setDescription('Duration in minutes').setRequired(true))
        .addIntegerOption(opt => opt.setName('winners').setDescription('Number of winners').setRequired(false)))
    .addSubcommand(sub =>
      sub.setName('end')
        .setDescription('End a giveaway early')
        .addStringOption(opt => opt.setName('message_id').setDescription('Message ID of the giveaway').setRequired(true)))
    .addSubcommand(sub =>
      sub.setName('reroll')
        .setDescription('Reroll a giveaway winner')
        .addStringOption(opt => opt.setName('message_id').setDescription('Message ID of the giveaway').setRequired(true))),
  cooldown: 5,
  async execute(interaction) {
    const sub = interaction.options.getSubcommand();

    if (sub === 'start') {
      const prize = interaction.options.getString('prize');
      const minutes = interaction.options.getInteger('minutes');
      const winners = interaction.options.getInteger('winners') || 1;
      const endsAt = new Date(Date.now() + minutes * 60 * 1000);

      const embed = new EmbedBuilder()
        .setColor('#FFD700')
        .setTitle('🎁 GIVEAWAY!')
        .setDescription([
          `**Prize:** ${prize}`,
          `**Winners:** ${winners}`,
          `**Ends:** <t:${Math.floor(endsAt.getTime() / 1000)}:R>`,
          '',
          'React with 🎉 to enter!',
          '',
          `Hosted by: ${interaction.user}`,
        ].join('\n'))
        .setFooter({ text: `Ends at • ${winners} winner(s)` })
        .setTimestamp(endsAt);

      const msg = await interaction.reply({ embeds: [embed], fetchReply: true });
      await msg.react('🎉');

      // Save giveaway to DB
      const db = loadDB('giveaways');
      db[msg.id] = {
        prize,
        winners,
        channelId: interaction.channelId,
        guildId: interaction.guildId,
        endsAt: endsAt.toISOString(),
        ended: false,
        hostedBy: interaction.user.id,
      };
      saveDB('giveaways', db);

      // Auto end after duration
      setTimeout(async () => {
        try {
          const channel = interaction.guild.channels.cache.get(interaction.channelId);
          const message = await channel.messages.fetch(msg.id);
          const reaction = message.reactions.cache.get('🎉');
          if (!reaction) return;

          const users = await reaction.users.fetch();
          const entries = users.filter(u => !u.bot);

          if (entries.size === 0) {
            channel.send('🎁 No one entered the giveaway!');
            return;
          }

          const winnerList = entries.random(Math.min(winners, entries.size));
          const winnerMentions = (Array.isArray(winnerList) ? winnerList : [winnerList])
            .map(u => `<@${u.id}>`).join(', ');

          const endEmbed = new EmbedBuilder()
            .setColor('#FFD700')
            .setTitle('🎁 GIVEAWAY ENDED!')
            .setDescription([
              `**Prize:** ${prize}`,
              `**Winner(s):** ${winnerMentions}`,
              '',
              'Congratulations! 🎉',
            ].join('\n'))
            .setTimestamp();

          await message.edit({ embeds: [endEmbed] });
          channel.send({ content: `🎉 Congrats ${winnerMentions}! You won **${prize}**!` });

          const gdb = loadDB('giveaways');
          if (gdb[msg.id]) { gdb[msg.id].ended = true; saveDB('giveaways', gdb); }
        } catch (e) { console.error('Giveaway end error:', e); }
      }, minutes * 60 * 1000);

    } else if (sub === 'reroll') {
      const messageId = interaction.options.getString('message_id');
      const db = loadDB('giveaways');
      const ga = db[messageId];
      if (!ga) return interaction.reply({ content: '❌ Giveaway not found.', ephemeral: true });

      const channel = interaction.guild.channels.cache.get(ga.channelId);
      const message = await channel.messages.fetch(messageId);
      const reaction = message.reactions.cache.get('🎉');
      const users = await reaction.users.fetch();
      const entries = users.filter(u => !u.bot);
      const winner = entries.random(1);
      const winnerMention = `<@${(Array.isArray(winner) ? winner[0] : winner).id}>`;

      await interaction.reply({ content: `🎉 New winner: ${winnerMention}! Congrats on winning **${ga.prize}**!` });
    }
  },
};
