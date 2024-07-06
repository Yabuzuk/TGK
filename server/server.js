require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const fs = require('fs');
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const session = require('express-session');
const app = express();

// Подключение к MongoDB
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log('MongoDB подключен...'))
.catch(err => console.error('Ошибка подключения к MongoDB:', err));

// Настройка сессии
app.use(session({
  secret: 'Buzuchok',
  resave: false,
  saveUninitialized: false
}));

// Инициализация Passport
app.use(passport.initialize());
app.use(passport.session());

// Сериализация и десериализация пользователя
passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (err) {
    done(err);
  }
});

// Модель пользователя для аутентификации через Google
const UserSchema = new mongoose.Schema({
  googleId: String,
  // Дополнительные поля, если необходимо
});

const User = mongoose.model('User', UserSchema);

// Функция findOrCreate для модели User
User.findOrCreate = async function findOrCreate(profile) {
  let user = await User.findOne({ googleId: profile.id });
  if (!user) {
    user = new User({
      googleId: profile.id,
      // Дополнительные поля, если необходимо
    });
    await user.save();
  }
  return user;
};

// Настройка стратегии Passport для Google
passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: "https://yabuzuk-tgk-ea4b.twc1.net/auth/google/callback"
  },
  async (accessToken, refreshToken, profile, done) => {
    try {
      const user = await User.findOrCreate(profile);
      done(null, user);
    } catch (err) {
      done(err);
    }
  }
));

// Маршруты для аутентификации через Google
app.get('/auth/google',
  passport.authenticate('google', { scope: ['profile', 'email'] }));

app.get('/auth/google/callback', 
  passport.authenticate('google', { failureRedirect: '/login' }),
  (req, res) => {
    // Успешная аутентификация, перенаправление на главную.
    res.redirect('/');
  });

// Определение схемы и модели Item
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

// Маршруты для работы с элементами
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

// Запуск сервера
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
