const { Telegraf } = require('telegraf');

module.exports = function(6580511339:AAEr-GaoWoHCuh3laUfmD7AqcGqHyomWJno) {
  const bot = new Telegraf(6580511339:AAEr-GaoWoHCuh3laUfmD7AqcGqHyomWJno);
  bot.start((ctx) => ctx.reply('Welcome!'));
  // Добавьте другие команды бота здесь, если необходимо
  return bot;
};