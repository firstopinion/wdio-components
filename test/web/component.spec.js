/* eslint-env mocha */
/* global browser */
'use strict'

/* -----------------------------------------------------------------------------
 * dependencies
 * -------------------------------------------------------------------------- */

// core
const path = require('path')

// 3rd party
const assert = require('chai').assert

// lib
const Component = require('../../lib/web/component')

/* -----------------------------------------------------------------------------
 * reusable
 * -------------------------------------------------------------------------- */

const appPath = path.join(__dirname, '..', 'fixtures', 'app.html')
const appUrl = `file://${appPath}`

/* -----------------------------------------------------------------------------
 * test
 * -------------------------------------------------------------------------- */

describe('Component', function () {
  this.timeout(60000)

  beforeEach(function () {
    browser.url(appUrl)
  })

  /* ---------------------------------------------------------------------------
   * query methods
   * ------------------------------------------------------------------------ */

  describe('query', function () {
    beforeEach(function () {
      this.body = Component.create('body')
    })

    it('Should find by string @name selector', function () {
      const component = this.body.$('@name.byName')

      assert.instanceOf(component, Component)
      assert.equal(component.getTagName(), 'input')
    })

    it('Should get closest', function () {
      const component = this.body.$('#app', 'h1')
      assert.equal(component.closest('div').getAttribute('id'), 'content')
    })
  })

  /* ---------------------------------------------------------------------------
   * focus actions
   * ------------------------------------------------------------------------ */

  describe('focus actions', function () {
    beforeEach(function () {
      this.body = Component.create('body')
      this.input = this.body.$('#enabled')
    })

    it('Should focus on element', function () {
      this.input.focus()
      assert.equal(this.body.$(':focus').getAttribute('id'), 'enabled')
    })

    it('Should blur element', function () {
      this.input.focus()
      this.input.blur()

      assert.isFalse(this.body.exists(':focus'))
    })

    it('Should blur currently active element', function () {
      this.input.focus()
      this.body.blurActive()

      assert.isFalse(this.body.exists(':focus'))
    })
  })

  /* ---------------------------------------------------------------------------
   * scroll actions
   * ------------------------------------------------------------------------ */

  describe('scroll actions', function () {
    beforeEach(function () {
      this.outer = Component.create('#scrollable-outer')
      this.inner = Component.create('#scrollable-inner')
    })

    it('Should scroll x by delta.', function () {
      this.outer.scrollXBy(50)
      this.outer.scrollXBy(50)

      const pos = this.outer.getScrollPos()
      assert.equal(pos.scrollLeft, 100)
      assert.equal(pos.scrollTop, 0)
    })

    it('Should scroll y by delta.', function () {
      this.outer.scrollYBy(50)
      this.outer.scrollYBy(50)

      const pos = this.outer.getScrollPos()
      assert.equal(pos.scrollLeft, 0)
      assert.equal(pos.scrollTop, 100)
    })

    it('Should scroll x to pos.', function () {
      this.outer.scrollXTo(50)
      this.outer.scrollXTo(50)

      const pos = this.outer.getScrollPos()
      assert.equal(pos.scrollLeft, 50)
      assert.equal(pos.scrollTop, 0)
    })

    it('Should scroll y to pos.', function () {
      this.outer.scrollYTo(50)
      this.outer.scrollYTo(50)

      const pos = this.outer.getScrollPos()
      assert.equal(pos.scrollLeft, 0)
      assert.equal(pos.scrollTop, 50)
    })

    it('Should scroll to bottom.', function () {
      this.outer.scrollToBottom()

      assert.isTrue(this.outer.isScrolledToBottom())
      assert.isFalse(this.outer.isScrolledToTop())
    })

    it('Should scroll to top.', function () {
      this.outer.scrollToBottom()
      this.outer.scrollToTop()

      assert.isFalse(this.outer.isScrolledToBottom())
      assert.isTrue(this.outer.isScrolledToTop())
    })
  })

  /* ---------------------------------------------------------------------------
   * checks
   * ------------------------------------------------------------------------ */

  describe('checks', function () {
    beforeEach(function () {
      this.body = Component.create('body')
    })

    it('Should return if the element has a specified class.', function () {
      const app = Component.create('#app')

      assert.isTrue(app.hasClass('multiple'))
      assert.isTrue(app.hasClass('classnames'))
      assert.isFalse(app.hasClass('fail'))
    })
  })
})
