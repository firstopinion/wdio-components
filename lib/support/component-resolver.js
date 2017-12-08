'use strict'

/* -----------------------------------------------------------------------------
 * dependencies
 * -------------------------------------------------------------------------- */

// 3rd party
const { findIndex, remove } = require('lodash')

/* -----------------------------------------------------------------------------
 * Component
 * -------------------------------------------------------------------------- */

module.exports = class ComponentResovler {
  static get defaultComponents () {
    throw new Error('Must define defaultComponents on Component')
  }

  constructor () {
    this.components = this.constructor.defaultComponents
  }

  resolve (el) {
    throw new Error('Must define resolve method for Component')
  }

  addComponent (ComponentClass, check) {
    this.components.push({
      Component: ComponentClass,
      check: check
    })
  }

  removeComponent (ComponentClass) {
    remove(this.components, c => c.Component === ComponentClass)
    return this
  }

  replaceComponent (ComponentClass, NewComponentClass) {
    const i = findIndex(this.components, c => c.Component === ComponentClass)
    if (i) {
      this.components[i]['Component'] = NewComponentClass
    } else {
      throw new Error('Component does not exist')
    }

    return this
  }

  alterComponent (ComponentClass, check) {
    const i = findIndex(this.components, c => c.Component === ComponentClass)
    if (i) {
      this.components[i]['check'] = check
    } else {
      throw new Error('Component does not exist')
    }

    return this
  }
}
