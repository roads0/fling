window.onload = load

function load() {
  // Set time
  updateClock()
  setInterval(updateClock, 250)

  // Fetch background
  setBackground()

  // Fetch User Information
  getUser()

  // Weather
  getWeather()
}

function updateClock() {
  document.querySelector('.weekday').innerText = moment().format('dddd')
  document.querySelector('.time').innerHTML = moment().format('hh:MM[<div class="small">]A[</div>]')
  document.querySelector('.date').innerText = moment().format('D MMMM YYYY')
}

// TODO: check if subreddit is valid
function setBackground() {
  fetch('/api/background', {credentials: 'include'}).then(r => {return r.blob()}).then(bg => {
    const reader = new FileReader()
    reader.onloadend = () => {
      document.querySelector('.bg').style['background-image'] = `url("${reader.result}")`
      // Hide the loadbox
      document.querySelector('.loadFS').classList.add('hidden')

    }
    reader.readAsDataURL(bg)
  }).catch(err => {
    showErr(err.message)
    document.querySelector('.bg').style['background-image'] = 'url("/images/nopic.png")'
  })
}

function getUser() {
  fetch('/api/me', {credentials: 'include'}).then(r => {return r.json()}).then(res => {
    if(res == 'log in you dumbo') {
      document.querySelector('.todo .list').innerHTML = '<div class="login-prompt"><p>Please log in</p><a href="/auth">Log in</a></div>'
      document.querySelector('.settings').innerHTML += '<div class="login-prompt"><p>To set custom settings, you need to log in.</p><a class="btn" href="/auth">Log in</a></div>'
    } else {
      document.querySelector('.settings').innerHTML +=  `<div class="user"><h1>User Settings</h1><p>Logged in as: <b>${res.name}</b></p><br><a class="btn" href="/auth/logout">Log Out</a></div>`
      document.querySelector('.settings').innerHTML +=  `<div class="subreddits"><h1>Background Settings</h1><p>Where to get background pictures from (subreddits)</p><input class="reddits" type="text" placeholder="pics, dankememes, prequelmemes"></div>`
      document.querySelector('.settings').innerHTML +=  `<div class="temperature"><h1>Temperature Settings</h1><p>Use Fahrenheight or Celsius</p><input type="radio" name="temp" id="tempF" value="F" ${res.settings.degreeType == 'F' ? 'checked' : ''}><label for="tempF">Fahrenheight</label><br><input type="radio" name="temp" id="tempC" value="C" ${res.settings.degreeType == 'C' ? 'checked' : ''}><label for="tempC">Celsius</label>`

      if (res.todo.length == 0) {
        document.querySelector('.todo .list .items').innerHTML = '<div class="alldone"><i class="fas fa-check check"></i><div>You\'re all done!</div></div>'
      } else {
        res.todo.forEach(todo => {
          renderItem(todo)
        })
      }

      setTimeout(function () {
        document.querySelector('input.reddits').value = res.settings.subreddits.join(', ')

        document.querySelector('#tempF').addEventListener('change', function () {
          updateUserSettings(function () {
            getWeather()
          })
        })

        document.querySelector('#tempC').addEventListener('change', function () {
          updateUserSettings(function () {
            getWeather()
          })
        })

        document.querySelector('input.reddits').addEventListener('blur', function () {
          updateUserSettings(function () {
            setBackground()
          })
        })
      }, 500)
    }
    setTimeout(function () {
      if (localStorage.todoActive == 'true') {
        document.querySelector('.todo').style.top = '0px'
        document.querySelector('.todo').classList.add('active')
      } else {
        document.querySelector('.todo').style.top = `${-document.querySelector('.todo .list').clientHeight}px`
      }
      setEventListeners()
    }, 50)
  });
}

function getWeather(location) {
  if ('geolocation' in navigator) {
    navigator.geolocation.getCurrentPosition(function(position) {
      fetch(`/api/weather/${position.coords.latitude},${position.coords.longitude}`, {credentials: 'include'}).then(r => {return r.json()}).then(res => {
        document.querySelector('.weather').innerHTML = `<div class="location">${res.location.name}</div><div class="current"><i class="weathericon fas fa-${iconType(res.current.skycode)}"></i><div class="temp">${res.current.temperature}°${res.location.degreetype}</div></div>`
      })
    });
  } else {
    document.querySelector('.weather').innerText = 'Location not avalible'
  }
}

