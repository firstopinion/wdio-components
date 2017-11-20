<h1 align="center">wdio-components</h1>
<div align="center">
  <p>Components for webdriverIO.</p>
  <div>
  <a href="https://travis-ci.org/firstopinion/wdio-components"><img src="https://travis-ci.org/firstopinion/wdio-components.svg?branch=master" alt="Build Status"></a>
  <a href="https://coveralls.io/github/firstopinion/wdio-components?branch=master"><img src="https://coveralls.io/repos/github/firstopinion/wdio-components/badge.svg?branch=master" alt="Coverage Status"></a>
  <a href="http://standardjs.com/"><img src="https://img.shields.io/badge/code%20style-standard-brightgreen.svg" alt="Standard - JavaScript Style Guide"></a>
  </div>
  <div>
  <a href="https://npmjs.org/package/wdio-components"><img src="https://img.shields.io/npm/v/wdio-components.svg" alt="NPM wdio-components package"></a>
  <a href="https://david-dm.org/firstopinion/wdio-components"><img src="https://david-dm.org/firstopinion/wdio-components.svg" alt="Dependency Status"></a>
  <a href="https://david-dm.org/firstopinion/wdio-components#info=devDependencies"><img src="https://david-dm.org/firstopinion/wdio-components/dev-status.svg" alt="devDependency Status"></a>
  </div>
</div>
<br>

## Why

Our front end is built using components, and our integration tests should as well. The goal of **wdio-components** is to provide a consistent set of tools and patterns to author integration tests using components.

## Basic Usage

```js
const { Component, Form } = require('wdio-components')

class App extends Component {
  get children () {
    return {
      'Login': { selector: '.login', Component: Form }
    }
  }
}

App.$('body', '@child.Login').submitWith({
  '@name.username': 'user@email.com',
  '@name.password': '1234'
})
```

## License

The MIT License (MIT) Copyright (c) 2017 Jarid Margolin

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
