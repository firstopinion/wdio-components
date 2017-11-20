'use strict'

/* -----------------------------------------------------------------------------
 * dependencies
 * -------------------------------------------------------------------------- */

// 3rd party
const { findIndex, findLast, remove } = require('lodash')

// lib
const Checkbox = require('../checkbox')
const Component = require('../component')
const Field = require('../field')
const Form = require('../form')
const List = require('../list')
const Radio = require('../radio')
const Select = require('../select')
const serializeElementScript = require('../scripts/serialize-element')

/* -----------------------------------------------------------------------------
 * Component
 * -------------------------------------------------------------------------- */

module.exports = class ComponentResovler {
  static get defaultComponents () {
    return [{
      Component: Component,
      check: __ => true
    }, {
      Component: List,
      check: info => info['tagName'] === 'ul' || info['tagName'] === 'ol'
    }, {
      Component: Form,
      check: info => info['tagName'] === 'form'
    }, {
      Component: Field,
      check: info => info['tagName'] === 'input' || info['tagName'] === 'textarea'
    }, {
      Component: Select,
      check: info => info['tagName'] === 'select'
    }, {
      Component: Checkbox,
      check: info => info['tagName'] === 'input' && info.attributes['type'] === 'checkbox'
    }, {
      Component: Radio,
      check: info => info['tagName'] === 'input' && info.attributes['type'] === 'radio'
    }]
  }

  constructor () {
    this.components = this.constructor.defaultComponents
  }

  resolve (el) {
    const info = driver.execute(serializeElementScript, el.value).value
    return findLast(this.components, c => c.check(info))['Component']
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
    } {
      throw new Error('Component does not exist')
    }

    return this
  }

  alterComponent (ComponentClass, check) {
    const i = findIndex(this.components, c => c.Component === ComponentClass)
    if (i) {
      this.components[i]['check'] = check
    } {
      throw new Error('Component does not exist')
    }

    return this
  }
}
