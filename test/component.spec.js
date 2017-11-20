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
const Component = require('../lib/component')
const retry = require('../lib/utils/retry')

/* -----------------------------------------------------------------------------
 * reusable
 * -------------------------------------------------------------------------- */

const appPath = path.join(__dirname, 'fixtures', 'app.html')
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
   * instantiate
   * ------------------------------------------------------------------------ */

  describe('instantiate', function () {
    it('Should create instance(s)', function () {
      const body1 = Component.create('body')
      const body2 = Component.$('body')
      const app = Component.$('body', '#app')

      assert.instanceOf(body1, Component)
      assert.instanceOf(body2, Component)
      assert.instanceOf(app, Component)
      assert.equal(app.getAttribute('id'), 'app')
    })
  })

  /* ---------------------------------------------------------------------------
   * query methods
   * ------------------------------------------------------------------------ */

  describe('query', function () {
    before(function () {
      this.delayedAddScript = `setTimeout(function () {
        document.body.innerHTML += '<div id="delayed">HELLO</div>'
      }, 1000)`
    })

    beforeEach(function () {
      this.body = Component.create('body')
    })

    it('Should find by string selector', function () {
      const component = this.body.$('h1')

      assert.instanceOf(component, Component)
      assert.equal(component.getTagName(), 'h1')
    })

    it('Should find by string @name selector', function () {
      const component = this.body.$('@name.byName')

      assert.instanceOf(component, Component)
      assert.equal(component.getTagName(), 'input')
    })

    it('Should find by definition', function () {
      const component = this.body.$({ selector: 'h1' })

      assert.instanceOf(component, Component)
      assert.equal(component.getTagName(), 'h1')
    })

    it('Should find all by `$$` method', function () {
      const components = this.body.$$('p')

      assert.equal(components.length, 2)
      assert.instanceOf(components[0], Component)
      assert.instanceOf(components[1], Component)
    })

    it('Should find all by `$` method', function () {
      const components = this.body.$(['p'])

      assert.equal(components.length, 2)
      assert.instanceOf(components[0], Component)
      assert.instanceOf(components[1], Component)
    })

    it('Should find nested', function () {
      const component = this.body.$('#app', 'h1')

      assert.instanceOf(component, Component)
      assert.equal(component.getTagName(), 'h1')
    })

    it('Should find all nested', function () {
      const components = this.body.$('#app', ['p'])

      assert.equal(components.length, 2)
      assert.instanceOf(components[0], Component)
      assert.instanceOf(components[1], Component)
    })

    it('Should get closest', function () {
      const component = this.body.$('#app', 'h1')
      assert.equal(component.closest('div').getAttribute('id'), 'content')
    })

    it('Should get first', function () {
      const all = this.body.$(['p'])
      const first = this.body.first('p')

      assert.equal(first.getAttribute('id'), all[0].getAttribute('id'))
    })

    it('Should get last', function () {
      const all = this.body.$(['p'])
      const last = this.body.last('p')

      assert.equal(last.getAttribute('id'), all[1].getAttribute('id'))
    })

    it('Should get nth', function () {
      const all = this.body.$(['p'])
      const nth = this.body.nth('p', 1)

      assert.equal(nth.getAttribute('id'), all[1].getAttribute('id'))
    })

    it('Should retry until element is found.', function () {
      driver.execute(this.delayedAddScript)
      assert.equal(this.body.$('#delayed').getAttribute('id'), 'delayed')
    })

    it('Should retry until elements are found.', function () {
      driver.execute(this.delayedAddScript)
      assert.equal(this.body.$(['#delayed'])[0].getAttribute('id'), 'delayed')
    })

    it('Should throw if element not found after retry timeout.', function () {
      this.body.retryOptions.timeout = 1

      driver.execute(this.delayedAddScript)
      assert.throws(() => this.body.$('#delayed'))

      this.body.retryOptions.timeout = 5000
    })
  })

  /* ---------------------------------------------------------------------------
   * child interface
   * ------------------------------------------------------------------------ */

  describe('child interface', function () {
    it('Should get child by string definition', function () {
      class MyComponent extends Component {
        get children () {
          return { 'heading': 'h1' }
        }
      }

      assert.instanceOf(MyComponent.$('body', '@child.heading'), Component)
    })

    it('Should get child by object definition', function () {
      class MyComponent extends Component {
        get children () {
          return { 'heading': { selector: 'h1' } }
        }
      }

      assert.instanceOf(MyComponent.$('body', '@child.heading'), Component)
    })

    it('Should return child of specified Class', function () {
      class HeadingComponent extends Component {}
      class MyComponent extends Component {
        get children () {
          return { 'heading': { selector: 'h1', Component: HeadingComponent } }
        }
      }

      assert.instanceOf(MyComponent.$('body', '@child.heading'), HeadingComponent)
    })

    it('Should return all matching children', function () {
      class MyComponent extends Component {
        get children () {
          return { 'paragraph': 'p' }
        }
      }

      const paragraphs = MyComponent.$('body', ['@child.paragraph'])
      assert.equal(paragraphs.length, 2)
      assert.instanceOf(paragraphs[0], Component)
      assert.instanceOf(paragraphs[1], Component)
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

    it('Should return if element exists or not', function () {
      assert.isTrue(this.body.exists('#app'))
      assert.isFalse(this.body.exists('.i-do-not-exist'))
    })

    it('Should return if the element has a specified class.', function () {
      const app = Component.create('#app')

      assert.isTrue(app.hasClass('multiple'))
      assert.isTrue(app.hasClass('classnames'))
      assert.isFalse(app.hasClass('fail'))
    })
  })

  /* ---------------------------------------------------------------------------
   * data
   * ------------------------------------------------------------------------ */

  describe('data', function () {
    it('Should return text by default', function () {
      const paragraph = Component.create('p')
      assert.deepEqual(paragraph.data(), { 'text': 'Paragraph1' })
    })

    it('Should be able to specify getter args', function () {
      class CustomParagraph extends Component {
        get properties () { return ['attribute:data-test'] }
      }

      const paragraph = CustomParagraph.create('p')
      assert.deepEqual(paragraph.data(), { 'attribute:data-test': 'val1' })
    })

    it('Should return all properties', function () {
      class CustomParagraph extends Component {
        get properties () { return ['text', 'attribute:data-test'] }
      }

      const paragraph = CustomParagraph.create('p')
      assert.deepEqual(paragraph.data(), {
        'text': 'Paragraph1',
        'attribute:data-test': 'val1'
      })
    })

    it('Should return only the specified property', function () {
      class CustomParagraph extends Component {
        get properties () { return ['text', 'attribute:data-test'] }
      }

      const paragraph = CustomParagraph.create('p')
      assert.deepEqual(paragraph.data('text'), {
        'text': 'Paragraph1'
      })
    })

    it('Should resolve kebab, camel, and snake case property names.', function () {
      class CustomParagraph extends Component {
        get properties () { return ['kebab-case', 'CamelCase', 'snake_case'] }
        getKebabCase () { return true }
        getCamelCase () { return true }
        getSnakeCase () { return true }
      }

      const paragraph = CustomParagraph.create('p')
      assert.deepEqual(paragraph.data(), {
        'kebab-case': true,
        'CamelCase': true,
        'snake_case': true
      })
    })

    it('Should utilze get_, is_, and has_ getter methods.', function () {
      class CustomParagraph extends Component {
        get properties () { return ['get', 'is', 'has'] }
        getGet () { return true }
        isIs () { return true }
        hasHas () { return true }
      }

      const paragraph = CustomParagraph.create('p')
      assert.deepEqual(paragraph.data(), {
        'get': true,
        'is': true,
        'has': true
      })
    })
  })
})
