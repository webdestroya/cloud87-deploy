import * as core from "@actions/core"
// import { exec } from "@actions/exec"
import Inputs from './inputs';
import axios from "axios"

const DEPLOY_URL = "https://c6c4szw7ab.execute-api.us-east-1.amazonaws.com/production/projects/deploy"

type DeployResponse = {
  success : boolean
  project : string
  buildNumber : number
  deploymentId : string
  tagName : string

  error? : boolean
  message? : string
}

async function run() {
  core.debug(':: Loading input params')
  const inputs = new Inputs()

  const result = await createDeployment(inputs)


  core.setOutput("build_number", String(result.buildNumber))
  core.setOutput("deployment_id", String(result.deploymentId))

}

async function createDeployment(inputs : Inputs) {
  core.debug(":: Creating deployment")

  const payload = {
    project: inputs.ProjectName,
    commitSha: process.env.GITHUB_SHA,
    githubRepo: process.env.GITHUB_REPOSITORY,
    githubToken: inputs.GithubToken,
  }

  const response = await axios.request<DeployResponse>({
    url: DEPLOY_URL,
    method: "POST",
    timeout: 600,
    data: JSON.stringify(payload),
    headers: {
      'Content-Type': "application/json",
    },
    auth: {
      username: inputs.ProjectName,
      password: inputs.ApiKey,
    },
    responseType: "json",
  })

  if(response.status !== 200) {
    const errMessage = response.data.message || response.statusText
    throw new Error(`Deployment Failure: ${errMessage}`)
  }

  // const {
  //   buildNumber,
  //   deploymentId,
  //   // error,
  // } = response.data

  return response.data
}

// async function pushDockerTag() {
//   await exec(`docker tag ${inputs.DockerBuildArgs} -f ${inputs.DockerfilePath} ${tags} .`, undefined, {
//     cwd: inputs.ProjectPath,
//   });
// }

try {
  run();
} catch(error) {
  core.error(error)
  core.setFailed(error.message)
}