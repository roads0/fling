/* eslint-env browser */

fetch.proxy = function (url, options) {
  return fetch(`/proxy?${url}`, options)
}

fetch.nobrowser = function (url, options) {
  return fetch(`/proxy/nobrowser?${url}`, options)
}
