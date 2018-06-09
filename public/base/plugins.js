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

if(fling.user) {
  var pluginList = fling.settings.appendChild(utils.strToDom(`
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

  fling.user.plugins.forEach(plugin => {
    var pluginElement = pluginList.querySelector('.pluginWrap').appendChild(renderPlugin(plugin))
    pluginElement.querySelector('.deletePlugin').addEventListener('click', () => {
      removePlugin(plugin, pluginElement)
    })
  })

  var pluginInput = pluginList.querySelector('.newPlugin')
  pluginInput.addEventListener('keydown', e => {
    if(e.keyCode == 13 && pluginInput.value != '' && !fling.user.plugins.includes(pluginInput.value)) {
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

function addPlugin(name) {
  pluginElement = pluginList.querySelector('.pluginWrap').appendChild(renderPlugin(name, true))
  validatePlugin(name, (err) => {
    if(err) {
      var errBtn = strToDom('<div class="pluginRemoved"><i class="fas fa-times"></i></div>')
      pluginElement.replaceChild(errBtn, pluginElement.querySelector('.loadSpinner'))
      pluginElement.querySelector('.pluginName').appendChild(strToDom('<span class="err">(Plugin failed to load)</span>'))
    } else {
      var goodBtn = strToDom('<div class="pluginAdded"><i class="fas fa-check"></i></div>')
      pluginElement.replaceChild(goodBtn, pluginElement.querySelector('.loadSpinner'))
      pluginElement.querySelector('.pluginName').appendChild(strToDom('<span class="good">(Plugin will activate on reload)</span>'))
      fling.user.plugins.push(name)
      savePlugins()
    }
  })
}

function validatePlugin(modPath, cb) {
  if(!(modPath.startsWith('https://') || modPath.startsWith('http://'))) {
    modPath = (requireModules.root || '/modules/') + modPath
  }
  if(!modPath.endsWith('.js')) {
    modPath = modPath + '.js'
  }
  fetch(modPath).then(r => {return r.text()}).then(res => {
    try {
      new Function(res)
      cb(null, true)
    } catch(err) {
      cb(err)
    }
  }).catch(err => {
    cb(err)
  })
}

function renderPlugin(name, loading) {
  return utils.strToDom(`
    <div class="plugin">
      ${ loading ?
        '<div class="loadSpinner"><i class="fas fa-sync-alt"></i></div>' :
        '<div class="deletePlugin"><i class="far fa-trash-alt"></i></div>'}
      <div class="pluginName">${name}</div>
    </div>`)
}

function removePlugin(name, pluginElement) {
  fling.user.plugins.splice(fling.user.plugins.indexOf(name), 1);
  var errBtn = strToDom('<div class="pluginRemoved"><i class="fas fa-times"></i></div>')
  pluginElement.replaceChild(errBtn, pluginElement.querySelector('.deletePlugin'))
  pluginElement.querySelector('.pluginName').appendChild(strToDom('<span class="err">(Plugin will be removed on next reload)</span>'))
  savePlugins()
}

function savePlugins() {
  fetch('/api/me/plugins', {
    credentials: 'include',
    method: 'POST',
    body: JSON.stringify(fling.user.plugins),
    headers: new Headers({
      'Content-Type': 'application/json'
    })
  }).then(r => {return r.json()}).then(res => {
    // toaster.toast('saved plugins!')
  })
}
