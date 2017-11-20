'use strict'

/* -----------------------------------------------------------------------------
 * dependencies
 * -------------------------------------------------------------------------- */

// lib
const Field = require('./field')

/* -----------------------------------------------------------------------------
 * Select
 * -------------------------------------------------------------------------- */

module.exports = class Select extends Field {
  fill (val) {
    try {
      this.el.selectByValue(val)
    } catch (e) {
      try {
        this.el.selectByVisibleText(val)
      } catch (e) {
        throw new Error('Unable to select element')
      }
    }

    return this
  }
}
