const { Telegraf } = require('telegraf');

module.exports = function(botToken) {
  const bot = new Telegraf(botToken);
  bot.start((ctx) => ctx.reply('Welcome!'));
  // Добавьте другие команды бота здесь, если необходимо
  return bot;
};
