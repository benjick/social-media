import * as pulumi from '@pulumi/pulumi';
import * as digitalocean from '@pulumi/digitalocean';
import { region } from './config';
import { kubeconfig } from './cluster';
import './nginx';
import './cert-manager';
import './synapse';

export { kubeconfig };

const i = pulumi.interpolate;

const vpc = new digitalocean.Vpc('dumhub', {
  region,
});
