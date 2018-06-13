/* eslint-env browser */
/* global utils */

(function() {

  function evalBetter(str, src) {
    try {
      // return eval(`${str}\n\n//@ sourceURL=${src}`) // eslint-disable-line
      return eval(`${str}\n\n//@ sourceURL=${src}`)
    } catch (err) {
      console.error(err)

      return null
    }
  }

  function nameToPath(name, opts) {
    opts = opts || {} // eslint-disable-line no-param-reassign
    let modPath = name
    if (!(modPath.startsWith('https://') || modPath.startsWith('http://') || modPath.startsWith('/'))) {
      modPath = (opts.root || '/modules/') + modPath
    }
    if (!modPath.endsWith(opts.ext || '.js')) {
      modPath += opts.ext || '.js'
    }

    return new URL(modPath, location.origin).href
  }

  let modules = {
    loaded: [],
    failed: []
  }

  window.modules = modules

  function require(name, cb) {
    let modPath = nameToPath(name, {root: require.root})
    fetch(modPath).then((res) => res.text())
      .then((res) => {
        try {
          cb(evalBetter(res, modPath))
          modules.loaded.push(modPath)
        } catch (err) {
          cb(null, err)
          modules.failed.push(modPath)
          console.error(`Failed to load module ${modPath}:\n${err.message}\n${modPath}:${err.lineNumber}:${err.columnNumber}\n${err.stack}`)
        }
      })
      .catch((err) => {
        cb(null, err)
        modules.failed.push(modPath)
        console.error(`Failed to get module ${modPath}:\n${err.message}`)
      })
  }

  require.many = (mods, cb) => {
    if (Array.isArray(mods)) {
      if (mods.length > 0) {
        let mod = mods.shift()
        require(mod, (loadedMod, err) => {
          if (err) {
            console.error(err)
            require.many(mods, cb)
          } else {
            require.many(mods, cb)
          }
        })
      } else if (utils.toType(cb) === 'function') {
        try {
          cb()
        } catch (err) {
          throw err
        }
      }
    } else {
      throw new Error('first argument must be array of modules')
    }
  }

  require.manyAsync = (mods, cb) => {
    if (Array.isArray(mods)) {
      if (mods.length > 0) {
        let mod = mods.shift()
        require(mod, (loadedMod, err) => {
          if (err) {
            console.error(err)
          }
        })
        require.manyAsync(mods, cb)
      } else if (utils.toType(cb) === 'function') {
        try {
          cb()
        } catch (err) {
          throw err
        }
      }
    } else {
      throw new Error('first argument must be array of modules')
    }
  }

  require.nameToPath = nameToPath

  window.require = require
  window.modules = modules

}())
