'use strict'

/* -----------------------------------------------------------------------------
 * retry
 * -------------------------------------------------------------------------- */

const defaults = {
  interval: 100,
  timeout: 5000
}

module.exports = (fn, opts = {}) => {
  const options = Object.assign({}, defaults, opts)
  let err = false
  let exit = false
  let ret

  setTimeout(() => {
    exit = true
  }, options.timeout)

  while (!exit) {
    try {
      ret = fn()
      err = false
      exit = true
    } catch (e) {
      err = e
      driver.pause(options.interval)
    }
  }

  if (err) {
    throw err
  }

  return ret
}
