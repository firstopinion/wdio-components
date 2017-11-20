'use strict'

/* -----------------------------------------------------------------------------
 * dependencies
 * -------------------------------------------------------------------------- */

// 3rd party
const { map } = require('lodash')

// lib
const Component = require('./component')

/* -----------------------------------------------------------------------------
 * List
 * -------------------------------------------------------------------------- */

module.exports = class List extends Component {
  get children () {
    return {
      'item': ':scope > li'
    }
  }

  /* ---------------------------------------------------------------------------
   * data accessors
   * ------------------------------------------------------------------------ */

  getLength () {
    return this.items().length
  }

  pluck (prop) {
    return map(this.items(), item => item.prop(prop))
  }

  /* ---------------------------------------------------------------------------
   * find
   * ------------------------------------------------------------------------ */

  items () {
    return this.$$('@child.item')
  }

  firstItem () {
    return this.first('@child.item')
  }

  nthItem (n) {
    return this.nth('@child.item', n)
  }

  lastItem () {
    return this.last('@child.item')
  }

  /* ---------------------------------------------------------------------------
   * utils
   * ------------------------------------------------------------------------ */

  waitUntilLength (length) {
    return driver.waitUntil(this.isLength.bind(this, length))
  }

  isLength (length) {
    return this.getLength() === length
  }
}
