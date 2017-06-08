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
  if (e.keyCode == 13) {
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

if (localStorage.location) {
  superagent.get('/api/weather/' + localStorage.location).end((err, res) => {
    document.getElementById('weather').innerHTML = `<h2>${res.body.location.name}</h2><p>${res.body.current.temperature}, ${res.body.current.skytext}</p>`
  })
} else {
  document.getElementById('weather').innerHTML = '<h2>No Location Set</h2>'
}

function settings() {
  if (document.getElementById('settings').style['margin-top'] == '23.5%') {
    document.getElementById('settings').style['margin-top'] = '100%';
  } else {
    document.getElementById('settings').style['margin-top'] = '23.5%';
  }
}

var imagebank
try {
  imagebank = JSON.parse(localStorage.images);
} catch (e) {
  imagebank = ['https://splitpixl.xyz/assets/images/paloose.jpg', 'http://i.imgur.com/jgh1fin.jpg', 'http://i.imgur.com/fiRAOFe.jpg', 'http://i.imgur.com/SIk9LkV.jpg']
}

var slideTimeout = localStorage.swapTime || 15;

function rotationNation(i) {
  if (i == imagebank.length - 1) {
    i = 0
  } else {
    i++
  }
  document.getElementById("container").style["background-image"] = `url(${imagebank[i]})`
  console.log(i)
  setTimeout(rotationNation(i), 1000)
}

function printValue(sliderID, textbox) {
    var x = document.getElementById(textbox);
    var y = document.getElementById(sliderID);
    x.value = y.value;
    document.getElementById('container').style.filter = `blur(${x.value}px)`
}

window.onload = function() {
  printValue('blurSlide', 'blurVal');
}
