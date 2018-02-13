const mongoose = require('mongoose');
const TodoModel = require('./Todo');
const Schema = mongoose.Schema;

const userSchema = new Schema({
  name: String,
  avatar: String,
  last_logged_in: { type: Date, default: Date.now },
  token: String,
  googleId: String,
  background: String,
  bgCss: String,
  settings: {
    degreeType: String,
    subreddits: Array
  },
  todo: [TodoModel.schema]
});

userSchema.methods.add_todo = function(todo_data, cb) {
  TodoModel.create({todo: TodoModel.create({title: todo_data})}, (err, todo) => {
    this.todo.push(todo, (err) => {
      if(err) {
        cb(err)
      } else {
        this.save((err) => {
          if(err) {
            cb(err)
          } else {
            cb(null, todo)
          }
        })
      }
    })
  })
}

userSchema.methods.remove_todo = function(todoid, cb) { // http://mongoosejs.com/docs/subdocs.html
  this.todo.id(todoid).remove((err) => {
    this.save((err) => {
      if(err) {
        cb(err)
      } else {
        this.save((err) => {
          cb(null, true)
        })
      }
    })
  })
}

module.exports = mongoose.model('User', userSchema)
