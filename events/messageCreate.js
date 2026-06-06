const { handleXPGain } = require('../commands/rank');

module.exports = {
  name: 'messageCreate',
  async execute(message, client) {
    if (message.author.bot) return;
    handleXPGain(message);
  },
};
