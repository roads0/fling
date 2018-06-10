/* eslint-env browser */
/* global fling, utils */
/* max-len off */

let redditsettings = fling.settings.appendChild(utils.strToDom(`
  <div class="section" module="background">
  <h1>Background Settings</h1>
  <p>Where to get background pictures from (subreddits)</p>
  <input name="subreddits" class="subreddits" type="text" placeholder="pics, dankememes, prequelmemes">
  </div>
`))

if (fling.user && fling.user.settings.background && fling.user.settings.background.subreddits.length) {
  redditsettings.querySelector('.subreddits').value = fling.user.settings.background.subreddits.join(', ')
}

fling.settings.registerPresave((settings) => {
  fling.user.settings.background.subreddits = fling.user.settings.background.subreddits.split(',')
})

function getSubreddit() {
  let subreddit

  if (fling.user && fling.user.settings.background && fling.user.settings.background.subreddits) {
    var subreddits = fling.user.settings.background.subreddits
    subreddit = subreddits[Math.floor(Math.random() * subreddits.length)]
  } else {
    var subreddits = [
      'EarthPorn',
      'SpacePorn',
      'ExposurePorn'
    ]
    subreddit = subreddits[Math.floor(Math.random() * subreddits.length)]
  }

  return subreddit
}

function getListing(subreddit, cb) {
  fetch.proxy(`https://reddit.com/r/${subreddit}.json`).then((r) => r.json()).
    then((res) => {
      cb(res)
    }).
    catch((err) => {
      throw err
    })
}

function setBackground() {
  // fetch('/api/background', {credentials: 'include'}).then(r => {
  //   // console.log(JSON.parse(decodeURI(r.headers.get('X-More-Info'))))
  //   return r.blob()
  // }).then(bg => {
  //   const reader = new FileReader()
  //   reader.onloadend = () => {
  //     utils.addCss(`.bg { background-image: url("${reader.result}") }`)
  //     // Hide the loadbox
  //     setTimeout(() => {
  //       document.querySelector('.loadFS').classList.add('hidden')
  //     }, 500)
  //   }
  //   reader.readAsDataURL(bg)
  // }).catch(err => {
  //   showErr(err.message)
  //   utils.addCss('.bg { background-image: url("/images/nopic.png") }')
  // })

  getListing(getSubreddit(), (res) => {
    let posts = res.data.children

    let imgPosts = posts.filter((post) => {
      let ext = post.data.url.split('.').pop()

      return (/jpg|jpeg|png|webp|bmp|svg|gif/i).test(ext)
    }).map((p) => p.data)

    let post = imgPosts[Math.floor(Math.random() * imgPosts.length)]

    fetch.proxy(post.url).then((r) => r.blob()).
      then((bg) => {
        const reader = new FileReader()
        reader.onloadend = () => {
          utils.addCss(`.bg { background-image: url("${reader.result}") }`)
          // hide the loadbox
          setTimeout(() => {
            document.querySelector('.loadFS').classList.add('hidden')
          }, 500)
        }
        reader.readAsDataURL(bg)
      }).
      catch((err) => {
        toaster.err('Reddit Backgrounds', err.message)
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
