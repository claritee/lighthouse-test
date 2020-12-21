const fs = require('fs');
const puppeteer = require('puppeteer');
const lighthouse = require('lighthouse');
const { v4: uuidv4 } = require('uuid');
const { Client } = require('pg');

const HEADLESS = process.env.HEADLESS == "true" ? true : false
const PORT = process.env.PORT || 8041; //debugging port
const EMAIL = process.env.EMAIL || ''
const PASSWORD = process.env.PASSWORD || ''
const LOGIN_URL = process.env.LOGIN_URL || ''
const TARGET_URL = process.env.TARGET_URL || ''

const POSTGRES_HOST = process.env.POSTGRES_HOST || 'localhost'
const POSTGRES_USER = process.env.POSTGRES_USER || ''
const POSTGRES_PASSWORD = process.env.POSTGRES_PASSWORD || ''
const POSTGRES_DB = process.env.POSTGRES_DB || ''
const POSTGRES_PORT = process.env.POSTGRES_PORT || 5432

const BUILD_COMMIT = process.env.BUILD_COMMIT || ''
const BUILD_NUMBER = process.env.BUILD_NUMBER || ''

/**
 * @param {import('puppeteer').Browser} browser
 * @param {string} origin
 */
async function login(browser, origin) {
  const page = await browser.newPage();
  await page.goto(origin);
  await page.waitForSelector('input[type="email"]', {visible: true});

  // Fill in email and submit login form.
  const emailInput = await page.$('input[type="email"]');
  await emailInput.type(EMAIL);
  await Promise.all([
    page.click('#submit')
  ]);

  // Fill in password and submit form
  await page.waitForSelector('input[type="password"]', {visible: true});
  const passwordInput = await page.$('input[type="password"]');
  await passwordInput.type(PASSWORD);
  await Promise.all([
    page.click('#submit'),
    page.waitForNavigation(),
  ]);

  await page.close();
}

/**
 * @param {puppeteer.Browser} browser
 * @param {string} origin
 */
async function logout(browser, origin) {
  const page = await browser.newPage();
  await page.goto(`${origin}/logout`);
  await page.close();
}

function extractResultMetrics(lighthouseResult) {
  const { audits } = lighthouseResult;
  const metrics = {}
  const metricKeys = [
    'first-contentful-paint',
    'speed-index',
    'largest-contentful-paint',
    'interactive',
    'total-blocking-time',
    'cumulative-layout-shift',
  ]

  metricKeys.forEach((metricKey) => {
    metrics[metricKey] = audits[metricKey];
  });

  console.log(metrics);

  return metrics;
}

async function insertMetric(dbClient, targetDomain, path, metricType, metricValue, commitHash, buildNumber, createdAt) {
  const id = uuidv4();

  const text = "INSERT INTO lighthouse_metrics(id, target_domain, path, metric_type, metric_value, commit_hash, build_number, created_at) VALUES($1, $2, $3, $4, $5, $6, $7, $8);"
  const values = [
    id,
    targetDomain,
    path,
    metricType,
    metricValue,
    commitHash,
    buildNumber,
    createdAt
  ];

  try {
    await dbClient.query(text, values);
  } catch (e) {
    console.log(`Error storing lighthouse metric: ${e.message}\nText: ${text}\nValues: ${values}`);
    throw e
  }
}

async function main() {
  const browser = await puppeteer.launch({
    args: [`--remote-debugging-port=${PORT}`, `--no-sandbox`],
    headless: HEADLESS,
    slowMo: 50,
  });

  // Setup the browser session to be logged into our site.
  await login(browser, LOGIN_URL);

  // Run lighthouse
  const url = TARGET_URL;
  const options = {port: PORT, disableStorageReset: true, output: 'json'};
  const result = await lighthouse(url, options);

  // Cleanup
  await browser.close();

  // Parse results
  const lighthouseResult = result.lhr;
  const metrics = extractResultMetrics(lighthouseResult)

  // Store artifacts to filesystem
  fs.writeFileSync('report.json', JSON.stringify(lighthouseResult, null, 2));
  fs.writeFileSync('metrics.json', JSON.stringify(metrics, null, 2));

  // Get DB client
  const dbClient = new Client({
    user: POSTGRES_USER,
    host: POSTGRES_HOST,
    database: POSTGRES_DB,
    password: POSTGRES_PASSWORD,
    port: POSTGRES_PORT,
  });
  await dbClient.connect();

  const timeNow = (new Date()).toISOString();

  // Iterate each metric, and store to db
  const keys = Object.keys(metrics);

  for (let idx = 0; idx < keys.length; idx++) {
    const metricKey = keys[idx];
    const metric = metrics[metricKey];

    // TODO: Split TARGET_URL to TARGET_DOMAIN and PATH
    await insertMetric(
      dbClient,
      TARGET_URL,
      TARGET_URL,
      metricKey,
      metric['numericValue'].toFixed(4),
      BUILD_COMMIT,
      BUILD_NUMBER,
      timeNow
    );
  }

  // Release db connection
  await dbClient.end();
}

if (require.main === module) {
  try{
    main();
  } catch(e) {
    console.log(e);
  }
} else {
  module.exports = {
    login,
    logout,
  };
}
