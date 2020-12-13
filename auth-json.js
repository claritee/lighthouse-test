const fs = require('fs');
const puppeteer = require('puppeteer');
const lighthouse = require('lighthouse');

// This port will be used by Lighthouse later. The specific port is arbitrary.
const PORT = 8041;
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
  // Direct Puppeteer to open Chrome with a specific debugging port.
  const browser = await puppeteer.launch({
    args: [`--remote-debugging-port=${PORT}`],
    // Optional, if you want to see the tests in action.
    headless: false,
    slowMo: 50,
  });

  // Setup the browser session to be logged into our site.
  await login(browser, LOGINURL);

  // The local server is running on port 10632.
  const url = TARGETURL;
  // Direct Lighthouse to use the same port.

 
  //JSON
  const options = {port: PORT, disableStorageReset: true, output: 'json', budget: './budget.json'}
  const result = await lighthouse(url, options);
  // Direct Puppeteer to close the browser as we're done with it.

  await browser.close();

  // Output the result.
  const reportHtml = result.report;

  const date = new Date();
  const dateStr = date.getFullYear() + "" + date.getMonth() + date.getDate() + "-" + date.getMinutes() + date.getSeconds();
  
  //JSON result
  fs.writeFileSync('lhreport-' + dateStr + ".json" , JSON.stringify(result.lhr, null, 2));
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
