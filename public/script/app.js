/* eslint-env browser */
/* global require, utils */


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
  ], () => {
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
    require.many(plugins, () => {

      utils.addCss(`.settings .deps{
        -webkit-column-count: 2;
        -moz-column-count: 2;
        column-count: 2;
        -webkit-column-gap: 40px;
        column-gap: 40px;
        -moz-column-gap: 40px;
        }`)

      let infodom = fling.settings.appendChild(utils.strToDom(`<div class="section" module="fling">
      <h1>Info</h1>
      <p>Fling is open source under GPL V3, and source code can be found at <a href="https://github.com/roads0/fling">https://github.com/roads0/fling</a></p>
      <br>
      <a class="btn" href="https://github.com/roads0/fling"><i class="fab fa-github-alt"></i> Source</a>
      <br><br>
      </div>`))

      fetch('/api/pkg.json').then((res) => res.json())
        .then((res) => {
          infodom.appendChild(utils.strToDom('<p>Fling uses the following dependencies:</p>'))
          let deps = infodom.appendChild(utils.strToDom('<ul class="deps"></ul>'))
          Object.keys(res.dependencies).forEach((key) => {
            let url = `https://www.npmjs.com/package/${key}`
            if (res.dependencies[key].startsWith('github:')) {
              url = `https://github.com/${res.dependencies[key].split(':')[1]}`
            }
            deps.appendChild(utils.strToDom(`<li><a href="${url}" target="_blank">${key}</a></li>`))
          })
        })
    })
  })

}
