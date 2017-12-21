'use strict'

/* -----------------------------------------------------------------------------
 * dependencies
 * -------------------------------------------------------------------------- */

// 3rd party
const { findLast } = require('lodash')

// lib
const ComponentResolver = require('../../support/component-resolver')
const Component = require('../component')
const Field = require('../field')

/* -----------------------------------------------------------------------------
 * WebComponentResolver
 * -------------------------------------------------------------------------- */

module.exports = class NativeComponentResolver extends ComponentResolver {
  static get defaultComponents () {
    return [{
      Component: Component,
      check: __ => true
    }, {
      Component: Field,
      check: el => el.selector.endsWith('Input')
    }]
  }

  resolve (el) {
    return findLast(this.components, c => c.check(el))['Component']
  }
}
