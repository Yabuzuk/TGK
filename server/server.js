require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const fs = require('fs');
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const app = express();

app.use(express.static(path.join(__dirname, 'public')));

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

// Настройка Passport для использования Google OAuth 2.0
passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: "http://localhost:3000/auth/google/callback"
  },
  function(accessToken, refreshToken, profile, done) {
    // Здесь вы можете сохранить информацию о пользователе в базе данных
    return done(null, profile);
  }
));

passport.serializeUser(function(user, done) {
  done(null, user);
});

passport.deserializeUser(function(user, done) {
  done(null, user);
});

app.use(passport.initialize());
app.use(passport.session());

// Маршруты для авторизации через Google
app.get('/auth/google',
  passport.authenticate('google', { scope: ['profile', 'email'] }));

app.get('/auth/google/callback',
  passport.authenticate('google', { failureRedirect: '/login' }),
  function(req, res) {
    // Успешная авторизация, перенаправление на главную страницу
    res.redirect('/');
  });

app.get('/login', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'login.html'));
});

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
