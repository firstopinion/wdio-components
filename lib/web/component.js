'use strict'

/* -----------------------------------------------------------------------------
 * dependencies
 * -------------------------------------------------------------------------- */

// 3rd party
const { isUndefined } = require('lodash')

// lib
const Component = require('../component')
const findClosestScript = require('./scripts/find-closest')

/* -----------------------------------------------------------------------------
 * helpers
 * -------------------------------------------------------------------------- */

const findElementByScript = (script, ...args) => {
  const el = driver.execute(script, ...args)
  if (!el.value) {
    throw new Error(`Unable to find element`)
  }

  return el
}

/* -----------------------------------------------------------------------------
 * Component
 * -------------------------------------------------------------------------- */

module.exports = class WebComponent extends Component {
  static get ComponentResolver () {
    // TODO: Temporary hack to avoid circular dependencies... May be a more
    // elegant way to solve this?
    return require('./support/component-resolver')
  }

  /* ---------------------------------------------------------------------------
   * query
   * ------------------------------------------------------------------------ */

  closest (_definition, ...additional) {
    const definition = this._normalizeDefinition(_definition)
    const el = this._retry(() => this._findClosestElement(definition.selector))

    return this.returnComponent(definition.Component, el, additional)
  }

  /* ---------------------------------------------------------------------------
   * focus actions
   * ------------------------------------------------------------------------ */

  blur () {
    driver.execute(`arguments[0].blur()`, this.el.value)
    return this
  }

  blurActive () {
    try {
      (new WebComponent(this._findElement(':focus'))).blur()
    } catch (e) {
      console.log(e)
    }

    return this
  }

  focus () {
    driver.execute(`arguments[0].focus()`, this.el.value)
    return this
  }

  /* ---------------------------------------------------------------------------
   * scroll actions
   * ------------------------------------------------------------------------ */

  scrollBy (x = 0, y = 0) {
    driver.execute(`
      arguments[0].scrollLeft += ${x};
      arguments[0].scrollTop += ${y};
    `, this.el.value)

    return this
  }

  scrollXBy (delta) {
    return this.scrollBy(delta, 0)
  }

  scrollYBy (delta) {
    return this.scrollBy(0, delta)
  }

  scrollTo (x, y) {
    let script = ''
    if (!isUndefined(x)) { script += `arguments[0].scrollLeft = ${x};` }
    if (!isUndefined(y)) { script += `arguments[0].scrollTop = ${y};` }

    driver.execute(script, this.el.value)

    return this
  }

  scrollXTo (pos) {
    return this.scrollTo(pos, 0)
  }

  scrollYTo (pos) {
    return this.scrollTo(0, pos)
  }

  scrollToTop () {
    return this.scrollTo(undefined, 0)
  }

  scrollToBottom () {
    return this.scrollTo(undefined, this.getAttribute('scrollHeight'))
  }

  /* ---------------------------------------------------------------------------
   * data
   * ------------------------------------------------------------------------ */

  getScrollPos () {
    return this.getScrollProps('scrollTop', 'scrollHeight', 'offsetHeight',
      'scrollLeft', 'scrollWidth', 'offsetWidth')
  }

  getScrollProp (prop) {
    return this.getScrollProps(prop)[prop]
  }

  getScrollProps (...props) {
    const propsString = props.map(p => `${p}: arguments[0]['${p}'],`).join('\n')
    return driver.execute(`return {${propsString}}`, this.el.value).value
  }

  /* ---------------------------------------------------------------------------
   * checks
   * ------------------------------------------------------------------------ */

  hasClass (className) {
    return this.getAttribute('class').split(' ').includes(className)
  }

  isScrolledToTop () {
    return this.getScrollProp('scrollTop') === 0
  }

  isScrolledToBottom () {
    const pos = this.getScrollPos()
    return pos.scrollTop >= pos.scrollHeight - pos.offsetHeight
  }

  /* ---------------------------------------------------------------------------
   * utils
   * ------------------------------------------------------------------------ */

  _findClosestElement (selector) {
    return findElementByScript(findClosestScript, this.el.value, selector)
  }

  _normalizeSelector (selector) {
    return selector.startsWith('@name.')
      ? `[name="${selector.split('@name.')[1]}"]`
      : selector
  }
}
