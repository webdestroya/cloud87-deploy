import * as core from '@actions/core';
import 'reflect-metadata';
import {
  getInputName,
  Input,
  isOptional,
  isRequired,
  // Optional,
  Required
} from './decorators';

export default class Inputs {
  // REQUIRED ARGUMENTS

  @Input('project')
  @Required
  public readonly ProjectName: string = '';

  @Input('api_key')
  @Required
  public readonly ApiKey: string = '';

  @Input('token')
  @Required
  public readonly GithubToken: string = '';

  // @Input('region')
  // @Required
  // public readonly Region: string = '';

  // OPTIONAL ARGUMENTS

  // @Input('create_repo')
  // @Optional
  // public readonly ShouldCreateRepo: string = 'false';

  // @Input('dockerfile')
  // @Optional
  // public readonly DockerfilePath: string = '';

  // @Input('docker_build_args')
  // @Optional
  // public readonly DockerBuildArgs: string = '';

  // @Input('path')
  // @Optional
  // public readonly ProjectPath: string = '.';

  // @Input('repo')
  // @Optional
  // public readonly EcrRepoName: string = '';

  // @Input('tags') // comma-delimited string
  // @Optional
  // public readonly EcrTags: string = '';

  constructor() {
    this.loadRequired();
    this.loadOptional();
  }

  loadRequired() {
    const missingInputs: string[] = [];

    for(const prop of Object.keys(this)) {
      if (isRequired(this, prop)) {
        const inputName = getInputName(this, prop);
        const value = core.getInput(inputName);

        if (value.length === 0) {
          missingInputs.push(inputName);
        }

        if (!Reflect.set(this, prop, value)) {
          throw new Error(`Failed to set the value of [ ${inputName} ] during action setup`);
        }
      }
    }

    if (missingInputs.length > 0) {
      throw new Error(`Missing required inputs [ ${missingInputs.join(', ')} ]. Did you set using the 'with' property?`);
    }
  }

  loadOptional() {
    for(const prop of Object.keys(this)) {
      if (isOptional(this, prop)) {
        const inputName = getInputName(this, prop);
        const value = core.getInput(inputName);
        Reflect.set(this, prop, value);
      }
    }
  }
}
