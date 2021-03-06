#!/usr/bin/env bash
set -e

function main() {
  echo "" # see https://github.com/actions/toolkit/issues/168

  # sanitize "${INPUT_ACCESS_KEY}" "access_key"
  # sanitize "${INPUT_SECRET_ACCESS_KEY}" "secret_access_key"
  # # sanitize "${INPUT_REGION}" "region"
  sanitize "${INPUT_PROJECT}" "project"
  sanitize "${INPUT_API_KEY}" "api_key"
  sanitize "${INPUT_TOKEN}" "token"

  # export AWS_ACCESS_KEY_ID=$INPUT_ACCESS_KEY
  # export AWS_SECRET_ACCESS_KEY=$INPUT_SECRET_ACCESS_KEY
  # export AWS_DEFAULT_REGION=us-east-1
  # export AWS_REGION=us-east-1

  # authTokenOutput=$(aws ecr get-authorization-token)
  # authString=$(echo "$authTokenOutput" | jq -r '.authorizationData[].authorizationToken' | base64 -d)
  # USERNAME=$(echo "$authString" | cut -d: -f1)
  # PASSWORD=$(echo "$authString" | cut -d: -f2)
  # REGISTRY=$(echo "$authTokenOutput" | jq -r '.authorizationData[].proxyEndpoint')

  # AWS_ACCT_ID=$(aws sts get-caller-identity | jq -rcM .Account)

  # if [ -z "$USERNAME" ]; then
  #   USERNAME="AWS"
  # fi

  # echo ${PASSWORD} | docker login -u ${USERNAME} --password-stdin ${REGISTRY}

  # reponame="${AWS_ACCT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com/cloud87/${INPUT_PROJECT}"

  # docker build -t ${reponame}:${GITHUB_SHA} .
  # docker push ${reponame}:${GITHUB_SHA}

  response=$(jq -ncM \
    --arg pid "${INPUT_PROJECT}" \
    --arg cs "${GITHUB_SHA}" \
    --arg rp "${GITHUB_REPOSITORY}" \
    --arg tk "${INPUT_TOKEN}" \
    '{project: $pid, commitSha: $cs, githubRepo: $rp, githubToken: $tk}' | \
      curl -sS -X POST \
      -H 'Content-Type: application/json' \
      -u "${INPUT_PROJECT}:${INPUT_API_KEY}" \
      -d @- \
      https://c6c4szw7ab.execute-api.us-east-1.amazonaws.com/production/deploy)

  has_error=$(echo "${response}" | jq -rcM .error)
  build_number=$(echo "${response}" | jq -rcM .buildNumber)
  deployment_id=$(echo "${response}" | jq -rcM .deploymentId)
  # tag_name=$(echo "${response}" | jq -rcM .tagName)

  if [ "${has_error}" == "true" ]; then
    >&2 echo "::error ${response}"
    exit 1
  fi
  
  # docker tag ${reponame}:${GITHUB_SHA} ${reponame}:${tag_name}
  # docker push ${reponame}:${tag_name}

  echo "::set-output name=build_number::${build_number}"
  echo "::set-output name=deployment_id::${deployment_id}"
  # echo "::set-output name=tag_name::${tag_name}"

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