exports.config = {
  specs: [
    './test/*.spec.js'
  ],
  maxInstances: 1,
  capabilities: [{
    maxInstances: 1,
    browserName: 'chrome'
  }],
  sync: true,
  logLevel: 'silent',
  coloredLogs: true,
  deprecationWarnings: true,
  bail: 0,
  screenshotPath: null,
  baseUrl: null,
  waitforTimeout: 10000,
  connectionRetryTimeout: 90000,
  connectionRetryCount: 3,
  services: ['selenium-standalone'],
  framework: 'mocha',
  reporters: ['spec'],
  mochaOpts: {
    ui: 'bdd'
  }
}
