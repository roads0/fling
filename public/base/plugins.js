/* eslint-env browser */
/* global fling, utils */

utils.addCss(`
[module="plugins"]
.pluginWrap .plugin {
  display: flex;
  flex-direction: row;
}

.pluginWrap .plugin .deletePlugin {
  padding: 3px;
  cursor: pointer;
}

.pluginWrap .plugin .pluginRemoved {
  padding: 3px;
  color: #f45c42;
}

.pluginWrap .plugin .err {
  color: #f45c42;
  float: right;
}

.pluginWrap .plugin .pluginAdded {
  padding: 3px;
  color: #64dd17;
}

.pluginWrap .plugin .good {
  color: #64dd17;
  float: right;
}

.loadSpinner {
  animation: spin 2s infinite linear running;
  padding: 3px;
}

.pluginWrap .plugin .pluginName {
  width: 100%;
  margin: auto 0px;
  margin-left: 4px;
}


@-webkit-keyframes spin {
  0% {
    -webkit-transform: rotate(0deg);
    transform: rotate(0deg);
  }
  100% {
    -webkit-transform: rotate(360deg);
    transform: rotate(360deg);
  }
}
@keyframes spin {
  0% {
    -webkit-transform: rotate(0deg);
    transform: rotate(0deg);
  }
  100% {
    -webkit-transform: rotate(360deg);
    transform: rotate(360deg);
  }
}
`)

let pluginList

function validatePlugin(name, cb) {
  let modPath = require.nameToPath(name)
  fetch(modPath).then((res) => res.text())
    .then((res) => {
      try {
        new Function(res) // eslint-disable-line
        cb(null, true)
      } catch (err) {
        cb(err)
      }
    })
    .catch((err) => {
      cb(err)
    })
}

function renderPlugin(name, loading) {
  return utils.strToDom(`
    <div class="plugin">
    ${loading
    ? '<div class="loadSpinner"><i class="fas fa-sync-alt"></i></div>'
    : '<div class="deletePlugin"><i class="far fa-trash-alt"></i></div>'}
      <div class="pluginName">${name}</div>
      </div>`)
}

function savePlugins() {
  fetch('/api/me/plugins', {
    credentials: 'include',
    method: 'POST',
    body: JSON.stringify(fling.user.plugins),
    headers: new Headers({'Content-Type': 'application/json'})
  }).then((res) => res.json())
    .then(() => {
    // toaster.toast('saved plugins!')
    })
}

function removePlugin(name, pluginElement) {
  fling.user.plugins.splice(fling.user.plugins.indexOf(name), 1)
  let errBtn = utils.strToDom('<div class="pluginRemoved"><i class="fas fa-times"></i></div>')
  pluginElement.replaceChild(errBtn, pluginElement.querySelector('.deletePlugin'))
  pluginElement.querySelector('.pluginName').appendChild(utils.strToDom('<span class="err">(Plugin will be removed on next reload)</span>'))
  savePlugins()
}

function addPlugin(name) {
  let pluginElement = pluginList.querySelector('.pluginWrap').appendChild(renderPlugin(name, true))
  validatePlugin(name, (err) => {
    if (err) {
      let errBtn = utils.strToDom('<div class="pluginRemoved"><i class="fas fa-times"></i></div>')
      pluginElement.replaceChild(errBtn, pluginElement.querySelector('.loadSpinner'))
      pluginElement.querySelector('.pluginName').appendChild(utils.strToDom('<span class="err">(Plugin failed to load)</span>'))
    } else {
      let goodBtn = utils.strToDom('<div class="pluginAdded"><i class="fas fa-check"></i></div>')
      pluginElement.replaceChild(goodBtn, pluginElement.querySelector('.loadSpinner'))
      pluginElement.querySelector('.pluginName').appendChild(utils.strToDom('<span class="good">(Plugin will activate on reload)</span>'))
      fling.user.plugins.push(name)
      savePlugins()
    }
  })
}

if (fling.user) {
  pluginList = fling.settings.appendChild(utils.strToDom(`
    <div class="section" module="plugins">
      <h1>Plugin Settings</h1>
      <p>Loaded Plugins:</p>
      <div class="pluginWrap">

      </div>
      <input ignore class="newPlugin" type="text" placeholder="Add plugin by url...">
      <br><br>
      <a class="btn" href="/">Reload Page</a>
    </div>
  `))

  fling.user.plugins.forEach((plugin) => {
    let pluginElement = pluginList.querySelector('.pluginWrap').appendChild(renderPlugin(plugin))
    pluginElement.querySelector('.deletePlugin').addEventListener('click', () => {
      removePlugin(plugin, pluginElement)
    })
  })

  let pluginInput = pluginList.querySelector('.newPlugin')
  pluginInput.addEventListener('keydown', (evt) => {
    if (evt.keyCode === 13 && pluginInput.value !== '' && !fling.user.plugins.includes(pluginInput.value)) {
      addPlugin(document.querySelector('.newPlugin').value)
      document.querySelector('.newPlugin').value = ''
    }
  })


} else {
  fling.settings.appendChild(utils.strToDom(`
    <div class="section" module="plugins">
      <h1>Plugin Settings</h1>
      <br>
      <p>
        You need to be logged in to have custom plugins.
      </p>
    </div>
  `))
}
