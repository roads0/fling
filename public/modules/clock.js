fetch('/lib/moment.js').then(r => {return r.text()}).then(res => {
  eval(res)

  utils.addCss(`.overlay .clock {
    position: absolute;
    bottom: 4px;
    left: 4px;
    color: #EEE;
    padding: 24px 24px 4px 4px;
    font-size: 18px; }
    .overlay .clock .time {
      display: flex;
      font-size: 64px;
      color: #FFF;
      align-items: flex-end;
      font-weight: lighter; }
      .overlay .clock .time .small {
        font-size: 18px;
        padding-left: 4px;
        padding-bottom: 8px;
        font-weight: normal; }`)

  fling.overlay.appendChild(utils.strToDom('<div class="clock"><div class="date"></div><div class="time"><div class="small"></div></div></div>'))

  function updateClock() {
    document.querySelector('.date').innerText = moment().format('dddd, D MMMM YYYY')
    document.querySelector('.time').innerHTML = moment().format('hh:mm[<div class="small">]A[</div>]')
    setTimeout(updateClock, 500)
  }

  updateClock()

}).catch(err => {
  throw err
})
