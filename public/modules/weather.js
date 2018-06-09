/* eslint-env browser */
/* global fling, utils */

var weatherEle = utils.strToDom('<div class="weather"></div>')

utils.addCss(`
  .overlay .weather {
    position: absolute;
    bottom: 8px;
    right: 8px;
    color: #fff;
    display: flex;
    flex-direction: column;
    align-items: flex-end; }
    .overlay .weather .current {
      display: flex;
      align-items: center; }
      .overlay .weather .current .weathericon {
        font-size: 28px;
        margin-right: 8px; }
      .overlay .weather .current .temp {
        font-size: 36px;
        font-weight: 200; }`)

fling.overlay.appendChild(weatherEle)

if(fling.user) {
  var unit
  if(fling.user.settings.temperature) {
    unit = fling.user.settings.temperature.unit
  } else {
    unit = 'F'
  }
  fling.settings.appendChild(utils.strToDom(`<div class="section" module="temperature">
  <h1>Temperature Settings</h1>
  <p>Use Fahrenheight or Celsius</p>
  <input type="radio" name="unit" id="tempF" value="F" ${unit == 'F' ? 'checked' : ''}><label for="tempF">Fahrenheight</label>
  <br>
  <input type="radio" name="unit" id="tempC" value="C" ${unit == 'C' ? 'checked' : ''}><label for="tempC">Celsius</label>
  </div>`))
} else {
  fling.settings.appendChild(utils.strToDom(`<div class="section" module="temperature">
  <h1>Temperature Settings</h1>
  <p>Use Fahrenheight or Celsius</p>
  <input type="radio" name="unit" id="tempF" value="F" checked><label for="tempF">Fahrenheight</label>
  <br>
  <input type="radio" name="unit" id="tempC" value="C"><label for="tempC">Celsius</label>
  </div>`))
}

fling.settings.addEventListener('update', (settings) => {
  console.log(settings.detail)
})

function getWeather(location) {
  if ('geolocation' in navigator && window.location.protocol == 'https:') {
    document.querySelector('.weather').innerText = 'Loading...'
    navigator.geolocation.getCurrentPosition(function(position) {
      fetch(`/api/weather/${position.coords.latitude},${position.coords.longitude}`, {credentials: 'include'}).then(r => {return r.json()}).then(res => {
        weatherEle.innerHTML = `<div class="location">${res.location.name}</div><div class="current"><i class="weathericon fas fa-${iconType(res.current.skycode)}"></i><div class="temp">${res.current.temperature}°${res.location.degreetype}</div></div>`
      }).catch(err => {
        console.error(err);
        document.querySelector('.weather').innerText = 'Location not avalible'
      })
    });
  } else {
    document.querySelector('.weather').innerText = 'Location not avalible'
  }
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

getWeather()
