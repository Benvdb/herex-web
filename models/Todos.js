var mongoose = require('mongoose');

var TodoSchema = new mongoose.Schema({
  name: String,
  author: String,
  completed: Boolean,
  note: String
});

module.exports = mongoose.model('Todo', TodoSchema);
