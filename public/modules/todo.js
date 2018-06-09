fetch('/lib/marked.js').then(r => {return r.text()}).then(res => {
eval(res)

var todo = fling.overlay.appendChild(utils.strToDom(`<div class="todo">
        <div class="list">
          <div class="items"></div>
          <input class="add-item" placeholder="new todo">
        </div>`))

utils.addCss(`.todo {
    position: absolute;
    top:0;
    right: 0;
    display: flex;
    flex-direction: column;
    justify-content: flex-start;
    align-items: flex-end;
    color: #fff;
    height: 30px;}
    .todo:not(.open) {
      transition: height 1.5s;
    }
    .todo.open {
      height: 50vh;}
    .todo .add-item {
      background: transparent;
      border: none;
      border-bottom: 1px solid #fff;
      width: 100%;
      margin-top: 8px;
      color: #fff; }
    .todo .add-item:focus {
      outline: none; }
    .todo .login-prompt {
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      width: 100%;
      margin: 18px 0px; }
    .todo .list {
      box-sizing: border-box;
      min-width: 300px;
      max-height: 0;
      padding: 0px 12px;
      overflow-y: auto;
      background: rgba(34, 34, 34, 0.7);
      overflow: hidden;
      transition: max-height 1s, padding 1s;
      animation: fadeOutUp 0.5s 1 normal both running;}
    .todo.open .list {
      max-height: 100%;
      height: auto;
      flex-shrink:1;
      overflow: auto;
      padding: 12px;
      transition: max-height 0.5s, padding 0.5s;
      animation: fadeInDown 0.5s 1 normal both running;}
        .todo .list .login-prompt p {
          margin: 0;
          margin-bottom: 10px; }
        .todo .list .login-prompt a {
          text-decoration: none;
          padding: 6px;
          border: 1px solid #fff;
          border-radius: 3px;
          color: #fff; }
      .todo .list .item {
        display: flex;
        align-items: center; }
        .todo .list .item .text {
          width: 100%; }
          .todo .list .item .text p {
            margin: 0px; }
          .todo .list .item .text h1, .todo .list .item .text h2, .todo .list .item .text h3, .todo .list .item .text h4, .todo .list .item .text h5, .todo .list .item .text h6 {
            margin: 0px; }
      .todo .list .item .delete {
        opacity: 0; }
      .todo .list .item:hover .delete {
        opacity: 1; }
      .todo .list .item.checked {
        text-decoration: line-through; }
      .todo .list .alldone {
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        width: 100%;
        margin: 18px 0px; }
        .todo .list .alldone .check {
          font-size: 48px;
          color: #888; }
        .todo .list .alldone div {
          font-size: 16px;
          margin: 6px; }
    .todo .actionbar {
      display: flex;
      flex-direction: row;
      font-size: 24px; }
      .todo .actionbar .handle {
        margin-right: 12px;
        margin-left: 12px;
        transition: 0.5s;
        cursor: pointer; }
  .todo.open .handle {
    transform: rotate(180deg); }

@-webkit-keyframes fadeOutUp {
  from {
    opacity: 1;
  }

  to {
    opacity: 0;
    -webkit-transform: translate3d(0, -100%, 0);
    transform: translate3d(0, -100%, 0);
  }
}

@keyframes fadeInDown {
  from {
    opacity: 0;
    -webkit-transform: translate3d(0, -100%, 0);
    transform: translate3d(0, -100%, 0);
  }

  to {
    opacity: 1;
    -webkit-transform: translate3d(0, 0, 0);
    transform: translate3d(0, 0, 0);
  }
}`)

todo.appendChild(fling.actionbar)

function createItem(name) {
  if (document.querySelector('.alldone')) {
    document.querySelector('.todo .list .items').innerHTML = ''
  }
  fetch('/api/todo/create', {
    credentials: 'include',
    method: 'POST',
    body: JSON.stringify({title: name}),
    headers: new Headers({
      'Content-Type': 'application/json'
    })
  }).then(r => {return r.json()}).then(res => {
    renderItem(res)
  })
}

function renderItem(todo) {
  var item = document.createElement('div')
  item.classList.add('item')
  if (todo.checked) {
    item.classList.add('checked')
  }
  item.id = todo._id
  var chkbox = document.createElement('input')
  chkbox.type = 'checkbox'
  chkbox.checked = todo.checked
  chkbox.addEventListener('change', function() {
    item.classList.toggle('checked')
    checkItem(todo._id, chkbox.checked)
  })
  item.appendChild(chkbox)
  var text = document.createElement('div')
  text.classList.add('text')
  text.innerHTML = marked(HTMLescape(todo.title))
  function updateText (e) {
    if(!e.keyCode || (e.keyCode == 13)) {
      todo.title = text.innerText
      text.removeEventListener('blur', updateText)
      text.removeEventListener('keydown', updateText)
      editItem(todo._id, text.innerText) // should work? idk. gtg. ok i will test
      text.contentEditable = false
      text.innerHTML = marked(HTMLescape(text.innerText))
    }
  }
  text.addEventListener('dblclick', function() {
    text.contentEditable = true
    text.innerText = todo.title
    text.focus()
    text.addEventListener('blur', updateText)
    text.addEventListener('keydown', updateText)
  })
  item.appendChild(text)
  var delIcn = document.createElement('i')
  delIcn.classList.add('far')
  delIcn.classList.add('fa-trash-alt')
  var del = document.createElement('div')
  del.classList.add('delete')
  del.appendChild(delIcn)
  del.addEventListener('click', function() {
    document.querySelector('.items').removeChild(item)
    deleteItem(todo._id)
  })
  item.appendChild(del)
  document.querySelector('.todo .list .items').appendChild(item)
}

function checkItem(id, checked, cb) {
  fetch(`/api/todo/edit/${id}`, {
    credentials: 'include',
    method: 'POST',
    body: JSON.stringify({checked: checked}),
    headers: new Headers({
      'Content-Type': 'application/json'
    })
  }).then(r => {return r.json()}).then(res => {
    if(cb) {
      cb()
    }
  })
}

function editItem(id, edit, cb) {
  fetch(`/api/todo/edit/${id}`, {
    credentials: 'include',
    method: 'POST',
    body: JSON.stringify({edited_todo: edit}),
    headers: new Headers({
      'Content-Type': 'application/json'
    })
  }).then(r => {return r.json()}).then(res => {
    if(cb) {
      cb()
    }
  })
}

function deleteItem(id) {
  fetch(`/api/todo/${id}`, {
    credentials: 'include',
    method: 'DELETE'
  }).then(r => {return r.json()}).then(res => {
    if(document.querySelectorAll('.item').length == 0) {
      document.querySelector('.todo .list .items').innerHTML = '<div class="alldone"><i class="fas fa-check check"></i><div>You\'re all done!</div></div>'
    }
  })
}

var tagsToReplace = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;'
};

function replaceTag(tag) {
    return tagsToReplace[tag] || tag;
}

function HTMLescape(str) {
    return str.replace(/[&<>]/g, replaceTag);
}

document.querySelector('.add-item').addEventListener('keydown', function (e) {
  if(e.keyCode == 13 && document.querySelector('.add-item').value != '') {
    createItem(document.querySelector('.add-item').value)
    document.querySelector('.add-item').value = ''
  }
})

if(fling.user) {
  if (fling.user.todo.length == 0) {
    document.querySelector('.todo .list .items').innerHTML = '<div class="alldone"><i class="fas fa-check check"></i><div>You\'re all done!</div></div>'
  } else {
    fling.user.todo.forEach(todo => {
      renderItem(todo)
    })
  }
} else {
  document.querySelector('.todo .list').innerHTML = '<div class="login-prompt"><p>Please log in</p><a href="/auth">Log in</a></div>'
}

fling.actionbar.appendChild(utils.strToDom('<div class="handle"><i class="fas fa-angle-double-down"></i></div>')).addEventListener('click', () => {
  todo.classList.toggle('open')
  if(todo.classList.contains('open')) {
    localStorage.setItem('todoOpen', true);
  } else {
    localStorage.setItem('todoOpen', false);
  }
})

if(localStorage.getItem('todoOpen') == 'true') {
  todo.classList.add('open')
} else {
  todo.classList.remove('open')
}

function animationTime(element) {
  let durString = window.getComputedStyle(element)['animation-duration']
  if(durString.endsWith('s')) {
    return parseFloat(durString) * 1000
  }
}

}).catch(err => {
  throw err
})