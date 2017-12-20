'use strict'

/* -----------------------------------------------------------------------------
 * dependencies
 * -------------------------------------------------------------------------- */

// 3rd party
const {
  first,
  get,
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
  if (!get(el, 'value.ELEMENT')) {
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
    throw new Error('Must define ComponentResolver on Component')
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
    this.definitions = mapValues(this.children, this._parseChild)
    this.retryOptions = Object.assign({}, this.constructor.retryDefaults)

    if (!this.componentResolver) {
      this.componentResolver = this.constructor.componentResolver
    }

    this.setEl(el)

    return new Proxy(this, {
      get: (target, name) => name in target ? target[name] : target.el[name]
    })
  }

  setEl (el) {
    this.el = el
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
    return selector
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
