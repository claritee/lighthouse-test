const constants = require('lighthouse/lighthouse-core/config/constants');

const config = {
  extends: 'lighthouse:default',
  settings: {
      formFactor: 'mobile',
      throttling: constants.throttling['desktopDense4G'],
      screenEmulation: constants.screenEmulationMetrics.mobile,
      emulatedUserAgent: constants.userAgents.mobile,
      // gatherMode: true,
      // auditMode: "perflog/",
  },
}

module.exports = config;