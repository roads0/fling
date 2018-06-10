/* eslint-env browser */
/* global fling, utils */

let redditsettings

if (fling.user) {
  redditsettings = fling.settings.appendChild(utils.strToDom(`
  <div class="section" module="background">
  <h1>Background Settings</h1>
  <p>Where to get background pictures from (subreddits)</p>
  <input name="subreddits" class="subreddits" type="text" placeholder="pics, dankememes, prequelmemes">
  </div>
  `))
}

if (fling.user && fling.user.settings.background && utils.toType(fling.user.settings.background.subreddits) === 'array' && !fling.user.settings.background.subreddits[0] === "") {
  redditsettings.querySelector('.subreddits').value = fling.user.settings.background.subreddits.join(', ')
} else if (fling.user && fling.user.settings.background && utils.toType(fling.user.settings.background.subreddits) === 'string') {
  fling.user.settings.background.subreddits = fling.user.settings.background.subreddits.replace(/ /g, '').split(',')
  redditsettings.querySelector('.subreddits').value = fling.user.settings.background.subreddits.join(', ')
} else if (fling.user.settings.background) {
  fling.user.settings.background.subreddits = [
    'EarthPorn',
    'SpacePorn',
    'ExposurePorn'
  ]
  redditsettings.querySelector('.subreddits').value = fling.user.settings.background.subreddits.join(', ')
} else if (fling.user) {
  fling.user.settings.background = {
    subreddits: [
      'EarthPorn',
      'SpacePorn',
      'ExposurePorn'
    ]
  }
}

fling.settings.registerPresave((settings) => {
  if (fling.user) {
    if (settings.background.subreddits === "") {
      settings.background.subreddits = [
        'EarthPorn',
        'SpacePorn',
        'ExposurePorn'
      ]
    } else {
      settings.background.subreddits = settings.background.subreddits.replace(/ /g, '').split(',')
    }
  }
})

function getSubreddit() {
  let subreddit

  if (fling.user && fling.user.settings.background && fling.user.settings.background.subreddits) {
    let subreddits = fling.user.settings.background.subreddits
    subreddit = subreddits[Math.floor(Math.random() * subreddits.length)]
  } else {
    let subreddits = [
      'EarthPorn',
      'SpacePorn',
      'ExposurePorn'
    ]
    subreddit = subreddits[Math.floor(Math.random() * subreddits.length)]
  }

  return subreddit
}

function getListing(subreddit, cb) {
  fetch.proxy(`https://reddit.com/r/${subreddit}.json`).then((res) => res.json())
    .then((res) => {
      cb(res)
    })
    .catch((err) => {
      throw err
    })
}

function setBackground() {
  getListing(getSubreddit(), (subreddit) => {
    let posts = subreddit.data.children

    let imgPosts = posts.filter((post) => {
      let ext = post.data.url.split('.').pop()

      return (/jpg|jpeg|png|webp|bmp|svg|gif/i).test(ext)
    }).map((post) => post.data)

    let post = imgPosts[Math.floor(Math.random() * imgPosts.length)]

    fetch.proxy(post.url).then((res) => res.blob())
      .then((bg) => {
        const reader = new FileReader()
        reader.onloadend = () => {
          utils.addCss(`.bg { background-image: url("${reader.result}") }`)
          // hide the loadbox
          setTimeout(() => {
            document.querySelector('.loadFS').classList.add('hidden')
          }, 500)
        }
        reader.readAsDataURL(bg)
      })
      .catch((err) => {
        // toaster.err('Reddit Backgrounds', err.message)
        console.error(err)
        utils.addCss('.bg { background-image: url("/images/nopic.png") }')
      })
  })
}

setBackground()

// utils.addCss(`
// .bg {
//   background-color: #222;
//   background-image: url(/api/background);
// }`)
//
// document.querySelector('.bg').addEventListener('load', () => {
//   document.querySelector('.loadFS').classList.add('hidden')
// })
