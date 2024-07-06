require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const fs = require('fs');
const initBot = require('./bot');
const bot = initBot(process.env.BOT_TOKEN);
 // Импорт функции инициализации бота
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

// Обработчик ошибок должен быть последним маршрутом
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Что-то сломалось!');
});



const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
