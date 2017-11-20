'use strict'

/* -----------------------------------------------------------------------------
 * dependencies
 * -------------------------------------------------------------------------- */

// lib
const Field = require('./field')

/* -----------------------------------------------------------------------------
 * Checkbox
 * -------------------------------------------------------------------------- */

module.exports = class Checkbox extends Field {
  fill (val) {
    if (this.el.isSelected() !== !!val) {
      this.el.click()
    }

    return this
  }

  read () {
    return this.el.isSelected()
      ? this.getValue()
      : undefined
  }
}
