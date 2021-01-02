const fs = require('fs');
const puppeteer = require('puppeteer');
const lighthouse = require('lighthouse');

const HEADLESS = process.env.HEADLESS == "true" ? true : false
const PORT = process.env.PORT || 8041; //debugging port
const EMAIL = process.env.EMAIL || ''
const PASSWORD = process.env.PASSWORD || ''
const LOGINURL = process.env.LOGIN_URL || ''
const TARGETURL = process.env.TARGET_URL || ''

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
  const browser = await puppeteer.launch({
    args: [`--remote-debugging-port=${PORT}`, `--no-sandbox`],
    headless: HEADLESS,
    slowMo: 50,
  });

  // Setup the browser session to be logged into our site.
  await login(browser, LOGINURL);

  const url = TARGETURL;
  const options = {port: PORT, disableStorageReset: true, output: 'html'};
  const result = await lighthouse(url, options);

  await browser.close();

  const reportHtml = result.report;
  fs.writeFileSync('report.html', reportHtml);
  fs.writeFileSync('report.json', JSON.stringify(result.lhr, null, 2));
  
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
