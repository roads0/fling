var slideTimeout = localStorage.swapTime; // in seconds
var slideTimeout = 1; //remove this when integrated fully
var imagebank = localStorage.images;

imagebank = ['https://vignette3.wikia.nocookie.net/smashverse/images/a/a3/Dank_World_Level_69.jpg/revision/latest?cb=20160410191430', 'https://i.ytimg.com/vi/lX6b48Etb3o/maxresdefault.jpg']

rotationNation();

function rotationNation() {
  var i;
  for (i = 0; i < imagebank.length; i++) {
    document.getElementById("container").style["background-image"] = `url(${imagebank[i]})`
  }

  setTimeout(rotationNation, slideTimeout*1000)
}
