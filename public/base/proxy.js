/* eslint-env browser */

fetch.proxy = function (url, options) {
  return fetch(`/proxy?${url}`, options)
}
