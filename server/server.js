require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const fs = require('fs');
const session = require('express-session');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const bcrypt = require('bcrypt');
const MongoStore = require('connect-mongo');

const app = express();
const SALT_ROUNDS = 10;

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('MongoDB подключен...'))
  .catch(err => console.error('Ошибка подключения к MongoDB:', err));

// Session and Passport Setup
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  store: MongoStore.create({ mongoUrl: process.env.MONGODB_URI }),
}));

app.use(passport.initialize());
app.use(passport.session());

// User Schema
const UserSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
});

const User = mongoose.model('User', UserSchema);

// Passport Configuration
passport.use(new LocalStrategy(
  async (username, password, done) => {
    try {
      const user = await User.findOne({ username });
      if (!user) return done(null, false, { message: 'Неверное имя пользователя.' });

      const match = await bcrypt.compare(password, user.password);
      if (!match) return done(null, false, { message: 'Неверный пароль.' });

      return done(null, user);
    } catch (error) {
      return done(error);
    }
  }
));

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (error) {
    done(error);
  }
});

// Middleware
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Item Schema
const ItemSchema = new mongoose.Schema({
  role: String,
  from: String,
  to: String,
  date: Date,
  price: Number,
  weight: String,
  contact: String,
  message: String,
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' } // Added user reference
});

const Item = mongoose.model('Item', ItemSchema);

// Routes
app.get('/', (req, res) => {
  if (req.isAuthenticated()) {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
  } else {
    res.sendFile(path.join(__dirname, 'public', 'login.html'));
  }
});

app.post('/register', async (req, res) => {
  try {
    const { username, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);
    const newUser = new User({ username, password: hashedPassword });
    await newUser.save();
    res.redirect('/');
  } catch (error) {
    res.status(400).send('Ошибка регистрации.');
  }
});

app.post('/login', passport.authenticate('local', {
  successRedirect: '/',
  failureRedirect: '/login',
}));

app.post('/additem', (req, res) => {
  if (!req.isAuthenticated()) {
    return res.status(401).send('Неавторизованный доступ.');
  }

  const newItem = new Item({ ...req.body, user: req.user._id });
  newItem.save()
    .then(item => res.redirect('/'))
    .catch(err => {
      console.error('Ошибка при сохранении:', err);
      res.status(400).send('Ошибка при сохранении данных');
    });
});

app.post('/deleteitem/:id', (req, res) => {
  if (!req.isAuthenticated()) {
    return res.status(401).send('Неавторизованный доступ.');
  }

  Item.findById(req.params.id)
    .then(item => {
      if (!item) return res.status(404).send('Заявка не найдена.');
      if (item.user.toString() !== req.user._id.toString()) return res.status(403).send('Нет прав на удаление.');
      
      return Item.deleteOne({ _id: req.params.id });
    })
    .then(() => res.redirect('/'))
    .catch(err => {
      console.error('Ошибка при удалении:', err);
      res.status(500).send('Ошибка сервера.');
    });
});

app.get('/logout', (req, res) => {
  req.logout();
  res.redirect('/');
});

app.get('/api/items', async (req, res) => {
  try {
    const items = await Item.find().populate('user', 'username');
    res.json(items);
  } catch (error) {
    res.status(500).send(error);
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

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Что-то сломалось!');
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
