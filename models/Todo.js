var mongoose = require('mongoose');
var Schema = mongoose.Schema;

const TodoSchema = new Schema({
  title: String,
  checked: Boolean,
  added: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Todo', TodoSchema)
