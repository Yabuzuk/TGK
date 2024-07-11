require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const fs = require('fs');
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const session = require('express-session');

const app = express();

app.use(express.static(path.join(__dirname, 'public')));

// Подключение к MongoDB
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('MongoDB подключен...'))
  .catch(err => console.error('Ошибка подключения к MongoDB:', err));

// Настройка сессии
app.use(session({
  secret: process.env.SESSION_SECRET || 'a1b2c3d4e5f6g7h8i9j0',
  resave: false,
  saveUninitialized: false
}));

// Инициализация Passport
app.use(passport.initialize());
app.use(passport.session());

// Модель пользователя
const UserSchema = new mongoose.Schema({
  googleId: String,
  displayName: String,
  firstName: String,
  lastName: String,
  image: String,
  email: String,
  accessToken: String,
  refreshToken: String
});

const User = mongoose.model('User', UserSchema);

// Стратегия аутентификации через Google
passport.use(
  new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: process.env.GOOGLE_CALLBACK_URL || 'https://your-callback-url.com/auth/google/callback'
  }, async (accessToken, refreshToken, profile, done) => {
    try {
      let user = await User.findOne({ googleId: profile.id });
      if (user) {
        // Обновите токены, если это необходимо
        user.accessToken = accessToken;
        user.refreshToken = refreshToken;
        await user.save();
        done(null, user);
      } else {
        user = await new User({
          googleId: profile.id,
          displayName: profile.displayName,
          firstName: profile.name.givenName,
          lastName: profile.name.familyName,
          image: profile.photos[0].value,
          email: profile.emails[0].value,
          accessToken: accessToken,
          refreshToken: refreshToken
        }).save();
        done(null, user);
      }
    } catch (err) {
      done(err);
    }
  })
);

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

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

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

// Измененный маршрут для корневого URL
app.get('/', (req, res) => {
  if (req.isAuthenticated()) {
    // Если пользователь аутентифицирован, перенаправляем на главную страницу
    res.redirect('/main');
  } else {
    // Если пользователь не аутентифицирован, отдаем страницу login.html
    res.sendFile(path.join(__dirname, 'public', 'login.html'));
  }
});

// Новый маршрут для главной страницы
app.get('/main', (req, res) => {
  if (req.isAuthenticated()) {
    // Если пользователь аутентифицирован, отдаем index.html
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
  } else {
    // Если пользователь не аутентифицирован, перенаправляем на страницу входа
    res.redirect('/');
  }
});

app.post('/additem', async (req, res) => {
  try {
    const newItem = new Item(req.body);
    await newItem.save();
    res.redirect('/');
  } catch (err) {
    console.error('Ошибка при сохранении:', err);
    res.status(400).send('Ошибка при сохранении данных');
  }
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

// Маршрут для инициации аутентификации через Google
app.get('/auth/google', (req, res, next) => {
  console.log('Request parameters:', req.query);
  // Добавлено логирование тела запроса
  console.log('Request body:', req.body);
  passport.authenticate('google', { scope: ['profile', 'email'] })(req, res, next);
});

// Маршрут для обработки обратного вызова после аутентификации
app.get('/auth/google/callback', 
  passport.authenticate('google', { failureRedirect: '/' }),
  (req, res) => {
    // Успешная аутентификация, перенаправляем на главную страницу /main.
    res.redirect('/main');
  });

// Маршрут для получения данных текущего пользователя
app.get('/api/current_user', (req, res) => {
  if (req.isAuthenticated()) {
    res.json({
      isAuthenticated: true,
      user: req.user
    });
  } else {
    res.json({ isAuthenticated: false });
  }
});

// Маршрут для завершения сессии и выхода
app.get('/logout', (req, res) => {
  req.logout();
  res.redirect('/');
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Что-то сломалось!');
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
