require('dotenv').config();

module.exports = {
  name: 'guildMemberRemove',
  async execute(member, client) {
    const logId = process.env.LOG_CHANNEL_ID;
    if (!logId) return;
    const logChannel = member.guild.channels.cache.get(logId);
    if (logChannel) {
      logChannel.send(`📤 **${member.user.tag}** left the server.`);
    }
  },
};
