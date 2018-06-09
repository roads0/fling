/* eslint-env browser */

function toType(obj) {
  return ({}).toString.call(obj).match(/\s([a-zA-Z]+)/)[1].toLowerCase()
}

function strToDom(str) {
  return new DOMParser().parseFromString(str, "text/html").body.childNodes[0]
}

var styleElement = document.createElement('style')
document.head.appendChild(styleElement)
var stylesheet = styleElement.sheet

function addCss (css) {
  try {
    var currentRule = ""
    var bracketDepth = 0
    var rulesOpened = false
    for (var i in css) {
      var char = css[i]

      if(char == "{") {++bracketDepth; rulesOpened = true}
      if(char == "}") --bracketDepth

      currentRule += char

      if(bracketDepth == 0 && rulesOpened) {
        try {
          stylesheet.insertRule(currentRule)
        } catch (err) {
          throw err
        }
        currentRule = ""
        rulesOpened = false
      } else if(i == css.length) {
        throw new Error('You have unmatched brackets!')
      }
    }

    return true
  } catch (err) {
    throw err
  }
}

var utils = {
  toType,
  strToDom,
  addCss
}

window.utils = utils
