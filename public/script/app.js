/* eslint-env browser */
/* global requireModules */


window.onload = () => {

  let fling = {overlay: document.querySelector('body .overlay')}

  window.fling = fling

  // require base modules
  requireModules.root = '/base/'
  requireModules([
    'proxy',
    'actionbar',
    'settings',
    'user',
    'plugins'
  ], function() {
    let plugins

    if (fling.user) {
      plugins = fling.user.plugins.slice(0)
    } else {
      plugins = [
        'todo',
        'weather',
        'redditbackground',
        'clock'
      ]
    }

    requireModules.root = '/modules/'
    requireModules(plugins)
  })

}
