/* eslint-env browser */
/* global utils */

utils.addCss(`
  .toaster {
    position: absolute;
    top: 12px;
    left: 12px;
    display: flex;
    flex-direction: column;
    z-index: 999;
    width: 350px;
    max-width: calc(100vw - 24px);
  }

  .toast {
    position: relative;
    margin: 6px 0;
    display: block;
    flex-direction: column;
    background: rgba(34, 34, 34, 0.7);
    color: #fff;
    border-left: 6px solid rgba(34, 34, 34, 1);
    border-radius: 4px;
    padding: 6px;
    overflow: hidden;
    transform-origin: top 4px 48px;
    animation: 0.25s flip;
    height: 100%;
    box-sizing: border-box;
  }

  .toast.hide {
    animation: 0.25s flipOut;
  }

  .toast h1 {
    margin: 1px 0;
    font-weight: normal;
  }

  .toast p {
    margin: 4px 0;
    font-weight: normal;
  }

  .toast p.info {
    font-style: italic;
    font-size: 80%;
  }

  @keyframes flip {
    0% {
      transform: rotateX(-45deg) scale(0.75);
      opacity: 0;
    }

    100% {
      transform: rotateX(0deg) scale(1);
      opacity: 1;
    }
  }

  @keyframes flipOut {
    0% {
      transform: scaleY(1) scaleX(1);
      opacity: 1;
      max-height: 100%;
    }

    100% {
      transform: scaleY(0) scaleX(0.75);
      opacity: 0;
      height: 0px;
      padding: 0px 6px;
      margin: 0;
      margin-bottom: -25%;
    }
  }

`)

let toasterEle = document.body.appendChild(utils.strToDom('<div class="toaster"></div>'))

function animationTime(element) {
  let durString = window.getComputedStyle(element)['animation-duration']
  if (durString.endsWith('s')) {
    return parseFloat(durString) * 1000
  }
}

function toaster(title, desc, timeout) {
  let toast
  if (desc) {
    toast = toasterEle.appendChild(utils.strToDom(`
      <div class="toast">
      <h1>${title}</h1>
      <p>${desc}</p>
      </div>`))
  } else {
    toast = toasterEle.appendChild(utils.strToDom(`
      <div class="toast">
      <p>${title}</p>
      </div>`))
  }
  setTimeout(() => {
    toast.classList.add('hide')
    setTimeout(() => {
      toast.remove()
    }, animationTime(toast))
  }, timeout || 7500)
}

window.toaster = toaster
