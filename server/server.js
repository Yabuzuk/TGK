require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const app = express();

app.use(express.static(path.join(__dirname, 'public')));

mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('MongoDB подключен...'))
  .catch(err => console.error('Ошибка подключения к MongoDB:', err));

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Настройка сессии
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: true,
  store: MongoStore.create({ mongoUrl: process.env.MONGODB_URI }),
  cookie: { secure: true } // Установите в true, если используете HTTPS
}));

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

const UserSchema = new mongoose.Schema({
  telegramId: String,
  firstName: String,
  lastName: String,
  username: String,
  photoUrl: String
});

const Item = mongoose.model('Item', ItemSchema);
const User = mongoose.model('User', UserSchema);

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

// Функция для проверки подписи данных аутентификации Telegram
function checkTelegramAuth(data) {
  const secret = crypto.createHash('sha256')
    .update(process.env.TELEGRAM_BOT_TOKEN)
    .digest();
  
  const checkString = Object.keys(data).filter(key => key !== 'hash')
    .sort()
    .map(key => `${key}=${data[key]}`)
    .join('\n');
  
  const hash = crypto.createHmac('sha256', secret)
    .update(checkString)
    .digest('hex');
  
  return hash === data.hash;
}

// Маршрут для обработки данных аутентификации Telegram
app.post('/auth/telegram', async (req, res) => {
  if (checkTelegramAuth(req.body)) {
    // Аутентификация прошла успешно
    const { id, first_name, last_name, username, photo_url } = req.body;

    // Проверяем, существует ли пользователь в базе данных
    let user = await User.findOne({ telegramId: id });

    if (!user) {
      // Если пользователь не существует, создаем нового пользователя
      user = new User({
        telegramId: id,
        firstName: first_name,
        lastName: last_name,
        username: username,
        photoUrl: photo_url
      });
      await user.save();
    }

    // Создаем сессию для пользователя
    req.session.userId = user._id;
    res.status(200).send('Аутентификация через Telegram успешна.');
  } else {
    // Аутентификация не удалась
    res.status(401).send('Ошибка аутентификации через Telegram.');
  }
});

// Маршрут для получения данных текущего пользователя
app.get('/api/current_user', async (req, res) => {
  if (req.session.userId) {
    const user = await User.findById(req.session.userId);
    res.json(user);
  } else {
    res.status(401).send('Пользователь не аутентифицирован.');
  }
});

// Маршрут для выхода пользователя
app.get('/logout', (req, res) => {
  req.session.destroy(err => {
    if (err) {
      console.error('Ошибка при выходе:', err);
      res.status(500).send('Ошибка при выходе');
    } else {
      res.redirect('/');
    }
  });
});

// Добавляем новый маршрут для получения списка изображений
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
