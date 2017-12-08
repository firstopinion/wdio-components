'use strict'

/* -----------------------------------------------------------------------------
 * dependencies
 * -------------------------------------------------------------------------- */

// lib
const Component = require('../component')

/* -----------------------------------------------------------------------------
 * NativeComponent
 * -------------------------------------------------------------------------- */

module.exports = class NativeComponent extends Component {
  static get ComponentResolver () {
    // TODO: Temporary hack to avoid circular dependencies... May be a more
    // elegant way to solve this?
    return require('./support/component-resolver')
  }
}
