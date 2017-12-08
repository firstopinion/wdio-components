'use strict'

/* -----------------------------------------------------------------------------
 * dependencies
 * -------------------------------------------------------------------------- */

// 3rd party
const { findLast } = require('lodash')

// lib
const ComponentResolver = require('../../support/component-resolver')
const Component = require('../component')

/* -----------------------------------------------------------------------------
 * WebComponentResolver
 * -------------------------------------------------------------------------- */

module.exports = class NativeComponentResovler extends ComponentResolver {
  static get defaultComponents () {
    return [{
      Component: Component,
      check: __ => true
    }]
  }

  resolve (el) {
    return findLast(this.components, c => c.check())['Component']
  }
}
