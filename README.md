# What is this

## Setup

Node version: 13.12.0 (see .tool-versions)

Using `asdf` 

```
asdf install nodejs 13.12.0
```

Then run `yarn`

## Running a test

```
lighthouse <url> --quiet --chrome-flags="--headless" --output json --output html --budget-path=./budget.json
```

See: https://github.com/GoogleChrome/lighthouse#cli-options for more options


Authenticated pages

```
node auth.js
```

To change `auth.js` to write to JSON/HTML

(1) HTML

```
const options = {port: PORT, disableStorageReset: true, output: 'html', budget: './budget.json'}
fs.writeFileSync('lhreport-' + dateStr + ".html" , reportHtml);
```

(2) JSON (see: `auth-json.js`)

```
const options = {port: PORT, disableStorageReset: true, output: 'json', budget: './budget.json'}
fs.writeFileSync('lhreport-' + dateStr + ".json" , JSON.stringify(result.lhr, null, 2));
```


See: 

* https://github.com/GoogleChrome/lighthouse/blob/master/docs/authenticated-pages.md
* https://github.com/GoogleChrome/lighthouse/blob/master/docs/readme.md#using-programmatically

## Enhancements to make

* Setting env vars for: EMAIL, PASSWORD, LOGINURL, TARGETURL
* Use of budgets (TODO)

