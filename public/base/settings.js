/* eslint-env browser */
/* global utils, fling, toaster */

let settings = utils.strToDom('<div class="settings"><div class="close-btn"><i class="fas fa-times"></i></div></div>')

utils.addCss(`
  .settings {
  position: absolute;
  top: -100%;
  left: 0;
  z-index: 20;
  width: 100%;
  height: 100%;
  color: #fff;
  background: rgba(34, 34, 34, 0.9);
  opacity: 0;
  transition: 0.5s;
  overflow-y: scroll;
  -webkit-touch-callout: none;
  -webkit-user-select: none;
  -khtml-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
  user-select: none; }
  .settings p {
    margin: 6px 0px; }
  .settings .btn {
    text-decoration: none;
    padding: 6px;
    margin: 4px 4px 4px 0px;
    border: 1px solid #fff;
    border-radius: 3px;
    color: #fff;
    box-sizing: border-box; }
  .settings .close-btn {
    margin: 12px 24px;
    padding: 0px;
    position: fixed;
    top: 0;
    right: 0;
    z-index: 40;
    font-size: 24px; }
  .settings > div.section {
    margin: 24px 25%;
    padding: 0px 4px 32px 4px; }
    .settings div h1 {
      font-weight: lighter;
      margin: 8px 0px; }
  .settings > div.section:not(:last-child):not(:first-child) {
    border-bottom: 1px dashed #888; }
  .settings .login-prompt {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    margin: 18px 0px; }
    .settings .login-prompt p {
      margin: 0;
      margin-bottom: 10px; }
  .settings input[type="text"], .settings input[type="password"] {
    background: transparent;
    border: none;
    border-bottom: 1px solid #fff;
    width: 100%;
    margin-top: 8px;
    color: #fff; }
  .settings input[type="text"]:focus {
    outline: none; }

.settings.show {
  top: 0;
  left: 0;
  opacity: 1; }
`)

let preSaveArr = []

document.body.appendChild(settings)

settings.open = () => {
  settings.classList.add('show')
}

settings.close = () => {
  settings.classList.remove('show')
  settings.save()
}

settings.registerPresave = (func) => {
  if (utils.toType(func) === 'function') {
    preSaveArr.push(func)
  } else {
    throw new Error('Passed preSaveArr argument was not a function!')
  }
}

settings.querySelector('.close-btn').addEventListener('click', settings.close)

fling.actionbar.appendChild(utils.strToDom('<div class="btn settings-btn"><i class="fas fa-cog"></i></div>')).addEventListener('click', () => {
  settings.open()
})

function getFnArgs(func) {
  let start = func.toString().split('{')[0]
  let args
  if (start.includes('(')) {
    args = start.split('(')[1].split(')')[0].split(',')
  } else {
    args = [start.split('=>')[0].replace(/ /g, '')]
  }

  return args
}

function preSave(newsettings, cb) {
  function preSaveLoop(funcs) {
    if (funcs[0]) {
      let func = funcs.shift()
      if (getFnArgs(func).length === 2) {
        func(newsettings, () => {
          preSaveLoop(funcs)
        })
      } else {
        func(newsettings)
        preSaveLoop(funcs)
      }
    } else {
      cb(newsettings)
    }
  }

  preSaveLoop(preSaveArr)
}

function postSave(newSettings, res, cb) {
  settings.dispatchEvent(new CustomEvent("update", {detail: newSettings}))
  toaster('Settings', 'Your settings were saved.')
  if (utils.toType(cb) === 'function') {
    cb()
  }
}

function save(cb) {
  let newSettings = {}
  settings.querySelectorAll('.section').forEach((section) => {
    if (section.querySelector('input')) {
      let sectionSettings = {}
      section.querySelectorAll('input:not([ignore])').forEach((input) => {
        let key = input.getAttribute('name') || input.id
        if (key) {
          sectionSettings[key] = input.value
        }
      })
      newSettings[section.getAttribute('module')] = sectionSettings
    }
  })

  if (fling.user) {
    fling.user.settings = newSettings
  }

  preSave(newSettings, (updatedSettings) => {
    fetch('/api/me/settings', {
      credentials: 'include',
      method: 'POST',
      body: JSON.stringify(updatedSettings),
      headers: new Headers({'Content-Type': 'application/json'})
    }).then((res) => res.json())
      .then((res) => {
        postSave(newSettings, res, cb)
      })
  })
}

settings.save = save

fling.settings = settings
