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

## Running Docker Compose with Postgres and Grafana
First time setup to setup grafana with postgres source
```
# Bring up postgres and grafana locally
docker-compose up

# You can not interact with postgres directly on `localhost:5432`
# Credentials: lighthouse/lighthouse
# Database: lighthouse

# Login to Grafana and configure postgres datasource
Go to http://localhost:3000
USERNAME=admin
PASSWORD=pass

Go to http://localhost:3000/datasources
1. Add data source
2. Search for PostgreSQL
3. Configure data source:
    - Name: Lighthouse PostgreSQL
    - Host: postgres:5432
    - Database: lighthouse
    - User: lighthouse
    - Password: lighthouse
    - SSL Mode: disable
    - PostgreSQL Details Version: 12

# You can now configure new dashboard panels by selecting the "Lighthouse PostgreSQL" as the datasource
```

## Enhancements to make

* Use of budgets (TODO)

