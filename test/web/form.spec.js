/* eslint-env mocha */
'use strict'

/* -----------------------------------------------------------------------------
 * dependencies
 * -------------------------------------------------------------------------- */

// core
const path = require('path')

// 3rd party
const assert = require('chai').assert

// lib
const Form = require('../../lib/web/form')

/* -----------------------------------------------------------------------------
 * reusable
 * -------------------------------------------------------------------------- */

const appPath = path.join(__dirname, '..', 'fixtures', 'app.html')
const appUrl = `file://${appPath}`

/* -----------------------------------------------------------------------------
 * test
 * -------------------------------------------------------------------------- */

describe('Form', function () {
  this.timeout(10000)

  beforeEach(function () {
    driver.url(appUrl)
    this.form = Form.create('#form')
  })

  it('Should fill/read fields', function () {
    this.form.fillFields({
      '@name.enabled': 'hello',
      '@name.select': 'Value',
      '@name.checkbox': 'on',
      '@name.checkboxes': ['2'],
      '@name.radios': '2'
    })

    assert.deepEqual(this.form.readFields([
      '@name.enabled',
      '@name.select',
      '@name.uncheckedbox',
      '@name.checkbox',
      '@name.checkboxes',
      '@name.radio',
      '@name.radios'
    ]), {
      '@name.enabled': 'hello',
      '@name.select': 'Value',
      '@name.uncheckedbox': undefined,
      '@name.checkbox': 'on',
      '@name.checkboxes': ['2'],
      '@name.radio': undefined,
      '@name.radios': '2'
    })
  })
})
