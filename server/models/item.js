const mongoose = require('mongoose');

// Определение схемы для Item
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

// Создание модели на основе схемы
const Item = mongoose.model('Item', ItemSchema);

// Экспорт модели для использования в других частях приложения
module.exports = Item;