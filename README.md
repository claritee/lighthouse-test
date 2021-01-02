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
export EMAIL="<email>"
export PASSWORD="<password>"
export LOGIN_URL="<login_url>"
export TARGET_URL="<target_url>"
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

## Running via Docker

To run lighthouse via docker, execute the following:
```
# Build docker image
docker build -t lighthouse-test:latest -f Dockerfile .

# Set required environment variables
export EMAIL="<email>"
export PASSWORD="<password>"
export LOGIN_URL="<login_url>"
export TARGET_URL="<target_url>"

# Run image to execute lighthouse
docker run --name lighthouse-container -e EMAIL -e PASSWORD -e LOGIN_URL -e TARGET_URL lighthouse-test:latest

# Get lighthouse report
docker cp  lighthouse-container:/app/report.html .

# Cleanup and remove container
docker rm lighthouse-container
```

## Config

See: 

* https://github.com/GoogleChrome/lighthouse/tree/master/lighthouse-core/config
* https://github.com/GoogleChrome/lighthouse/blob/888bd6dc9d927a734a8e20ea8a0248baa5b425ed/typings/externs.d.ts#L82-L119
* https://github.com/GoogleChrome/lighthouse/blob/master/docs/readme.md

### Constants

For example device size, throttling etc

https://github.com/GoogleChrome/lighthouse/blob/8f500e00243e07ef0a80b39334bedcc8ddc8d3d0/lighthouse-core/config/config.js

## Integrations with Web Perf Services

https://github.com/GoogleChrome/lighthouse

## Audits and Artifacts

https://www.debugbear.com/blog/custom-lighthouse-audits

## Other Resources

* Simple Guide: https://web.dev/lighthouse-ci/
* HAR viewer: https://leonardofaria.net/2020/11/30/creating-har-files-with-lighthouse/