function setEventListeners() {
  document.querySelector('.handle').addEventListener('click', function () {
    var active = document.querySelector('.todo.active') ? true : false
    document.querySelector('.todo').style.top = (active ? `${-document.querySelector('.todo .list').clientHeight}px` : 0)
    document.querySelector('.todo').classList.toggle('active')
    localStorage.todoActive = !active
  })
  try{
    document.querySelector('.add-item').addEventListener('keydown', function (e) {
      if(e.keyCode == 13 && document.querySelector('.add-item').value != '') {
        createItem(document.querySelector('.add-item').value)
        document.querySelector('.add-item').value = ''
      }
    })
  } catch (err) {

  }
  document.querySelector('.search').addEventListener('keydown', function (e) {
    if(e.keyCode == 13 && document.querySelector('.search').value != '') {
      location.href = `https://www.google.com/search?q=${encodeURI(document.querySelector('.search').value)}`
    }
  })
  document.querySelector('.close-btn').addEventListener('click', function () {
    document.querySelector('.settings').classList.remove('show')
  })
  document.querySelector('.setting-btn').addEventListener('click', function () {
    document.querySelector('.settings').classList.add('show')
  })
  setTimeout(function () {
    document.querySelector('.close-btn').addEventListener('click', function () {
      document.querySelector('.settings').classList.remove('show')
    })
  }, 30)
}

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
  text.appendChild(document.createTextNode(todo.title))
  text.addEventListener('dblclick', function() {
    text.contentEditable = true
    text.addEventListener('blur', function () {
      text.contentEditable = false
      editItem(todo._id, text.innerText) // should work? idk. gtg. ok i will test
    })
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
    cb()
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
    cb()
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

function updateUserSettings(cb) {
  fetch('/api/me/settings', {
    credentials: 'include',
    method: 'POST',
    body: JSON.stringify({
      degreeType: document.querySelector('#tempF').checked ? 'F' : 'C',
      subreddits: document.querySelector('input.reddits').value.replace(/ /gi,'').split(',').filter(r => r?true:false).map(r => encodeURI(r))
    }),
    headers: new Headers({
      'Content-Type': 'application/json'
    })
  }).then(r => {return r.json()}).then(res => {
    cb()
    document.querySelector('input.reddits').value = res.settings.subreddits.join(', ')
    console.log(res.invalidReddits)
    if(res.invalidReddits.length > 0) {
      showErr(`The following subreddits were invalid: ${res.invalidReddits.join(', ')}. They have been removed.`)
    }
  })
}

function showErr(err) {
  document.querySelector('.err code').innerText = err
  document.querySelector('.err').classList.add('show')
  setTimeout(function () {
    document.querySelector('.err').classList.remove('show')
  }, 5000)
}

function iconType(skycode) {
  switch (Number(skycode)) {
    case 0:
    case 1:
    case 2:
    case 3:
    case 4:
    case 17:
    case 35:
    case 37:
    case 38:
    case 47:
      return 'bolt'
      break;
    case 5:
    case 6:
    case 7:
    case 8:
    case 9:
    case 13:
    case 14:
    case 15:
    case 16:
    case 25:
    case 41:
    case 42:
    case 43:
    case 46:
     return 'snowflake'
     break;
    case 11:
    case 12:
    case 13:
    case 18:
    case 39:
    case 40:
    case 45:
      return 'tint'
      break;
    case 19:
    case 20:
    case 21:
    case 22:
      return 'align-right'
      break;
    case 26:
    case 27:
    case 28:
    case 29:
    case 30:
    case 33:
    case 34:
     return 'cloud'
     break;
    case 31:
    case 32:
    case 36:
      return 'sun'
      break;
    default:
      return 'question'
  }

}

// XXX: function rotation nation () _{{{{{{{{{{%212!@$!!#%%%%%!#%^^^^^^^^^^^^^^{{{{}}}}}}}}}}}}}}}}}}}}}}}}}}}}} awe yeah baybe}}}}}}}}}}}}}}}}}}}}}}}}}}}}
