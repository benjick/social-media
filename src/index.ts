process.env.PULUMI_K8S_SUPPRESS_HELM_HOOK_WARNINGS = 'plsdo';

import * as pulumi from '@pulumi/pulumi';
import * as digitalocean from '@pulumi/digitalocean';
import { region } from './config';
import { kubeconfig } from './cluster';
import './vendor/nginx';
import './vendor/cert-manager';
import './synapse/synapse';
import './auth';
import './www';

export { kubeconfig };

const i = pulumi.interpolate;

const vpc = new digitalocean.Vpc('dumhub', {
  region,
});
