'use strict'

/* -----------------------------------------------------------------------------
 * dependencies
 * -------------------------------------------------------------------------- */

// 3rd party
const {
  first,
  last,
  map,
  mapValues,
  reduce,
  tail,
  toArray,
  camelCase,
  upperFirst,
  isString,
  isObject,
  isArray,
  isUndefined
} = require('lodash')

// lib
const retry = require('./utils/retry')
const findClosestScript = require('./scripts/find-closest')

/* -----------------------------------------------------------------------------
 * global
 * -------------------------------------------------------------------------- */

// I'm not a fan of using "browser" as a global. We will be running tests
// against native applications as well... browser -> driver
global.driver = global.browser

/* -----------------------------------------------------------------------------
 * helpers
 * -------------------------------------------------------------------------- */

const findElement = (root, selector) => {
  const el = root.element(selector)
  if (el.state === 'failure') {
    throw new Error(el.message + `: ${selector}`)
  }

  return el
}

const findElements = (root, selector) => {
  const els = root.elements(selector)
  if (!els.value.length) {
    throw new Error('No elements found')
  }

  return els.value
}

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

module.exports = class Component {
  static get retryDefaults () {
    return { interval: 10, timeout: 5000 }
  }

  static get componentResolver () {
    return this._componentResolver ||
      (this._componentResolver = new this.ComponentResolver())
  }

  static get ComponentResolver () {
    // TODO: Temporary hack to avoid circular dependencies... May be a more
    // elegant way to solve this?
    return require('./support/component-resolver')
  }

  static create (selector, ...additional) {
    const el = retry(() => findElement(driver, selector), this.retryDefaults)
    const ComponentClass = this
    const component = new ComponentClass(el)

    return additional.length
      ? component.component(...additional)
      : component
  }

  static $ (...args) {
    return this.create(...args)
  }

  get properties () {
    return ['text']
  }

  get children () {
    return {}
  }

  constructor (el) {
    this.el = el
    this.definitions = mapValues(this.children, this._parseChild)
    this.retryOptions = Object.assign({}, this.constructor.retryDefaults)

    if (!this.componentResolver) {
      this.componentResolver = this.constructor.componentResolver
    }

    return new Proxy(this, {
      get: (target, name) => name in target ? target[name] : target.el[name]
    })
  }

  $ (...args) {
    return this.component(...args)
  }

  $$ (...args) {
    return this.components(...args)
  }

  component (_definition, ...additional) {
    if (isArray(_definition)) {
      return this.components(_definition[0], ...additional)
    }

    const definition = this._normalizeDefinition(_definition)
    const el = this._retry(() => this._findElement(definition.selector))

    return this.returnComponent(definition.Component, el, additional)
  }

  components (_definition, ...additional) {
    const definition = this._normalizeDefinition(_definition)
    const els = this._retry(() => this._findElements(definition.selector))

    return map(els, (el) => (
      this.returnComponent(definition.Component, el, additional)
    ))
  }

  closest (_definition, ...additional) {
    const definition = this._normalizeDefinition(_definition)
    const el =  this._retry(() => this._findClosestElement(definition.selector))

    return this.returnComponent(definition.Component, el, additional)
  }

  returnComponent (_ComponentClass, el, additional) {
    let ComponentClass = _ComponentClass
    if (!ComponentClass) {
      ComponentClass = this.componentResolver.resolve(el)
    }

    const component = new ComponentClass(el)
    return additional.length
      ? component.component(...additional)
      : component
  }

  /* ---------------------------------------------------------------------------
   * shorthand selectors
   * ------------------------------------------------------------------------ */

  first (definition) {
    return first(this.components(definition))
  }

  last (definition) {
    return last(this.components(definition))
  }

  nth (definition, n) {
    return this.components(definition)[n]
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
      (new Component(this._findElement(':focus'))).blur()
    } catch (e) {}

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

  prop (prop) {
    const parts = prop.split(':')
    const name = upperFirst(camelCase(`${parts[0]}`))
    const getter = this[`get${name}`] || this[`is${name}`] || this[`has${name}`]

    return getter.apply(this, tail(parts))
  }

  data () {
    const props = arguments.length ? toArray(arguments) : this.properties

    return reduce(props, (props, prop) => (
      Object.assign(props, { [prop]: this.prop(prop) })
    ), {})
  }

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

  exists (_definition) {
    const definition = this._normalizeDefinition(_definition)

    try {
      return !!this._findElement(definition.selector)
    } catch (e) {
      return false
    }
  }

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

  _retry (fn) {
    return retry(fn, this.retryOptions)
  }

  _findElement (selector) {
    return findElement(this.el, selector)
  }

  _findElements (selector) {
    return findElements(this.el, selector)
  }

  _findClosestElement (selector) {
    return findElementByScript(findClosestScript, this.el.value, selector)
  }

  _normalizeDefinition (definition) {
    if (isString(definition) && definition.startsWith('@child.')) {
      definition = this._getDefinition(definition.split('@child.')[1])
    }

    if (isString(definition)) {
      definition = { selector: definition }
    }

    return Object.assign({}, definition, {
      selector: this._normalizeSelector(definition.selector)
    })
  }

  _getDefinition (childName) {
    const definition = this.definitions[childName]

    if (isUndefined(definition)) {
      throw new Error(`No child found by the name: ${childName}`)
    }

    return definition
  }

  _normalizeSelector (selector) {
    return selector.startsWith('@name.')
      ? `[name="${selector.split('@name.')[1]}"]`
      : selector
  }

  _parseChild (raw) {
    let definition

    if (isObject(raw)) {
      definition = raw
    } else if (isString(raw)) {
      definition = { selector: raw }
    }

    if (!definition) {
      throw new Error(`Definition type not recognized`)
    }

    return definition
  }
}
