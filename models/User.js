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
  TodoModel.create({title: todo_data}).then(todo => {
    this.todo.push(todo)
    this.save().then(() => {
      cb(null, todo)
    }).catch(err => {
      cb(err)
    })
  }).catch(err => {
    cb(err)
  })
}

userSchema.methods.edit_todo = function(id, change, cb) {
  if (change.edited_todo) {
    this.todo.id(id).title = change.edited_todo
    this.save().then(() => {
      cb(null, this.todo.id(id))
    }).catch(err => {
      cb(err)
    })
  } else if (change.checked) {
    this.todo.id(id).checked = change.checked
    this.save().then(() => {
      cb(null, this.todo.id(id))
    }).catch(err => {
      cb(err)
    })
  }
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

userSchema.methods.setting_manager = function(setting, cb) {
  this.settings.subreddits = Array.isArray(setting.subreddits) ? setting.subreddits.map(r => {return encodeURI(r)}) : []
  this.settings.degreeType = setting.degreeType == 'C' ? 'C' : 'F'
  this.save((err) => {
    if(err) {
      cb(err)
    } else {
      this.save((err) => {
        cb(null, this.toObject())
      })
    }
  })
}

module.exports = mongoose.model('User', userSchema)
