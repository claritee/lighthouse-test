const constants = require('lighthouse/lighthouse-core/config/constants');

module.exports = {
    extends: 'lighthouse:default',
    settings: {
        formFactor: 'desktop',
        throttling: constants.throttling.desktopDense4G,
        screenEmulation: constants.screenEmulationMetrics.desktop,
        emulatedUserAgent: constants.userAgents.desktop,
        onlyAudits: [
            'first-meaningful-paint',
            'first-contentful-paint',
            'speed-index',
            'first-cpu-idle',
            'interactive',
            'total-blocking-time',
            'cumulative-layout-shift',
            'largest-contentful-paint',
            'accessibility',
            'best-practices',
        ],
    },
};