/* eslint-env browser */
/* global require */


window.onload = () => {

  let fling = {overlay: document.querySelector('body .overlay')}

  window.fling = fling

  // require base modules
  require.root = '/base/'
  require.many([
    'proxy',
    'toaster',
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

    require.root = '/modules/'
    require.many(plugins)
  })

}
