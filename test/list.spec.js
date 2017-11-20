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
const List = require('../lib/list')

/* -----------------------------------------------------------------------------
 * reusable
 * -------------------------------------------------------------------------- */

const appPath = path.join(__dirname, 'fixtures', 'app.html')
const appUrl = `file://${appPath}`

/* -----------------------------------------------------------------------------
 * test
 * -------------------------------------------------------------------------- */

describe('List', function () {
  this.timeout(10000)

  beforeEach(function () {
    driver.url(appUrl)
    this.list = List.create('#list')
  })

  it('Should only return direct descendents.', function () {
    assert.equal(this.list.items().length, 4)
  })

  /* ---------------------------------------------------------------------------
   * data
   * ------------------------------------------------------------------------ */

  it('Should return the list length.', function () {
    assert.equal(this.list.getLength(), 4)
  })

  it('Should pluck specified property from items.', function () {
    assert.deepEqual(this.list.pluck('text'), [ 'First', 'Second',
      'Nested', 'Last' ])
  })

  /* ---------------------------------------------------------------------------
   * find
   * ------------------------------------------------------------------------ */

  it('Should return the first item.', function () {
    assert.equal(this.list.firstItem().getText(), 'First')
  })

  it('Should return the nth item.', function () {
    assert.equal(this.list.nthItem(1).getText(), 'Second')
  })

  it('Should return the last item.', function () {
    assert.equal(this.list.lastItem().getText(), 'Last')
  })

  /* ---------------------------------------------------------------------------
   * utils
   * ------------------------------------------------------------------------ */

  it('Should return if list length matches passed length.', function () {
    assert.isTrue(this.list.isLength(4))
    assert.isFalse(this.list.isLength(5))
  })

  it('Should wait until the list is a specified length.', function () {
    this.list.waitUntilLength(4)
  })
})
