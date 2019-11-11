#!/usr/bin/env bash
set -e

function main() {
  echo "" # see https://github.com/actions/toolkit/issues/168

  sanitize "${INPUT_ACCESS_KEY}" "access_key"
  sanitize "${INPUT_SECRET_ACCESS_KEY}" "secret_access_key"
  # sanitize "${INPUT_REGION}" "region"
  sanitize "${INPUT_PROJECT}" "project"
  sanitize "${INPUT_API_KEY}" "api_key"

  export AWS_ACCESS_KEY_ID=$INPUT_ACCESS_KEY
  export AWS_SECRET_ACCESS_KEY=$INPUT_SECRET_ACCESS_KEY
  export AWS_DEFAULT_REGION=us-east-1
  export AWS_REGION=us-east-1

  authTokenOutput=$(aws ecr get-authorization-token)
  authString=$(echo "$authTokenOutput" | jq -r '.authorizationData[].authorizationToken' | base64 -d)
  USERNAME=$(echo "$authString" | cut -d: -f1)
  PASSWORD=$(echo "$authString" | cut -d: -f2)
  REGISTRY=$(echo "$authTokenOutput" | jq -r '.authorizationData[].proxyEndpoint')

  if [ -z "$USERNAME" ]; then
    USERNAME="AWS"
  fi

  echo ${PASSWORD} | docker login -u ${USERNAME} --password-stdin ${REGISTRY}

  response=$(jq -ncM \
    --arg pid "${INPUT_PROJECT}" \
    --arg cs "${GITHUB_SHA}" \
    --arg rp "${GITHUB_REPOSITORY}" \
    '{project: $pid, commitSha: $cs, githubRepo: $rp}' | \
      curl -sS -X POST \
      -H 'Content-Type: application/json' \
      -u "${INPUT_PROJECT}:${INPUT_API_KEY}" \
      -d @- \
      https://c6c4szw7ab.execute-api.us-east-1.amazonaws.com/production/deploy)

  build_number=$(echo "${response}" | jq -rcM .buildNumber)
  deployment_id=$(echo "${response}" | jq -rcM .deploymentId)

  echo "::set-output name=build_number::${build_number}"
  echo "::set-output name=deployment_id::${deployment_id}"

  docker logout
}

function sanitize() {
  if [ -z "${1}" ]; then
    >&2 echo "Unable to find the ${2}. Did you set with.${2}?"
    exit 1
  fi
}

main

# echo "::set-output name=username::${USERNAME}"
# echo "::add-mask::${PASSWORD}"
# echo "::set-output name=password::${PASSWORD}"
# echo "::set-output name=registry::${REGISTRY}"