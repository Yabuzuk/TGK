const { Telegraf } = require('telegraf');

module.exports = function(bot token) {
  const bot = new Telegraf(bot token);
  bot.start((ctx) => ctx.reply('Welcome!'));
  // Добавьте другие команды бота здесь, если необходимо
  return bot;
};