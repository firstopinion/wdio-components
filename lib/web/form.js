'use strict'

/* -----------------------------------------------------------------------------
 * dependencies
 * -------------------------------------------------------------------------- */

// 3rd party
const {
  castArray,
  concat,
  each,
  filter,
  find,
  map,
  pull,
  reduce
} = require('lodash')

// lib
const Component = require('./component')

/* -----------------------------------------------------------------------------
 * Form
 * -------------------------------------------------------------------------- */

module.exports = class Form extends Component {
  get children () {
    return {
      'submit': 'button[type="submit"]'
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
    this.blurActive()
  }

  fillField (selector, val) {
    const fields = this.$$(selector)
    const type = fields[0].getAttribute('type')

    if (fields.length > 1 && type === 'checkbox') {
      this.fillCheckboxFields(fields, val)
    } else if (type === 'radio') {
      this.fillRadioFields(fields, val)
    } else {
      fields[0].fill(val)
    }
  }

  fillCheckboxFields (fields, val) {
    const vals = castArray(val)
    const toSelect = filter(fields, field => (
      vals.length !== pull(vals, field.getValue()).length
    ))

    if (vals.length) {
      throw new Error('Unable to fill checkboxes')
    }

    each(toSelect, field => field.fill(true))
  }

  fillRadioFields (fields, val) {
    const field = find(fields, field => field.hasValue(val))
    if (!field) {
      throw new Error('Unable to fill radio field')
    }

    field.fill(val)
  }

  readFields (fields, ...additional) {
    return reduce(concat(fields, ...additional), (fields, field) => {
      return Object.assign(fields, { [field]: this.readField(field) })
    }, {})
  }

  readField (selector) {
    const fields = this.$$(selector)

    if (fields.length === 1) {
      return fields[0].read()
    }

    // must be a checkbox or a radio
    return fields[0].getAttribute('type') === 'checkbox'
      ? this.readCheckboxFields(fields)
      : this.readRadioFields(fields)
  }

  readCheckboxFields (fields) {
    const values = pull(map(fields, field => field.read()), undefined)

    return values.length
      ? values
      : undefined
  }

  readRadioFields (fields) {
    return pull(map(fields, field => field.read()), undefined)[0]
  }

  submit (data) {
    if (!data) {
      return this._submit()
    }

    this.fill(data)
    return this._submit()
  }

  _findFields (selector, filterFn) {
    const fields = this.$$(selector)

    return fields.length > 1
      ? filter(fields, filterFn)
      : fields
  }

  _submit () {
    return this.$('@child.submit').click()
  }
}
