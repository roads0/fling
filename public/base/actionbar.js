/* eslint-env browser */
/* global fling, utils */

utils.addCss(`
.overlay > .actionbar {
  position: absolute;
  top: 0;
  right: 0;}
  .actionbar {
    display: flex;
    flex-direction: row;
    font-size: 24px;
    color: #fff;
    margin-top: 4px;}
    .actionbar .btn {
      margin-right: 4px;
      margin-left: 4px;
      cursor: pointer; }`)

let actionbar = fling.overlay.appendChild(utils.strToDom(`<div class="actionbar"></div>`))

fling.actionbar = actionbar
