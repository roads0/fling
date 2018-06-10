// do this sync so other modules have user data

function getUser() {
  let xhr = new XMLHttpRequest()
  xhr.open("GET", "/api/me", false)
  xhr.onerror = function (e) {
    console.error(xhr.statusText)
  }
  xhr.send(null)

  let user
  if (xhr.status === 200) {
    user = JSON.parse(xhr.responseText)
  } else {
    user = null
  }

  return user
}

fling.user = getUser()

if (fling.user) {
  fling.settings.appendChild(utils.strToDom(`<div class="section" module="user"><h1>User Settings</h1><p>Logged in as: <b>${fling.user.name}</b></p><br><a class="btn" href="/auth/logout">Log Out</a></div>`))
} else {
  fling.settings.appendChild(utils.strToDom('<div class="section login-prompt" module="user"><p>To save your settings across devices, you need to log in.</p><a class="btn" href="/auth">Log in</a></div>'))
}
