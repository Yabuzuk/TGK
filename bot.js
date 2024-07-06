const { Telegraf } = require('telegraf');

const bot = new Telegraf(process.env.BOT_TOKEN); // Используйте переменную окружения

bot.start((ctx) => ctx.reply('Welcome!'));
bot.launch();

