/* eslint-env browser */
/* global fling, utils, toaster */

utils.addCss(`
  .creditWrap {
    position: absolute;
    bottom: -4%;
    left: 0;
    width: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
    padding 0 16em;
    transition: 0.5s;
  }

  .creditWrap:hover {
    bottom: 0%;
  }

  .photocredit {
    text-align: center;
    color: #aaaaaa;
    box-sizing: border-box;
    padding: 8px;
    background: rgba(34, 34, 34, 0.7);
    border-top-left-radius: 6px;
    border-top-right-radius: 6px;
  }

  .photocredit::after {
    content: 'insert_photo';
    font-family: 'Material Icons';
    font-weight: normal;
    font-style: normal;
    font-size: 24px;
    line-height: 1;
    letter-spacing: normal;
    text-transform: none;
    white-space: nowrap;
    word-wrap: normal;
    direction: ltr;
    -webkit-font-smoothing: antialiased;
    position: absolute;
    top: -40px;
    left: 50%;
    color: #fff;
    background: rgba(34, 34, 34, 0.7);
    padding: 10px 10px 6px 10px;
    border-top-left-radius: 24px;
    border-top-right-radius: 24px;
    width: 24px;
    height: 24px;
    transform: translateX(-50%);
  }

  .photocredit a {
    color: #fff;
    text-decoration: none;
  }

  .photocredit a:hover {
    text-decoration: underline;
  }
`)

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

if (fling.user && fling.user.settings.background && utils.toType(fling.user.settings.background.subreddits) === 'array' && !(fling.user.settings.background.subreddits[0] === "")) {
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

  if (fling.user && fling.user.settings.background && fling.user.settings.background.subreddits && fling.user.settings.background.subreddits.length > 0) {
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

/* eslint-disable max-statements */
function findClosest(str, match, index) {
  let int = 0,
    nextindex = NaN,
    previndex = NaN

  if (index > str.lenght) {
    throw new Error('Index is outside of string!')
  }

  for (int = 0; int < index; int++) {
    if (str.substring(int, index).startsWith(match)) {
      previndex = int
    }
  }

  for (int = str.length; int >= index; int--) {
    if (str.substring(index, int).endsWith(match)) {
      nextindex = int
    }
  }

  if (!previndex && !nextindex) {
    return 0
  } else if (nextindex - index > index - previndex) {
    return previndex
  }

  return nextindex
}
/* eslint-enable */

function getListing(subreddit, cb) {
  fetch.proxy(`https://reddit.com/r/${subreddit}/top.json?t=week`).then((res) => res.json())
    .then((res) => {
      cb(res)
    })
    .catch((err) => {
      throw err
    })
}

function setBackground(post, cb) {
  fetch.proxy(post.url).then((res) => res.blob())
    .then((bg) => {
      const reader = new FileReader()
      reader.onloadend = () => {
        utils.addCss(`.bg { background-image: url("${reader.result}") }`)
        // hide the loadbox
        setTimeout(() => {
          document.querySelector('.loadFS').classList.add('hidden')
        }, 500)

        cb()
      }
      reader.readAsDataURL(bg)
    })
    .catch((err) => {
      toaster.err('Reddit Backgrounds', `Couldn't get background image: ${err.message}`)
      console.error(err)
      utils.addCss('.bg { background-image: url("/images/nopic.png") }')
    })
}

function getBackground() {
  let sReddit = getSubreddit()
  getListing(sReddit, (subreddit) => {
    let posts = subreddit.data.children

    let imgPosts = posts.filter((post) => {
      let ext = `.${post.data.url.split('.').pop()}`

      return (/\.jpg|\.jpeg|\.png|\.webp|\.bmp|\.svg/i).test(ext)
    }).map((post) => post.data)

    if (imgPosts.length > 0) {
      let post = imgPosts[Math.floor(Math.random() * imgPosts.length)]
      setBackground(post, () => {
        fling.background = post
        let postcred = fling.overlay.appendChild(utils.strToDom('<div class="creditWrap"><div class="photocredit"><a class="postsubreddit"></a> | <a class="posttitle"></a> | <a class="postauthor"></a></div></div>'))
        postcred.querySelector('.posttitle').innerText = post.title.replace(/\[.+?\]/g, '').trim()
        postcred.querySelector('.posttitle').innerHTML = `${document.querySelector('.posttitle').innerHTML.substring(0, findClosest(document.querySelector('.posttitle').innerHTML, ' ', document.querySelector('.posttitle').innerHTML.length / 2))}<wbr>${document.querySelector('.posttitle').innerHTML.substring(findClosest(document.querySelector('.posttitle').innerHTML, ' ', document.querySelector('.posttitle').innerHTML.length / 2))}`
        postcred.querySelector('.posttitle').href = `https://reddit.com${post.permalink}`
        postcred.querySelector('.postsubreddit').innerText = `r/${post.subreddit}`
        postcred.querySelector('.postsubreddit').href = `https://reddit.com/r/${post.subreddit}`
        postcred.querySelector('.postauthor').innerText = `u/${post.author}`
        postcred.querySelector('.postauthor').href = `https://reddit.com/u/${post.author}`
      })
    } else {
      fling.user.settings.background.subreddits.splice(fling.user.settings.background.subreddits.indexOf(sReddit), 1)
      getBackground()
    }
  })
}

getBackground()
