/*eslint-env browser */

function evalBetter(str) {
  var evalBetterElement = document.createElement('script')
  evalBetterElement.innerHTML = str
  document.head.appendChild(evalBetterElement)
  evalBetterElement.remove()
}

function requireModules(mods, cb) {
  if(!window.loadedModules) window.loadedModules = {}
  if(!window.failedModules) window.failedModules = {}
  if(Array.isArray(mods)) {
    if(mods[0]) {
      var modPath = mods.shift()
      if(!(modPath.startsWith('https://') || modPath.startsWith('http://'))) {
        modPath = (requireModules.root || '/modules/') + modPath
      }
      if(!modPath.endsWith('.js')) {
        modPath = modPath + '.js'
      }
      fetch(modPath).then(r => {return r.text()}).then(res => {
        window.loadedModules[modPath] = evalBetter(`${res}\n\n// ${modPath}`)
        requireModules(mods, cb)
      }).catch(err => {
        console.error(`Failed to load module ${modPath}:\n${modPath}:${err.lineNumber}:${err.columnNumber}\n${err.stack}`);
        window.failedModules[modPath] = err
        requireModules(mods, cb)
      })
    } else {
      if(toType(cb) == 'function') {
        try {
          cb()
        } catch (err) {
          console.error(err)
        }
      }
    }
  } else {
    throw new Error('first argument must be array of modules')
  }
}

window.requireModules = requireModules

function requireModulesAsync(mods, cb) {
  if(!window.loadedModules) window.loadedModules = {}
  if(!window.failedModules) window.failedModules = {}
  if(mods[0]) {
    var modPath = mods.shift()
    if(!(modPath.startsWith('https://') || modPath.startsWith('http://'))) {
      modPath = (requireModulesAsync.root || '/modules/') + modPath
    }
    if(!modPath.endsWith('.js')) {
      modPath = modPath + '.js'
    }
    fetch(modPath).then(r => {return r.text()}).then(res => {
      window.loadedModules[modPath] = evalBetter(`${res}\n\n// ${modPath}`)
    }).catch(err => {
      console.error(`Failed to load module ${modPath}:\n${modPath}:${err.lineNumber}:${err.columnNumber}\n${err.stack}`);
      window.failedModules[modPath] = err
    })
    requireModulesAsync(mods, cb)
  } else {
    if(toType(cb) == 'function') {
      try {
        cb()
      } catch (err) {
        console.error(err)
      }
    }
  }
}

window.requireModulesAsync = requireModulesAsync
