const fs = require('fs');
const puppeteer = require('puppeteer');
const lighthouse = require('lighthouse');

const PORT = 8041; //debugging port
const EMAIL = ''
const PASSWORD = ''
const LOGINURL = ''
const TARGETURL = ''

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
    args: [`--remote-debugging-port=${PORT}`],
    headless: false,
    slowMo: 50,
  });

  await login(browser, LOGINURL);

  const url = TARGETURL;
  const options = {port: PORT, disableStorageReset: true, output: 'json'}
  const result = await lighthouse(url, options);

  await browser.close();

  const reportHtml = result.report;
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
