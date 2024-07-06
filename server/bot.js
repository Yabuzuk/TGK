const { Telegraf } = require('telegraf');

// Это ваш токен, полученный от BotFather
const bot = new Telegraf('6580511339:AAEr-GaoWoHCuh3laUfmD7AqcGqHyomWJno');

bot.start((ctx) => ctx.reply('Welcome!'));
// Добавьте другие команды бота здесь, если необходимо
bot.launch();
