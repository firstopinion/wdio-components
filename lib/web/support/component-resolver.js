'use strict'

/* -----------------------------------------------------------------------------
 * dependencies
 * -------------------------------------------------------------------------- */

// 3rd party
const { findLast } = require('lodash')

// lib
const ComponentResolver = require('../../support/component-resolver')
const Checkbox = require('../checkbox')
const Component = require('../component')
const Field = require('../field')
const Form = require('../form')
const List = require('../list')
const Radio = require('../radio')
const Select = require('../select')
const serializeElementScript = require('../scripts/serialize-element')

/* -----------------------------------------------------------------------------
 * WebComponentResolver
 * -------------------------------------------------------------------------- */

module.exports = class WebComponentResolver extends ComponentResolver {
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

  resolve (el) {
    const info = driver.execute(serializeElementScript, el.value).value
    return findLast(this.components, c => c.check(info))['Component']
  }
}
