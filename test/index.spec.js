/* eslint-env mocha */
'use strict'

/* -----------------------------------------------------------------------------
 * dependencies
 * -------------------------------------------------------------------------- */

// 3rd party
const assert = require('chai').assert

// lib
const components = require('../lib/index')

/* -----------------------------------------------------------------------------
 * test
 * -------------------------------------------------------------------------- */

describe('components', function () {
  it('Should expose all components', function () {
    assert.hasAllKeys(components, ['Component', 'Field', 'Form', 'List'])
  })
})
