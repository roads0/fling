document.getElementById("search").value = ""
var vid = document.getElementById("bgvid");
//vid.onplay = function() {
setTimeout(showmenu() , 500);
//}
function showmenu() {
document.getElementById("title").style.color = "#fff"
document.getElementById("date").style.color = "#fff"
document.getElementById("container").style.webkitFilter  = "blur(25px)"
document.getElementById("ctrl-button").style.opacity = "1"
}
function watchvid() {
document.getElementById("title").style.color = "rgba(0,0,0,0)"
document.getElementById("container").style.webkitFilter  = "blur(0px)"
document.getElementById("ctrl-button").style.opacity = "0"
}
setInterval(function() {
document.getElementById("title").innerHTML = moment().format('h:mm A')
document.getElementById("date").innerHTML = moment().format('dddd, MMMM Do, YYYY')
}, 500);
function search(e) {
if (e.keyCode == 13) {
window.location = "https://google.com/search?q=" + encodeURIComponent(document.getElementById("search").value)
}
}
function todo(e) {
  if (e.keyCode == 13 && document.getElementById("addtodo").value) {
    var id = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      var r = Math.random()*16|0, v = c == 'x' ? r : (r&0x3|0x8);
      return v.toString(16);
    });
    var nextup = `
      <div class="makeeverythinggoodagain"><input type="checkbox" name="${id}"><label for="${id}">${document.getElementById("addtodo").value}</label></div>
    `
    document.getElementById('list').innerHTML += nextup
    document.getElementById("addtodo").value = ""
  }
}

function getWeather() {
  if (JSON.parse(localStorage.settings).location) {
    superagent.get('/api/weather/' + JSON.parse(localStorage.settings).location).end((err, res) => {
      if(!err)
        document.getElementById('weather').innerHTML = `<h2>${res.body.location.name}</h2><p>${res.body.current.temperature}, ${res.body.current.skytext}</p>`
      else {
        document.getElementById('weather').innerHTML = `<h2>Error getting weather</h2>`
      }
    })
  } else {
    document.getElementById('weather').innerHTML = '<h2>No Location Set</h2>'
  }
}

function opensettings() {
  document.getElementById('settings').open = true
  document.getElementById('settings').style['top'] = window.innerHeight - document.getElementById('settings').scrollHeight;
}
function closesettings() {
  document.getElementById('settings').open = false
  document.getElementById('settings').style['top'] = '100%';
  var options = document.getElementsByClassName('option')
  var settings = {updated: new Date().getTime()}
  var i=0,ii=0;
  for (i=0; i<options.length; i++) {
    var optionnodes = options[i].childNodes
    for(ii=0;ii<optionnodes.length; ii++) {
      if(optionnodes[ii].tagName == 'INPUT') {
        settings[optionnodes[ii].name] = optionnodes[ii].value
      }
    }
  }
  localStorage.settings = JSON.stringify(settings)
  if (localStorage.auth){
    superagent.post('/api/settings')
     .send(settings)
     .set('Authorization', localStorage.auth)
     .end()
  }
}

setInterval(rotationNation(), (JSON.parse(localStorage.settings).bgchange || 60) * 1000)

function rotationNation() {
  superagent.get('/api/background')
  .set('Authorization', localStorage.auth)
  .end((err,res) => {
    document.getElementById("container").style["background-image"] = `url(${res.body.preview.images[0].source.url})`
  })
}

function blurSetting(sliderID) {
  var y;
  try {
    var y = JSON.parse(localStorage.settings).blur;
  }
  catch (e) {}

  if (document.getElementById('blurSlide').value !== y) {
    y = document.getElementById('blurSlide').value
  }

  document.getElementById('container').style.filter = `blur(${y}px)`
}

window.onload = function() {
  getSettings()
  fillInValues(JSON.parse(localStorage.settings))
  getWeather()
  blurSetting()
}

function getSettings() {
  var local = JSON.parse(localStorage.settings)
  superagent.get('/api/settings')
  .set('Authorization', localStorage.auth)
  .end((err, res) => {
    if(local.updated < res.body.updated) {
      localStorage.settings = JSON.stringify(res.body)
    }
  })
}

function fillInValues(settings) {
  Object.keys(settings).forEach((setting, index) => {
    if (!!document.getElementsByName(setting)[0]) {
      document.getElementsByName(setting)[0].value = settings[setting]
    }
  })
}

function loginbchange() {
  console.log('sucess')
}
