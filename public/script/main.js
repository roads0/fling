window.onload = load

function load() {
  // Set time
  updateClock()
  setInterval(updateClock, 250)

  // Fetch background
  setBackground()

  // Fetch User Information
  getUser()
  setEventListeners()

  // Weather
  getWeather()
}

function updateClock() {
  document.querySelector('.weekday').innerText = moment().format('dddd')
  document.querySelector('.time').innerHTML = moment().format('hh:MM[<div class="small">]A[</div>]')
  document.querySelector('.date').innerText = moment().format('D MMMM YYYY')
}

function setBackground() {
  fetch('/api/background', {credentials: 'include'}).then(r => {return r.blob()}).then(bg => {
    const reader = new FileReader()
    reader.onloadend = () => {
      document.querySelector('.bg').style['background-image'] = `url("${reader.result}")`
      // Hide the loadbox
      document.querySelector('.loadFS').classList.add('hidden')

    }
    reader.readAsDataURL(bg)
  });
}

function getUser() {
  fetch('/api/me', {credentials: 'include'}).then(r => {return r.json()}).then(res => {
    if(res == 'log in you dumbo') {
      // Do the login prompt!
    } else {
      document.querySelector('.todo').style.top = `${-document.querySelector('.todo .list').clientHeight}px`
      console.log(document.querySelector('.todo').style.top, -document.querySelector('.todo .list').clientHeight)
    }
  });
}

function getWeather(location) {
  if ('geolocation' in navigator) {
    navigator.geolocation.getCurrentPosition(function(position) {
      fetch(`/api/weather/${position.coords.latitude},${position.coords.longitude}`).then(r => {return r.json()}).then(res => {
        document.querySelector('.weather').innerHTML = `<div class="location">${res.location.name}</div><div class="current"><i class="weathericon fas fa-${iconType(res.current.skycode)}"></i><div class="temp">${res.current.temperature}°${res.location.degreetype}</div></div>`
      })
    });
  } else {
    document.querySelector('.weather').innerText = 'Location not avalible'
  }
}

function setEventListeners() {
  document.querySelector('.handle').addEventListener('click', () => {
    console.log('rad')
    var active = document.querySelector('.todo.active') ? true : false
    document.querySelector('.todo').style.top = (active ? `${-document.querySelector('.todo .list').clientHeight}px` : 0)
    document.querySelector('.todo').classList.toggle('active')
  })
}

function iconType(skycode) {
  switch (Number(skycode)) {
    case 0:
    case 1:
    case 2:
    case 3:
    case 4:
    case 17:
    case 35:
    case 37:
    case 38:
    case 47:
      return 'bolt'
      break;
    case 5:
    case 6:
    case 7:
    case 8:
    case 9:
    case 13:
    case 14:
    case 15:
    case 16:
    case 25:
    case 41:
    case 42:
    case 43:
    case 46:
     return 'snowflake'
     break;
    case 11:
    case 12:
    case 13:
    case 18:
    case 39:
    case 40:
    case 45:
      return 'tint'
      break;
    case 19:
    case 20:
    case 21:
    case 22:
      return 'align-right'
      break;
    case 26:
    case 27:
    case 28:
    case 29:
    case 30:
    case 33:
    case 34:
     return 'cloud'
     break;
    case 31:
    case 32:
    case 36:
      return 'sun'
      break;
    default:
      return 'question'
  }

}

// XXX: function rotation nation () _{{{{{{{{{{%212!@$!!#%%%%%!#%^^^^^^^^^^^^^^{{{{}}}}}}}}}}}}}}}}}}}}}}}}}}}}} awe yeah baybe}}}}}}}}}}}}}}}}}}}}}}}}}}}}
