'use strict'

/* -----------------------------------------------------------------------------
 * dependencies
 * -------------------------------------------------------------------------- */

// lib
const Component = require('./component')

/* -----------------------------------------------------------------------------
 * Field
 * -------------------------------------------------------------------------- */

module.exports = class Field extends Component {
  fill (val) {
    this.setValue(val)
    return this
  }

  read () {
    return this.getValue()
  }

  /* ---------------------------------------------------------------------------
   * data accessors
   * ------------------------------------------------------------------------ */

  getValue () {
    return this.getAttribute('value')
  }

  /* ---------------------------------------------------------------------------
   * checks
   * ------------------------------------------------------------------------ */

  hasValue (expected) {
    return this.getValue() === expected
  }
}
