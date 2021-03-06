const mongoose = require('mongoose')
const TodoModel = require('./Todo')
const Schema = mongoose.Schema

const userSchema = new Schema({
  name: String,
  avatar: String,
  token: String,
  googleId: String,
  api_token: {
    type: String,
    required: true
  },
  background: String,
  settings: {
    type: String,
    required: true,
    default: () => "{}"
  },
  plugins: {
    type: Array,
    default: () => [
      'todo',
      'redditbackground',
      'weather',
      'clock'
    ],
    required: true
  },
  todo: [TodoModel.schema]
})

userSchema.methods.add_todo = function(todo_data, cb) {
  TodoModel.create({title: todo_data}).then((todo) => {
    this.todo.push(todo)
    this.save().then(() => {
      cb(null, todo)
    })
      .catch((err) => {
        cb(err)
      })
  })
    .catch((err) => {
      cb(err)
    })
}

userSchema.methods.edit_todo = function(id, change, cb) {
  if (change.edited_todo != undefined) {
    this.todo.id(id).title = change.edited_todo
    this.save().then(() => {
      cb(null, this.todo.id(id))
    })
      .catch((err) => {
        cb(err)
      })
  }
  if (change.checked != undefined) {
    this.todo.id(id).checked = change.checked
    this.save().then(() => {
      cb(null, this.todo.id(id))
    })
      .catch((err) => {
        cb(err)
      })
  }
}

userSchema.methods.remove_todo = function(todoid, cb) { // http://mongoosejs.com/docs/subdocs.html
  this.todo.id(todoid).remove((err) => {
    this.save((err) => {
      if (err) {
        cb(err)
      } else {
        cb(null, true)
      }
    })
  })
}

userSchema.methods.setting_manager = function(settings, cb) {
  this.settings = JSON.stringify(Object.assign(JSON.parse(this.settings), settings))
  this.save((err) => {
    if (err) {
      cb(err)
    } else {
      cb(null, JSON.parse(this.toObject().settings))
    }
  })
}

userSchema.methods.plugin_manager = function(plugins, cb) {
  this.plugins = plugins
  this.save((err) => {
    if (err) {
      cb(err)
    } else {
      this.save((err) => {
        cb(null, this.toObject().plugins)
      })
    }
  })
}

userSchema.methods.token_reset = function(cb) {
  this.api_token = require('crypto').randomBytes(92)
    .toString('base64')
  this.save((err) => {
    if (err) {
      cb(err)
    } else {
      cb(null, this.api_token)
    }
  })
}

module.exports = mongoose.model('User', userSchema)
