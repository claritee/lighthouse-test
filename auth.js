const fs = require('fs');
const puppeteer = require('puppeteer');
const lighthouse = require('lighthouse');
const config = require('./config.js');

const HEADLESS = process.env.HEADLESS == "true" ? true : false;
const PORT = process.env.PORT || 8041;
const EMAIL = process.env.EMAIL || '';
const PASSWORD = process.env.PASSWORD || '';
const LOGIN_URL = process.env.LOGIN_URL || '';
const TARGET_URL = process.env.TARGET_URL || ''
const RESULTS_DIR ='./results';
const PATHS = process.env.PATHS || '/dashboard';

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

async function main() {
  if (!fs.existsSync(RESULTS_DIR)) {
    fs.mkdirSync(RESULTS_DIR, (err) => {
      if (err) throw err;
    });
  }

  const paths = PATHS.split(",");
  const browser = await puppeteer.launch({
    args: [`--remote-debugging-port=${PORT}`, `--no-sandbox`],
    headless: HEADLESS,
    slowMo: 50,
  });

  // Setup the browser session to be logged into our site.
  console.log('Logging in ' + LOGIN_URL);
  await login(browser, LOGIN_URL);

  console.log("Paths to test: " + paths);
  for (let path of paths) {

    let url = TARGET_URL + path;
    console.log("Testing " + url);

    let options = {port: PORT, disableStorageReset: true, output: 'json'}
    let result = await lighthouse(url, options, config);

    let date = new Date();
    let dateStr = date.getFullYear() + "" + (date.getMonth() + 1) + date.getDate() + "-" + date.getHours() + date.getMinutes() + date.getSeconds();

    let file = RESULTS_DIR + path + '-' + dateStr + ".json";
    fs.writeFileSync(file, JSON.stringify(result.lhr, null, 2));
    console.log("Results: " + file);
  }

  await browser.close();
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
