#!/bin/bash

set -o errexit
set -o nounset
set -o pipefail

export EMAIL=${AUTH_EMAIL:?"AUTH_EMAIL env var must be set"}
export PASSWORD=${AUTH_PASSWORD:?"AUTH_PASSWORD env var must be set"}
export LOGIN_URL=${LOGIN_URL:?"LOGIN_URL env var must be set"}
export TARGET_URL=${TARGET_URL:?"TARGET_URL env var must be set"}

docker_container_name="frontend-performance-container"
docker_tag="${docker_container_name}:latest"
if [[ "${CI:=false}" == true ]]; then
    docker_tag="${docker_container_name}:${BUILDKITE_BUILD_NUMBER}"
fi
docker build -t "${docker_tag}" -f Dockerfile .

trap 'docker rm ${docker_container_name}' EXIT
docker run --name "${docker_container_name}" \
    -e EMAIL \
    -e PASSWORD \
    -e LOGIN_URL \
    -e TARGET_URL \
    "${docker_tag}"

docker cp "${docker_container_name}:/app/report.html" .
