require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const fs = require('fs');
const passport = require('passport');
const TelegramStrategy = require('passport-telegram-official').Strategy;
const session = require('express-session');
const app = express();

app.use(express.static(path.join(__dirname, 'public')));

// Настройка сессии
app.use(session({
  secret: '251083Buzuchok#43382', // Замените на секретное слово для вашей сессии
  resave: false,
  saveUninitialized: true
}));

// Инициализация Passport и сессии
app.use(passport.initialize());
app.use(passport.session());

// Сериализация и десериализация пользователя
passport.serializeUser(function(user, done) {
  done(null, user);
});

passport.deserializeUser(function(obj, done) {
  done(null, obj);
});

// Настройка стратегии Telegram
passport.use(new TelegramStrategy({
  botToken: process.env.TELEGRAM_BOT_TOKEN, // Используйте переменную окружения для токена
  passReqToCallback: true
}, function(req, profile, done) {
  process.nextTick(function() {
    return done(null, profile);
  });
}));

// Маршруты для аутентификации через Telegram
app.get('/auth/telegram',
  passport.authenticate('telegram'),
  function(req, res) {
    // Аутентификация прошла успешно, перенаправляем пользователя
    res.redirect('/');
  }
);

app.get('/logout', function(req, res){
  req.logout();
  res.redirect('/');
});

// Проверка аутентификации перед доступом к защищенным маршрутам
function ensureAuthenticated(req, res, next) {
  if (req.isAuthenticated()) { return next(); }
  res.redirect('/auth/telegram');
}

// Пример защищенного маршрута
app.get('/profile', ensureAuthenticated, function(req, res){
  res.json(req.user);
});

mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('MongoDB подключен...'))
  .catch(err => console.error('Ошибка подключения к MongoDB:', err));

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

const ItemSchema = new mongoose.Schema({
  role: String,
  from: String,
  to: String,
  date: Date,
  price: Number,
  weight: Number,
  contact: String,
  message: String
});

const Item = mongoose.model('Item', ItemSchema);

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.post('/additem', (req, res) => {
  const newItem = new Item(req.body);
  newItem.save()
    .then(item => res.redirect('/'))
    .catch(err => {
      console.error('Ошибка при сохранении:', err);
      res.status(400).send('Ошибка при сохранении данных');
    });
});

app.get('/images', (req, res) => {
  const imagesDirectory = path.join(__dirname, 'public/images');
  
  fs.readdir(imagesDirectory, (err, files) => {
    if (err) {
      console.error('Ошибка при сканировании папки:', err);
      res.status(500).send('Ошибка сервера');
    } else {
      const imageFiles = files.filter(file => /\.(jpg|jpeg|png|gif)$/i.test(file));
      res.json(imageFiles);
    }
  });
});

app.get('/additem', (req, res) => {
  res.status(200).send('Эта страница предназначена для отправки данных.');
});

app.get('/api/items', async (req, res) => {
  try {
    const items = await Item.find();
    res.json(items);
  } catch (error) {
    res.status(500).send(error);
  }
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Что-то сломалось!');
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
```

Не забудьте добавить переменные окружения `TELEGRAM_BOT_TOKEN` и `MONGODB_URI` в ваш файл `.env`. Также убедитесь, что вы заменили `'secret'` на ваше собственное секретное слово для сессии. Это обеспечит безопасность сессии в вашем приложении.

Теперь, когда у вас есть код для авторизации через Telegram, вы можете добавить кнопку входа в ваш `index.html` файл, как я показал ранее. Это позволит пользователям входить в систему с использованием их учетных данных Telegram. 
