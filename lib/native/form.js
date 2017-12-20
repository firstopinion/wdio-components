'use strict'

/* -----------------------------------------------------------------------------
 * dependencies
 * -------------------------------------------------------------------------- */

// 3rd party
const { concat, each, reduce } = require('lodash')

// lib
const Component = require('./component')
const Field = require('./field')

/* -----------------------------------------------------------------------------
 * Form
 * -------------------------------------------------------------------------- */

module.exports = class Form extends Component {
  get children () {
    return {
      'submit': '~Submit'
    }
  }

  get defaultValues () {
    return {}
  }

  /* ---------------------------------------------------------------------------
   * form actions
   * ------------------------------------------------------------------------ */

  fill (data = {}) {
    this.fillFields(Object.assign({}, this.defaultValues, data))
  }

  fillFields (data = {}) {
    each(data, (value, selector) => this.fillField(selector, value))
  }

  fillField (selector, val) {
    this.$({ selector, Component: Field }).fill(val)
  }

  readFields (fields, ...additional) {
    return reduce(concat(fields, ...additional), (fields, field) => {
      return Object.assign(fields, { [field]: this.readField(field) })
    }, {})
  }

  readField (selector) {
    return this.$(selector).read()
  }

  submit (data) {
    if (!data) {
      return this._submit()
    }

    this.fill(data)
    return this._submit()
  }

  _submit () {
    return this.$('@child.submit').click()
  }
}
