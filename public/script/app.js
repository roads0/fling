/* eslint-env browser */

window.onload = () => {

window.fling = {
  overlay: document.querySelector('body .overlay')
}

// require base modules
requireModules.root = '/base/'
requireModules(['actionbar', 'settings', 'user', 'plugins'], function() {
  var plugins

  if(fling.user) {
    plugins = fling.user.plugins.slice(0);
  } else {
    plugins = ['todo', 'weather', 'redditbackground', 'clock']
  }

  requireModules.root = '/modules/'
  requireModules(plugins)
})


}
