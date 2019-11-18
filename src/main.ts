import * as core from "@actions/core"
// import { exec } from "@actions/exec"
import Inputs from './inputs';
import { GitHub } from "@actions/github"
import axios from "axios"

const DEPLOY_URL = "https://c6c4szw7ab.execute-api.us-east-1.amazonaws.com/production/projects/deploy"

const GITHUB_REPOSITORY = process.env.GITHUB_REPOSITORY as string
const GITHUB_SHA = process.env.GITHUB_SHA as string

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
  try {
    core.debug(':: Loading input params')
    const inputs = new Inputs()

    const client = new GitHub(inputs.GithubToken, {
      log: {
        debug: (m : string, info? : object) => core.debug(m),
        info: (m : string, info? : object) => core.info(m),
        warn: (m : string, info? : object) => core.warning(m),
        error: (m : string, info? : object) => core.error(m),
      },
    })

    const result = await createDeployment(inputs)

    const {
      buildNumber,
      tagName,
      deploymentId
    } = result

    core.debug(`:: Cloud87 BuildNumber: ${buildNumber}`)
    core.debug(`:: Cloud87 Tag: ${tagName}`)

    
    core.setOutput("build_number", String(buildNumber))
    core.setOutput("deployment_id", String(deploymentId))
    core.setOutput("tag_name", String(tagName))
    
    await createGHRelease(client, tagName)
    
  } catch(err) {
    core.error(err)
    core.setFailed(err.message)
  }
}

async function createGHRelease(client : GitHub, tagName : string) {

  const [owner, repo] = GITHUB_REPOSITORY.split("/")

  await client.repos.createRelease({
    repo,
    owner,
    draft: false,
    prerelease: false,
    name: tagName,
    tag_name: tagName,
    target_commitish: GITHUB_SHA,
  })
}

// async function createGHDeployment() {

// }

async function createDeployment(inputs : Inputs) {
  core.debug(":: Creating deployment")

  const payload = {
    project: inputs.ProjectName,
    commitSha: GITHUB_SHA,
    githubRepo: GITHUB_REPOSITORY,
    githubToken: inputs.GithubToken,
  }

  const response = await axios.request<DeployResponse>({
    url: DEPLOY_URL,
    method: "POST",
    timeout: 60000,
    validateStatus: (x) => true,
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

// try {
//   run();
// } catch(error) {
  
// }
run()